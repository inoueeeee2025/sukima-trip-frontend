import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getPlaceFirstPhotoUrl } from "@/api/places";
import { likeSpot, unlikeSpot } from "@/api/spots";
import { getAccessToken } from "@/components/auth/auth-storage";

const CARD_WIDTH = Dimensions.get("window").width * 0.72;

export default function SpotDetailScreen() {
  const { id, name, coin_amount } = useLocalSearchParams<{
    id: string;
    name: string;
    coin_amount?: string;
  }>();

  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPlaceFirstPhotoUrl(id).then((url) => {
      setPhotoUrl(url);
      setIsPhotoLoading(false);
    });
  }, [id]);

  async function toggleLike() {
    if (isLiking || !id) return;
    setIsLiking(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      if (liked) {
        await unlikeSpot(id, token);
        setLiked(false);
      } else {
        await likeSpot(id, name ?? id, token);
        setLiked(true);
      }
    } catch {
      // keep current state on error
    } finally {
      setIsLiking(false);
    }
  }

  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>スポットが見つかりません</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>← 戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 戻るボタン */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      {/* カード（画面中央に浮かせる） */}
      <View style={styles.floatArea}>
        <View style={styles.cardOuter}>
          <View style={styles.card}>
            {/* 写真エリア */}
            <View style={styles.photoArea}>
              {isPhotoLoading ? (
                <View style={styles.photoPlaceholder}>
                  <ActivityIndicator color="#ffffff" />
                </View>
              ) : photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder} />
              )}

              {/* スポット名バナー */}
              <View style={styles.nameBanner}>
                <Text style={styles.spotName} numberOfLines={1}>
                  {name}
                </Text>
              </View>

              {/* ハートボタン */}
              <TouchableOpacity
                style={styles.heartButton}
                onPress={toggleLike}
                disabled={isLiking}
              >
                {isLiking ? (
                  <ActivityIndicator size="small" color="#cccccc" />
                ) : (
                  <Image
                    source={require("@/assets/images/spots/like-icon.png")}
                    style={[styles.heartIcon, !liked && styles.heartIconInactive]}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* 下部エリア */}
            <View style={styles.bottomArea} />
          </View>

          {/* コインバッジ */}
          <View style={styles.coinBadge}>
            <Text style={styles.coinBadgeText}>{coin_amount ?? "0"}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#60d0e5",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  floatArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  backArrow: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "700",
    lineHeight: 28,
  },
  backText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#ffffff",
    fontSize: 14,
  },
  cardOuter: {
    width: CARD_WIDTH,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
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
    aspectRatio: 1,
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
    justifyContent: "center",
    alignItems: "center",
  },
  nameBanner: {
    position: "absolute",
    top: 12,
    left: 44,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(50, 42, 28, 0.88)",
    borderRadius: 5,
  },
  spotName: {
    fontSize: 12,
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
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  heartIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  heartIconInactive: {
    opacity: 0.35,
  },
  bottomArea: {
    height: 100,
    backgroundColor: "#f0e8d0",
  },
  coinBadge: {
    position: "absolute",
    top: -10,
    left: -10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e8b800",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  coinBadgeText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
