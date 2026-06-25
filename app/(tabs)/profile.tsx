import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import { getProfile, ProfileResponse } from "@/api/profile";
import { getAccessToken } from "@/components/auth/auth-storage";
import { ThemedText } from "@/components/themed-text";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        <View style={styles.card}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#1f6f5f" />
          ) : error ? (
            <>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <Pressable style={styles.retryButton} onPress={loadProfile}>
                <ThemedText style={styles.retryText}>再試行</ThemedText>
              </Pressable>
            </>
          ) : profile ? (
            <>
              <ThemedText>名前: {profile.name}</ThemedText>
              <ThemedText>ユーザーID: {profile.id}</ThemedText>
              <ThemedText>性別: {profile.gender || "未設定"}</ThemedText>
            </>
          ) : null}
        </View>
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
  },
  card: {
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
