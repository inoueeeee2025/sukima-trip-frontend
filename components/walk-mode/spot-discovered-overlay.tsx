import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { likeSpot, unlikeSpot } from "@/api/spots";
import { getAccessToken } from "@/components/auth/auth-storage";
import { ThemedText } from "@/components/themed-text";

const spotDiscoveredBanner = require("@/assets/images/walk-mode/spot-discovered-banner.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.86;

type Props = {
  spotName: string;
  placeId: string;
  coinEarned: number;
  photoUrl: string;
  wikiSummary: string;
  onContinue: () => void;
  onExit: () => void;
};

export function SpotDiscoveredOverlay({
  spotName,
  placeId,
  coinEarned,
  photoUrl,
  wikiSummary,
  onContinue,
  onExit,
}: Props) {
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  async function toggleLike() {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      if (liked) {
        await unlikeSpot(placeId, token);
        setLiked(false);
      } else {
        await likeSpot(placeId, spotName, token);
        setLiked(true);
      }
    } catch {
      // keep current state on error
    } finally {
      setIsLiking(false);
    }
  }

  return (
    <View style={styles.overlay}>
      {/* スポット発見！バナー */}
      <Image
        source={spotDiscoveredBanner}
      />

      {/* スポットカード */}
      <ScrollView
        style={styles.cardScroll}
        contentContainerStyle={styles.cardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardOuter}>
          <View style={styles.card}>
            <View style={styles.photoArea}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder} />
              )}

              <View style={styles.nameBanner}>
                <ThemedText style={styles.spotName} numberOfLines={1}>
                  {spotName}
                </ThemedText>
              </View>

              <Pressable
                style={[styles.heartButton, !liked && styles.heartButtonInactive]}
                onPress={toggleLike}
                disabled={isLiking}
                accessibilityRole="button"
                accessibilityLabel={liked ? "お気に入りから削除" : "お気に入りに追加"}
              >
                {isLiking ? (
                  <ActivityIndicator size="small" color={liked ? "#ffffff" : "#e74c3c"} />
                ) : (
                  <ThemedText style={[styles.heartIcon, !liked && styles.heartIconInactive]}>
                    {liked ? "♥" : "♡"}
                  </ThemedText>
                )}
              </Pressable>
            </View>

            <View style={styles.infoArea}>
              <ThemedText style={styles.infoTitle}>基本情報</ThemedText>
              <ThemedText style={styles.infoText}>
                {wikiSummary || "情報を取得できませんでした。"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.coinBadge}>
            <ThemedText style={styles.coinBadgeText}>{coinEarned}</ThemedText>
          </View>
        </View>

        {/* ボタンエリア（カード直下） */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.exitButton} onPress={onExit}>
            <ThemedText style={styles.exitButtonText}>終了する</ThemedText>
          </Pressable>
          <Pressable style={styles.continueButton} onPress={onContinue}>
            <ThemedText style={styles.continueButtonText}>続ける</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 131,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "column",
  },
  cardScroll: {
    flex: 1,
  },
  cardContent: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  cardOuter: {
    width: CARD_WIDTH,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#c8b87a",
    backgroundColor: "#f0e8d0",
  },
  photoArea: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#b0d8e8",
  },
  nameBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(50, 42, 28, 0.88)",
  },
  spotName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e74c3c",
    alignItems: "center",
    justifyContent: "center",
  },
  heartButtonInactive: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e74c3c",
  },
  heartIcon: {
    fontSize: 20,
    color: "#ffffff",
  },
  heartIconInactive: {
    color: "#e74c3c",
  },
  infoArea: {
    padding: 14,
    gap: 8,
  },
  infoTitle: {
    color: "#333333",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "NotoSerifJP",
  },
  infoText: {
    color: "#444444",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "NotoSerifJP",
  },
  coinBadge: {
    position: "absolute",
    top: -12,
    left: -12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e8b800",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  coinBadgeText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: CARD_WIDTH,
    paddingTop: 16,
    paddingBottom: 24,
  },
  exitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#555555",
    alignItems: "center",
  },
  exitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#9B1C1C",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
