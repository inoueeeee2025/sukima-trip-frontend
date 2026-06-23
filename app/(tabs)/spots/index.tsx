import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getSpots, Spot } from "@/api/spots";
import { getAccessToken } from "@/components/auth/auth-storage";

export default function SpotsScreen() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("位置情報の権限が必要です");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const token = await getAccessToken();
      if (!token) {
        setError("ログインが必要です");
        return;
      }

      const data = await getSpots(
        location.coords.latitude,
        location.coords.longitude,
        token
      );
      setSpots(data);
    } catch {
      setError("スポットの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1f6f5f" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>再試行</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>周辺のスポット</Text>
      </View>
      <FlatList
        data={spots}
        keyExtractor={(item) => item.place_id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>近くにスポットが見つかりませんでした</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(tabs)/spots/${item.place_id}`)}
          >
            <Text style={styles.spotName}>{item.name}</Text>
            <Text style={styles.spotDistance}>
              {item.distance_km < 1
                ? `${Math.round(item.distance_km * 1000)}m`
                : `${item.distance_km.toFixed(1)}km`}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f4ed",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f4ed",
    gap: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  list: {
    paddingHorizontal: 24,
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d5cec3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spotName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  spotDistance: {
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    marginTop: 32,
  },
  errorText: {
    color: "#c0392b",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#1f6f5f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
