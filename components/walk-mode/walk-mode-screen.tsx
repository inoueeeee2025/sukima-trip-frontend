import { useEffect, useRef, useState } from "react";
import { Image, ImageBackground, Pressable, StyleSheet, View } from "react-native";

import { arriveAtSpot, getNearestSpot, type ArriveResponse, type NearestSpotResponse } from "@/api/spots";
import { getAccessToken } from "@/components/auth/auth-storage";
import { SpotDiscoveredOverlay } from "@/components/walk-mode/spot-discovered-overlay";
import {
  StreetViewPanel,
  type StreetViewPosition,
  type StreetViewStatus,
} from "@/components/street-view/street-view-panel";
import { ThemedText } from "@/components/themed-text";

const signboardImage = require("@/assets/images/walk-mode/signboard.png");
const arrowImage = require("@/assets/images/walk-mode/arrow.png");

type WalkModeScreenProps = {
  latitude: number;
  longitude: number;
  locationName: string;
  remainingVirtualDistanceKm: number;
  onStatusChange: (status: StreetViewStatus) => void;
  onPositionChange: (position: StreetViewPosition) => void;
  onAddressChange: (address: string) => void;
  onExit: () => void;
};

export function WalkModeScreen({
  latitude,
  longitude,
  locationName,
  remainingVirtualDistanceKm,
  onStatusChange,
  onPositionChange,
  onAddressChange,
  onExit,
}: WalkModeScreenProps) {
  const [isNearestSpotCardOpen, setIsNearestSpotCardOpen] = useState(false);
  const [nearestSpot, setNearestSpot] = useState<NearestSpotResponse | null>(null);
  const [streetViewHeading, setStreetViewHeading] = useState(0);
  const [discoveredSpot, setDiscoveredSpot] = useState<
    (ArriveResponse & { spotName: string; placeId: string }) | null
  >(null);
  const lastFetchTimeRef = useRef<number>(0);
  const arrivedPlaceIdsRef = useRef<Set<string>>(new Set());

  async function fetchNearestSpot(lat: number, lng: number) {
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 3000) return;
    lastFetchTimeRef.current = now;

    const token = await getAccessToken();
    if (!token) return;

    try {
      const result = await getNearestSpot(lat, lng, token);
      setNearestSpot(result);

      if (result.distance_km < 0.2 && !arrivedPlaceIdsRef.current.has(result.place_id)) {
        arrivedPlaceIdsRef.current.add(result.place_id);
        try {
          const arrived = await arriveAtSpot(
            result.place_id,
            { place_name: result.name, lat, lng },
            token
          );
          setDiscoveredSpot({ ...arrived, spotName: result.name, placeId: result.place_id });
        } catch (arriveError) {
          console.error("[arriveAtSpot] failed:", arriveError);
          arrivedPlaceIdsRef.current.delete(result.place_id);
        }
      }
    } catch {
      // 取得失敗時は前回の値を維持
    }
  }

  // ウォーク開始時に初回取得
  useEffect(() => {
    fetchNearestSpot(latitude, longitude);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={styles.container}>
      <StreetViewPanel
        latitude={latitude}
        longitude={longitude}
        onStatusChange={onStatusChange}
        onPositionChange={(position) => {
          fetchNearestSpot(position.latitude, position.longitude);
          onPositionChange(position);
        }}
        onHeadingChange={setStreetViewHeading}
        onAddressChange={onAddressChange}
      />

      <View style={styles.remainingSignWrapper}>
        <ImageBackground
          source={signboardImage}
          style={styles.remainingSign}
          imageStyle={styles.remainingSignImage}
          resizeMode="contain"
        >
          <ThemedText style={styles.remainingLabel}>残り</ThemedText>
          <ThemedText style={styles.remainingNumber}>
            {remainingVirtualDistanceKm.toFixed(0)}
          </ThemedText>
          <ThemedText style={styles.remainingUnit}>km</ThemedText>
        </ImageBackground>
      </View>

      {!discoveredSpot && (
        <View style={styles.topOverlay}>
          <Pressable
            style={styles.directionButton}
            onPress={() => {
              setIsNearestSpotCardOpen((current) => !current);
            }}
            accessibilityRole="button"
            accessibilityLabel="最短スポットの方向"
          >
            <Image
              source={arrowImage}
              style={[
                styles.directionArrow,
                {
                  transform: [
                    {
                      rotate: `${((nearestSpot?.bearing ?? 0) - streetViewHeading + 360) % 360}deg`,
                    },
                  ],
                },
              ]}
            />
          </Pressable>

          <Pressable style={styles.closeButton} onPress={onExit}>
            <ThemedText style={styles.closeButtonText}>×</ThemedText>
          </Pressable>
        </View>
      )}

      {!discoveredSpot && isNearestSpotCardOpen ? (
        <View style={styles.nearestSpotCard}>
          <ThemedText style={styles.nearestSpotHeading}>
            最短スポット案内
          </ThemedText>
          <ThemedText style={styles.nearestSpotName}>
            {nearestSpot ? `${nearestSpot.name}まで` : "取得中..."}
          </ThemedText>
          {nearestSpot ? (
            <ThemedText style={styles.nearestSpotDistance}>
              約 {nearestSpot.distance_km.toFixed(1)} km
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      {!discoveredSpot && (
        <View style={styles.locationPill}>
          <ThemedText style={styles.locationText}>{locationName}</ThemedText>
        </View>
      )}

      {discoveredSpot && (
        <SpotDiscoveredOverlay
          spotName={discoveredSpot.spotName}
          placeId={discoveredSpot.placeId}
          coinEarned={discoveredSpot.coin_earned}
          photoUrl={discoveredSpot.photo_url}
          wikiSummary={discoveredSpot.wiki_summary}
          onContinue={() => setDiscoveredSpot(null)}
          onExit={onExit}
        />
      )}
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
    left: 0,
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
    marginLeft: 20,
  },
  directionArrow: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  remainingSignWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    marginTop: 0,
  },
  remainingSign: {
    width: 353,
    height: 131,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 5,
    overflow: "visible",
  },
  remainingSignImage: {
    borderRadius: 12,
  },
  remainingLabel: {
    color: "#111111",
    fontFamily: "MochiyPopOne",
    fontSize: 22,
    lineHeight: 28,
    marginRight: 9,
    marginBottom: 2,
  },
  remainingNumber: {
    color: "#A91F25",
    fontFamily: "MochiyPopOne",
    fontSize: 36,
    lineHeight: 50,
    letterSpacing: 1,
  },
  remainingUnit: {
    color: "#111111",
    fontFamily: "MochiyPopOne",
    fontSize: 16,
    lineHeight: 20,
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
    marginTop: -35,
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
    justifyContent: "center",
    alignItems: "center",
  },
  nearestSpotHeading: {
    color: "#EAF8E9",
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  nearestSpotName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 8,
  },
  nearestSpotDistance: {
    color: "#FFFFFF",
    fontSize: 23,
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
