import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";

import { getProfile, ProfileResponse } from "@/api/profile";
import { getAccessToken } from "@/components/auth/auth-storage";
import { ThemedText } from "@/components/themed-text";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = await getAccessToken();

        if (!token) {
          setProfile(null);
          return;
        }

        const result = await getProfile(token);
        setProfile(result);
      } catch (error) {
        console.error("プロフィール取得に失敗しました", error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">プロフィール</ThemedText>

        <View style={styles.card}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#1f6f5f" />
          ) : profile ? (
            <>
              <ThemedText>名前: {profile.name}</ThemedText>
              <ThemedText>ユーザーID: {profile.id}</ThemedText>
              <ThemedText>性別: {profile.gender || "未設定"}</ThemedText>
            </>
          ) : (
            <ThemedText>プロフィールを取得できませんでした。</ThemedText>
          )}
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
});