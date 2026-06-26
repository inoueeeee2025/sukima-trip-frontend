import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getProfile, ProfileResponse } from "@/api/profile";
import { getAccessToken } from "@/components/auth/auth-storage";
import { ThemedText } from "@/components/themed-text";
import { GENDER_LABELS } from "@/constants/gender";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getAccessToken();

      if (!token) {
        setError("ログインが必要です");
        return;
      }

      const result = await getProfile(token);
      setProfile(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "プロフィールを取得できませんでした");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">プロフィール</ThemedText>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1f6f5f" />
          </View>
        ) : error ? (
          <View style={styles.card}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <Pressable style={styles.retryButton} onPress={loadProfile}>
              <ThemedText style={styles.retryText}>再試行</ThemedText>
            </Pressable>
          </View>
        ) : profile ? (
          <>
            {/* アバター */}
            <View style={styles.avatarWrap}>
              {profile.avatar_url && !avatarError ? (
                <View style={styles.avatarClip}>
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.avatarImage}
                    onError={() => setAvatarError(true)}
                  />
                </View>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarIcon}>👤</Text>
                </View>
              )}
            </View>

            {/* プロフィール情報 */}
            <View style={styles.card}>
              <ThemedText>名前: {profile.name}</ThemedText>
              <ThemedText>ユーザーID: {profile.id}</ThemedText>
              <ThemedText>性別: {(profile.gender && GENDER_LABELS[profile.gender]) || profile.gender || "未設定"}</ThemedText>
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <ThemedText>プロフィールを取得できませんでした。</ThemedText>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f4ed",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 24,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  avatarWrap: {
    alignItems: "center",
  },
  avatarClip: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#d5cec3",
  },
  avatarImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#d0d0d0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    fontSize: 40,
  },
  card: {
    width: "100%",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d5cec3",
  },
  errorText: {
    color: "#c0392b",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#1f6f5f",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
