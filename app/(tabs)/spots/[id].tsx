import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { likeSpot, unlikeSpot } from "@/api/spots";
import { getAccessToken } from "@/components/auth/auth-storage";

export default function SpotDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

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
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>スポットが見つかりません</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.placeId}>スポット ID: {id}</Text>
          <Text style={styles.note}>詳細情報は #92 で実装予定</Text>
        </View>

        <TouchableOpacity
          style={[styles.likeButton, liked && styles.likeButtonActive]}
          onPress={toggleLike}
          disabled={isLiking}
        >
          {isLiking ? (
            <ActivityIndicator color={liked ? "#fff" : "#1f6f5f"} />
          ) : (
            <Text style={[styles.likeText, liked && styles.likeTextActive]}>
              {liked ? "♥ いいね済み" : "♡ いいね"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backText: {
    color: "#1f6f5f",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d5cec3",
    gap: 8,
  },
  placeId: {
    fontSize: 14,
    color: "#888",
  },
  note: {
    fontSize: 14,
    color: "#aaa",
  },
  likeButton: {
    borderWidth: 2,
    borderColor: "#1f6f5f",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  likeButtonActive: {
    backgroundColor: "#1f6f5f",
  },
  likeText: {
    color: "#1f6f5f",
    fontWeight: "700",
    fontSize: 16,
  },
  likeTextActive: {
    color: "#fff",
  },
  errorText: {
    color: "#c0392b",
    fontSize: 14,
  },
});
