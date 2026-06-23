import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { deleteFavorite, Favorite, getFavorites } from "@/api/favorites";
import { getAccessToken } from "@/components/auth/auth-storage";

const CARD_GAP = 12;
const SCREEN_PADDING = 16;
const CARD_WIDTH =
  (Dimensions.get("window").width - SCREEN_PADDING * 2 - CARD_GAP) / 2;

export default function FavoriteSpotsScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getAccessToken();
      if (!token) {
        setError("ログインが必要です");
        return;
      }
      const data = await getFavorites(token);
      setFavorites(data);
    } catch {
      setError("お気に入りの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleLike(item: Favorite) {
    setDeleteError(null);
    try {
      const token = await getAccessToken();
      if (!token) return;
      await deleteFavorite(item.id, token);
      setFavorites((prev) => prev.filter((f) => f.id !== item.id));
    } catch {
      setDeleteError("削除に失敗しました");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerBannerWrap}>
          <Image
            source={require("@/assets/images/spots/spots-header-banner.png")}
            style={styles.headerBanner}
          />
        </View>
      </View>

      {/* 削除エラー */}
      {deleteError ? (
        <Text style={styles.deleteErrorText}>{deleteError}</Text>
      ) : null}

      {/* コンテンツ */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>再試行</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                お気に入りスポットはまだありません
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/spots/[id]",
                  params: { id: item.place_id, name: item.name },
                })
              }
            >
              {/* 写真エリア */}
              <View style={styles.photoArea}>
                <View style={styles.photoPlaceholder} />
                {/* 番号バッジ */}
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{index + 1}</Text>
                </View>
                {/* ハートボタン */}
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={() => handleToggleLike(item)}
                >
                  <Text style={styles.heartIcon}>♥</Text>
                </TouchableOpacity>
              </View>
              {/* スポット名 */}
              <View style={styles.cardFooter}>
                <Text style={styles.spotName} numberOfLines={2}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#60d0e5",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: SCREEN_PADDING,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "700",
    lineHeight: 28,
  },
  headerBannerWrap: {
    flex: 1,
    height: 48,
  },
  headerBanner: {
    width: "100%",
    height: 48,
    resizeMode: "contain",
  },
  list: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 32,
    gap: CARD_GAP,
  },
  row: {
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#c8a800",
    backgroundColor: "#ffffff",
  },
  photoArea: {
    width: "100%",
    height: CARD_WIDTH * 0.8,
    position: "relative",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#b0e0ec",
  },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#c8a800",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  heartButton: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    fontSize: 14,
    color: "#e74c3c",
  },
  cardFooter: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  spotName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingTop: 60,
  },
  emptyText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteErrorText: {
    color: "#fff",
    backgroundColor: "rgba(200,0,0,0.5)",
    textAlign: "center",
    paddingVertical: 6,
    fontSize: 13,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
