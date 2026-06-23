import { useFocusEffect } from "expo-router";
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

const CARD_GAP = 10;
const SCREEN_PADDING = 16;
const CARD_WIDTH =
  (Dimensions.get("window").width - SCREEN_PADDING * 2 - CARD_GAP) / 2;

export default function FavoriteSpotsScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function handleDelete(id: string) {
    try {
      const token = await getAccessToken();
      if (!token) return;
      await deleteFavorite(id, token);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch {
      // keep current state on error
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.headerWrap}>
        <Image
          source={require("@/assets/images/spots/spot-title-banner.png")}
          style={styles.headerBanner}
        />
        <Text style={styles.headerText}>お気に入りスポット</Text>
        <Image
          source={require("@/assets/images/home/map1/explore-character.png")}
          style={styles.headerCharacter}
        />
      </View>

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
            <View style={styles.card}>
              {/* 写真プレースホルダー */}
              <View style={styles.photoPlaceholder} />
              <View style={styles.cardFooter}>
                <Text style={styles.spotName} numberOfLines={2}>
                  {item.place_name}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  headerWrap: {
    marginHorizontal: SCREEN_PADDING,
    marginTop: 16,
    marginBottom: 12,
    height: 52,
    justifyContent: "center",
  },
  headerBanner: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 52,
    width: "100%",
    resizeMode: "stretch",
  },
  headerText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 16,
  },
  headerCharacter: {
    position: "absolute",
    right: -8,
    bottom: 0,
    width: 52,
    height: 60,
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
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
  },
  photoPlaceholder: {
    width: "100%",
    height: CARD_WIDTH * 0.75,
    backgroundColor: "#b0e0ec",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  spotName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  deleteText: {
    fontSize: 12,
    color: "#aaa",
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
