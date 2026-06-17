import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { GOOGLE_MAPS_API_KEY } from "@/api/config";
import { ThemedText } from "@/components/themed-text";

type ExploreMapPanelProps = {
  latitude: number;
  longitude: number;
};

export function ExploreMapPanel({
  latitude,
  longitude,
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
          new google.maps.Map(document.getElementById("map"), {
            center: { lat: ${latitude}, lng: ${longitude} },
            zoom: 16,
            disableDefaultUI: true,
            clickableIcons: false,
            gestureHandling: "greedy",
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