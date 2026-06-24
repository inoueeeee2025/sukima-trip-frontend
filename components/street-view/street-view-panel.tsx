import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { GOOGLE_MAPS_API_KEY } from "@/api/config";
import { ThemedText } from "@/components/themed-text";

export type StreetViewPosition = {
  latitude: number;
  longitude: number;
};

type StreetViewPanelProps = {
  latitude: number;
  longitude: number;
  onStatusChange?: (status: StreetViewStatus) => void;
  onPositionChange?: (position: StreetViewPosition) => void;
};

type StreetViewStatus =
  | "loading"
  | "ready"
  | "not_found"
  | "script_error"
  | "unknown_error";

export function StreetViewPanel({
  latitude,
  longitude,
  onStatusChange,
  onPositionChange,
}: StreetViewPanelProps) {
  const WebViewRef = useRef<WebView>(null);

  useEffect(() => {
    WebViewRef.current?.injectJavaScript(`
       if (window.updateStreetViewPosition) {
        window.updateStreetViewPosition(${latitude}, ${longitude});
      }
      true;
    `);
  }, [latitude, longitude]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <View style={styles.fallback}>
        <ThemedText>Google Maps API Keyが未設定です。</ThemedText>
      </View>
    );
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <style>
          html, body, #street-view {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}"></script>
      </head>
      <body>
        <div id="street-view"></div>
        <script>
          let panorama;

          // WebView内の状態をReact Native側へ送る
          function notifyStatus(status, detail) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "streetViewStatus",
                status: status,
                detail: detail || null
              })
            );
          }

          function initStreetView() {
            notifyStatus("loading");
            showNearestStreetView(${latitude}, ${longitude});
          }

          function createOrMovePanorama(position) {
            if (!panorama) {
              panorama = new google.maps.StreetViewPanorama(
                document.getElementById("street-view"),
                {
                  position: position,
                  pov: { heading: 0, pitch: 0 },
                  zoom: 1,
                  clickToGo: true,
                  linksControl: true,
                  disableDefaultUI: false
                }
              );

              // Street Viewの表示地点が変わった時に新しい座標をReact Native側へ送る
              panorama.addListener("position_changed", function() {
                const currentPosition = panorama.getPosition();

                if (!currentPosition) {
                  return;
                }

                window.ReactNativeWebView.postMessage(
                  JSON.stringify({
                    type: "streetViewPositionChanged",
                    latitude: currentPosition.lat(),
                    longitude: currentPosition.lng()
                  })
                );
              });

              return;
            }

            panorama.setPosition(position);
          }

          function findPanoramaByRadius(service, requestedPosition, radiuses, index) {
            if (index >= radiuses.length) {
              notifyStatus(
                "not_found",
                "Street View data was not found near this point."
              );
              return;
            }

            const radius = radiuses[index];

            service.getPanorama(
              {
                location: requestedPosition,
                radius: radius,
                source: google.maps.StreetViewSource.OUTDOOR
              },
              function(data, status) {
                if (status === google.maps.StreetViewStatus.OK && data.location) {
                  // 選択座標そのものではなく、実際に見つかったパノラマ位置へ移動する
                  createOrMovePanorama(data.location.latLng);
                  notifyStatus("ready", "radius:" + radius);
                  return;
                }

                findPanoramaByRadius(service, requestedPosition, radiuses, index + 1);
              }
            );
          }

          function showNearestStreetView(lat, lng) {
            notifyStatus("loading");

            try {
              const streetViewService = new google.maps.StreetViewService();
              const requestedPosition = { lat: lat, lng: lng };

              // 近い範囲から順に探して、見つからなければ探索半径を広げる
              findPanoramaByRadius(
                streetViewService,
                requestedPosition,
                [50, 100, 500],
                0
              );
            } catch (error) {
              notifyStatus("script_error", String(error));
            }
          }

          window.updateStreetViewPosition = function(lat, lng) {
            showNearestStreetView(lat, lng);
          };

        initStreetView();
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      ref={WebViewRef}
      originWhitelist={["*"]}
      source={{ html }}
      style={styles.webView}
      onMessage={(event) => {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === "streetViewStatus") {
          onStatusChange?.(data.status);
          return;
        }

        if (data.type === "streetViewPositionChanged") {
          onPositionChange?.({
            latitude: data.latitude,
            longitude: data.longitude,
          });
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
