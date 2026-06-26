import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
      <View style={styles.discoveredBanner}>
        <ThemedText style={styles.discoveredBannerText}>スポット発見！</ThemedText>
        <View style={styles.flagIconCircle}>
          <MaterialIcons name="flag" size={22} color="#C8A820" />
        </View>
      </View>

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
                accessibilityLabel="お気に入りに追加"
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
              <ThemedText style={styles.infoText}>{wikiSummary}</ThemedText>
            </View>
          </View>

          <View style={styles.coinBadge}>
            <ThemedText style={styles.coinBadgeText}>{coinEarned}</ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* ボタンエリア */}
      <View style={styles.buttonRow}>
        <Pressable style={styles.exitButton} onPress={onExit}>
          <ThemedText style={styles.exitButtonText}>終了する</ThemedText>
        </Pressable>
        <Pressable style={styles.continueButton} onPress={onContinue}>
          <ThemedText style={styles.continueButtonText}>続ける</ThemedText>
        </Pressable>
      </View>
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
  discoveredBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#C8A820",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  discoveredBannerText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "MochiyPopOne",
  },
  flagIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: "#C8A820",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
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
    top: 12,
    left: 52,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(50, 42, 28, 0.88)",
    borderRadius: 5,
  },
  spotName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  heartButton: {
    position: "absolute",
    bottom: 12,
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
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  exitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#aaaaaa",
  },
  exitButtonText: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "700",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#43A958",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
