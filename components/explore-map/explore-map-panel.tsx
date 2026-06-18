import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { GOOGLE_MAPS_API_KEY } from "@/api/config";
import { ThemedText } from "@/components/themed-text";

type ExploreMapPanelProps = {
  latitude: number;
  longitude: number;
  zoom: number;
  onSelectPoint: (point: {
    screenX: number;
    screenY: number;
    latitude: number;
    longitude: number;
    name: string;
  }) => void;
  onCenterChanged: (center: {
    latitude: number;
    longitude: number;
    zoom: number;
  }) => void;
};

export function ExploreMapPanel({
  latitude,
  longitude,
  zoom,
  onSelectPoint,
  onCenterChanged,
}: ExploreMapPanelProps) {
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
        html, body, #map {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }
      </style>
      <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: ${latitude}, lng: ${longitude} },
          zoom: ${zoom},
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        });

        // 地図を動かし終わったタイミングで、
        // 今見ている中心とズームを親へ返す
        map.addListener("idle", () => {
          const center = map.getCenter();

          if (!center) {
            return;
          }

          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "centerChanged",
              latitude: center.lat(),
              longitude: center.lng(),
              zoom: map.getZoom(),
            })
          );
        });

        let marker = null;

        map.addListener("click", (event) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();

          if (marker) {
            marker.setMap(null);
          }

          marker = new google.maps.Marker({
            position: { lat, lng },
            map,
          });

          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              screenX: window.innerWidth / 2,
              screenY: window.innerHeight / 2,
              latitude: lat,
              longitude: lng,
              name: "選択地点",
            })
          );
        });
      </script>
    </body>
  </html>
`;

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={styles.webView}
      onMessage={(event) => {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === "centerChanged") {
          onCenterChanged({
            latitude: data.latitude,
            longitude: data.longitude,
            zoom: data.zoom,
          });
          return;
        }

        onSelectPoint(data);
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
