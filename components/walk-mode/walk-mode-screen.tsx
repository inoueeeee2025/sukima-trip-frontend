import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";

import {
  StreetViewPanel,
  type StreetViewPosition,
  type StreetViewStatus,
} from "@/components/street-view/street-view-panel";
import { ThemedText } from "@/components/themed-text";

const signboardImage = require("@/assets/images/walk-mode/signboard.png");

type WalkModeScreenProps = {
  latitude: number;
  longitude: number;
  remainingVirtualDistanceKm: number;
  onStatusChange: (status: StreetViewStatus) => void;
  onPositionChange: (position: StreetViewPosition) => void;
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
  const [isNearestSpotCardOpen, setIsNearestSpotCardOpen] = useState(true);
  return (
    <View style={styles.container}>
      <StreetViewPanel
        latitude={latitude}
        longitude={longitude}
        onStatusChange={onStatusChange}
        onPositionChange={onPositionChange}
      />

      <View style={styles.topOverlay}>
        <Pressable
          style={styles.directionButton}
          onPress={() => {
            setIsNearestSpotCardOpen((current) => !current);
          }}
        >
          <ThemedText style={styles.directionArrow}>
           ↑
          </ThemedText>
        </Pressable>

        <View style={styles.remainingSignWrapper}>
          <View style={styles.hangingLineLeft} />
          <View style={styles.hangingLineRight} />

          <ImageBackground
            source={signboardImage}
            style={styles.remainingSign}
            imageStyle={styles.remainingSignImage}
            resizeMode="stretch"
          >
            <ThemedText style={styles.remainingLabel}>残り</ThemedText>
            <ThemedText style={styles.remainingNumber}>
              {remainingVirtualDistanceKm.toFixed(0)}
            </ThemedText>
            <ThemedText style={styles.remainingUnit}>km</ThemedText>
          </ImageBackground>
        </View>

        <Pressable style={styles.closeButton} onPress={onExit}>
          <ThemedText style={styles.closeButtonText}>×</ThemedText>
        </Pressable>
      </View>

      {isNearestSpotCardOpen ? (
        <View style={styles.nearestSpotCard}>
          <ThemedText style={styles.nearestSpotHeading}>
            ^　最短スポット案内
          </ThemedText>
          <ThemedText style={styles.nearestSpotName}>
            エッフェル塔まで
          </ThemedText>
          <ThemedText style={styles.nearestSpotDistance}>約 200 km</ThemedText>
        </View>
      ) : null}
      
      <View style={styles.locationPill}>
        <ThemedText style={styles.locationText}>
          秋田市, 秋田県
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  topOverlay: {
    position: "absolute",
    top: 58,
    left: 22,
    right: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  directionButton: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#43A958",
  },
  directionArrow: {
    color: "#FFFFFF",
    fontSize: 64,
    lineHeight: 68,
    fontWeight: "300",
  },
  remainingSignWrapper: {
    position: "relative",
    minWidth: 190,
    alignItems: "center",
    marginTop: 1,
  },
  hangingLineLeft: {
    position: "absolute",
    top: -76,
    left: 43,
    width: 2,
    height: 84,
    backgroundColor: "rgba(92, 82, 70, 0.72)",
  },
  hangingLineRight: {
    position: "absolute",
    top: -76,
    right: 43,
    width: 2,
    height: 84,
    backgroundColor: "rgba(92, 82, 70, 0.72)",
  },
  remainingSign: {
    width: 210,
    height: 78,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingBottom: 15,
  },
  remainingSignImage: {
    borderRadius: 12,
  },
  remainingLabel: {
    color: "#111111",
    fontFamily: "MochiyPopOne",
    fontSize: 22,
    marginRight: 9,
    marginBottom: 2,
  },
  remainingNumber: {
    color: "#A91F25",
    fontFamily: "MochiyPopOne",
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: 1,
  },
  remainingUnit: {
    color: "#111111",
    fontFamily: "MochiyPopOne",
    fontSize: 16,
    marginLeft: 8,
    marginBottom: 4,
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#B11F2C",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
  },
  nearestSpotCard: {
    position: "absolute",
    top: 143,
    left: 22,
    width: 170,
    minHeight: 92,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(60, 165, 83, 0.88)",
  },
  nearestSpotHeading: {
    color: "#EAF8E9",
    fontSize: 12,
    fontWeight: "700",
  },
  nearestSpotName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
  nearestSpotDistance: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 8,
  },
  locationPill: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(24, 24, 24, 0.84)",
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});
