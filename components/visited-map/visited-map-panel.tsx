import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { GOOGLE_MAPS_API_KEY } from "@/api/config";
import { ThemedText } from "@/components/themed-text";

type VisitedRoutePoint = {
  latitude: number;
  longitude: number;
};

type VisitedMapPanelProps = {
  latitude: number;
  longitude: number;
  zoom: number;
  visitedRoute: VisitedRoutePoint[];
  onCenterChanged: (center: {
    latitude: number;
    longitude: number;
    zoom: number;
  }) => void;
};

export function VisitedMapPanel({
  latitude,
  longitude,
  zoom,
  visitedRoute,
  onCenterChanged,
}: VisitedMapPanelProps) {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <View style={styles.fallback}>
        <ThemedText>Google Maps API Keyが未設定です。</ThemedText>
      </View>
    );
  }

  // Polyline は { lat, lng } の配列を使うので、表示用に形を変える
  const visitedRouteJson = JSON.stringify(
    visitedRoute.map((point) => ({
      lat: point.latitude,
      lng: point.longitude,
    }))
  );

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
          const visitedRoute = ${visitedRouteJson};

          const map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: ${latitude}, lng: ${longitude} },
            zoom: ${zoom},
            disableDefaultUI: true,
            clickableIcons: false,
            gestureHandling: "greedy",
          });

          // 通った道筋を色付きの線で表示する
          if (visitedRoute.length > 1) {
            new google.maps.Polyline({
              path: visitedRoute,
              geodesic: true,
              strokeColor: "#1f6f5f",
              strokeOpacity: 0.9,
              strokeWeight: 5,
              map,
            });
          }

          // 通常時の地図を動かした結果も親へ返して、
          // Explore mode と同じ場所・同じ縮尺を共有する
          map.addListener("idle", () => {
            const center = map.getCenter();

            if (!center) {
              return;
            }

            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                latitude: center.lat(),
                longitude: center.lng(),
                zoom: map.getZoom(),
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
        onCenterChanged({
          latitude: data.latitude,
          longitude: data.longitude,
          zoom: data.zoom,
        });
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
