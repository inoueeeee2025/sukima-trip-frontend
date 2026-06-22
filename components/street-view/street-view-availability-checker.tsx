import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { GOOGLE_MAPS_API_KEY } from "@/api/config";

type StreetViewCheckPoint = {
  name: string;
  latitude: number;
  longitude: number;
};

type StreetViewAvailabilityResult =
  | {
      status: "ready";
      latitude: number;
      longitude: number;
    }
  | {
      status: "not_found" | "script_error" | "unknown_error";
    };

type StreetViewAvailabilityCheckerProps = {
  point: StreetViewCheckPoint;
  onResult: (result: StreetViewAvailabilityResult) => void;
};

export function StreetViewAvailabilityChecker({
  point,
  onResult,
}: StreetViewAvailabilityCheckerProps) {
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      onResult({ status: "script_error" });
    }
  }, [onResult]);

  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}"></script>
      </head>
      <body>
        <script>
          function notifyResult(result) {
            window.ReactNativeWebView.postMessage(JSON.stringify(result));
          }

          function findPanoramaByRadius(service, requestedPosition, radiuses, index) {
            if (index >= radiuses.length) {
              notifyResult({ status: "not_found" });
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
                  const nearestPosition = data.location.latLng;

                  // 選択座標そのものではなく、実際にStreet Viewがある座標をReact Native側へ返す
                  notifyResult({
                    status: "ready",
                    latitude: nearestPosition.lat(),
                    longitude: nearestPosition.lng()
                  });
                  return;
                }

                findPanoramaByRadius(service, requestedPosition, radiuses, index + 1);
              }
            );
          }

          function checkStreetViewAvailability() {
            try {
              const streetViewService = new google.maps.StreetViewService();
              const requestedPosition = {
                lat: ${point.latitude},
                lng: ${point.longitude}
              };

              // 近い範囲から順に探して、見つかった時だけWalk modeへ進める
              findPanoramaByRadius(
                streetViewService,
                requestedPosition,
                [50, 100, 500],
                0
              );
            } catch (error) {
              notifyResult({ status: "script_error" });
            }
          }

          checkStreetViewAvailability();
        </script>
      </body>
    </html>
  `;

  return (
    <View pointerEvents="none" style={styles.hiddenChecker}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={(event) => {
          try {
            onResult(JSON.parse(event.nativeEvent.data));
          } catch {
            onResult({ status: "unknown_error" });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenChecker: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
});
