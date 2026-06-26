import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getPlaceFirstPhotoUrl } from "@/api/places";
import { deleteFavorite, Favorite, getFavorites } from "@/api/favorites";
import { getAccessToken } from "@/components/auth/auth-storage";

const CARD_GAP = 12;
const SCREEN_PADDING = 16;
const CARD_WIDTH =
  (Dimensions.get("window").width - SCREEN_PADDING * 2 - CARD_GAP) / 2;
const DETAIL_CARD_WIDTH = Dimensions.get("window").width * 0.72;

export default function FavoriteSpotsScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Favorite | null>(null);
  const [detailPhotoUrl, setDetailPhotoUrl] = useState<string | null>(null);
  const [isDetailPhotoLoading, setIsDetailPhotoLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  useEffect(() => {
    if (!selectedItem) {
      setDetailPhotoUrl(null);
      return;
    }
    setIsDetailPhotoLoading(true);
    getPlaceFirstPhotoUrl(selectedItem.place_id).then((url) => {
      setDetailPhotoUrl(url);
      setIsDetailPhotoLoading(false);
    });
  }, [selectedItem]);

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
      setSelectedItem(null);
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
          renderItem={({ item }) => (
            <View style={styles.cardOuter}>
              <View style={styles.card}>
                {/* 写真エリア（タップで詳細オーバーレイ表示） */}
                <TouchableOpacity
                  style={styles.photoArea}
                  onPress={() => setSelectedItem(item)}
                >
                  <View style={styles.photoPlaceholder} />
                  {/* スポット名バナー：写真上にオーバーレイ */}
                  <View style={styles.nameBanner}>
                    <Text style={styles.spotName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
                {/* 下部ボタンストリップ */}
                <View style={styles.bottomStrip}>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => setSelectedItem(item)}
                  >
                    <Text style={styles.detailButtonText}>∨</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => handleToggleLike(item)}
                  >
                    <Text style={styles.heartIcon}>♥</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* コインバッジ：カード左上角にオーバーラップ */}
              <View style={styles.coinBadge}>
                <Text style={styles.coinBadgeText}>{item.coin_amount ?? 0}</Text>
              </View>
            </View>
          )}
        />
      )}

      {/* 詳細モーダル */}
      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedItem(null)}>
          <Pressable onPress={() => {}}>
            <View style={styles.detailCardOuter}>
              <View style={styles.detailCard}>
                {/* 写真エリア */}
                <View style={styles.detailPhotoArea}>
                  {isDetailPhotoLoading ? (
                    <View style={styles.detailPhotoPlaceholder}>
                      <ActivityIndicator color="#ffffff" />
                    </View>
                  ) : detailPhotoUrl ? (
                    <Image
                      source={{ uri: detailPhotoUrl }}
                      style={styles.detailPhotoImage}
                    />
                  ) : (
                    <View style={styles.detailPhotoPlaceholder} />
                  )}

                  {/* スポット名バナー */}
                  <View style={styles.detailNameBanner}>
                    <Text style={styles.detailSpotName} numberOfLines={1}>
                      {selectedItem?.name}
                    </Text>
                  </View>

                  {/* ハートボタン */}
                  <TouchableOpacity
                    style={styles.detailHeartButton}
                    onPress={() => selectedItem && handleToggleLike(selectedItem)}
                  >
                    <Image
                      source={require("@/assets/images/spots/like-icon.png")}
                      style={styles.detailHeartIcon}
                    />
                  </TouchableOpacity>
                </View>

                {/* 下部エリア */}
                <View style={styles.detailBottomArea} />
              </View>

              {/* コインバッジ */}
              <View style={styles.detailCoinBadge}>
                <Text style={styles.detailCoinBadgeText}>
                  {selectedItem?.coin_amount ?? 0}
                </Text>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  cardOuter: {
    width: CARD_WIDTH,
    position: "relative",
  },
  card: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#c8b87a",
    backgroundColor: "#f0e8d0",
  },
  photoArea: {
    width: "100%",
    height: CARD_WIDTH * 0.82,
    position: "relative",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#b0d8e8",
  },
  nameBanner: {
    position: "absolute",
    top: 10,
    left: 50,
    right: 8,
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
  bottomStrip: {
    height: 42,
    backgroundColor: "#f0e8d0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  detailButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#888888",
    alignItems: "center",
    justifyContent: "center",
  },
  detailButtonText: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 16,
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e74c3c",
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    fontSize: 18,
    color: "#ffffff",
  },
  coinBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8b800",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  coinBadgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
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
  // --- 詳細モーダル ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailCardOuter: {
    width: DETAIL_CARD_WIDTH,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  detailCard: {
    width: DETAIL_CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#c8b87a",
    backgroundColor: "#f0e8d0",
  },
  detailPhotoArea: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
  },
  detailPhotoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  detailPhotoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#b0d8e8",
    justifyContent: "center",
    alignItems: "center",
  },
  detailNameBanner: {
    position: "absolute",
    top: 12,
    left: 44,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(50, 42, 28, 0.88)",
    borderRadius: 5,
  },
  detailSpotName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  detailHeartButton: {
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
  detailHeartIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  detailBottomArea: {
    height: 100,
    backgroundColor: "#f0e8d0",
  },
  detailCoinBadge: {
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
  detailCoinBadgeText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
