import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  StreetViewPanel,
  type StreetViewPosition,
  type StreetViewStatus,
} from "@/components/street-view/street-view-panel";
import { ThemedText } from "@/components/themed-text";

type WalkModeScreenProps = {
  latitude: number;
  longitude: number;
  remainingVirtualDistanceKm: number;
  onStatusChange: (status: StreetViewStatus) => void;
  onPositionChange: (
    position: StreetViewPosition
  ) => void;
  onExit: () => void;
};

export function WalkModeScreen({
  latitude,
  longitude,
  remainingVirtualDistanceKm,
  onStatusChange,
  onPositionChange,
  onExit,
}: WalkModeScreenProps) {
  return (
    <View style={styles.container}>
      <StreetViewPanel
        latitude={latitude}
        longitude={longitude}
        onStatusChange={onStatusChange}
        onPositionChange={onPositionChange}
      />

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={onExit}
        >
          <ThemedText style={styles.backButtonText}>
            戻る
          </ThemedText>
        </Pressable>

        <View style={styles.distanceBadge}>
          <ThemedText style={styles.distanceText}>
            残り{" "}
            {remainingVirtualDistanceKm.toFixed(1)}
            km
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  header: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  backButtonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
  },
  distanceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  distanceText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
  },
});