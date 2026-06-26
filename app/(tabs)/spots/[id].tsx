import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getPlaceFirstPhotoUrl } from "@/api/places";
import { likeSpot, unlikeSpot } from "@/api/spots";
import { getAccessToken } from "@/components/auth/auth-storage";
import { FavoriteSpotDetailCard } from "@/components/spots/favorite-spot-detail-card";

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
    let cancelled = false;
    setIsPhotoLoading(true);
    setPhotoUrl(null);
    getPlaceFirstPhotoUrl(id).then((url) => {
      if (!cancelled) {
        setPhotoUrl(url);
        setIsPhotoLoading(false);
      }
    });
    return () => { cancelled = true; };
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
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      <View style={styles.floatArea}>
        <FavoriteSpotDetailCard
          name={name ?? ""}
          coinAmount={Number(coin_amount ?? 0)}
          photoUrl={photoUrl}
          isPhotoLoading={isPhotoLoading}
          liked={liked}
          isLiking={isLiking}
          onHeartPress={toggleLike}
        />
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
  errorText: {
    color: "#ffffff",
    fontSize: 14,
  },
});
