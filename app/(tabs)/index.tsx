import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/components/auth/use-auth";
import { getProfile, ProfileResponse } from "@/api/profile";
import { getAccessToken } from "@/components/auth/auth-storage";

export default function HomeScreen() {
  const { isLoggedIn, isCheckingAuth, logoutUser } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

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
      setIsProfileLoading(false);
    }
  }

  loadProfile();
}, []);//ホーム画面が開いた時にプロフィール取得が走る、tokenを読んで/profileを叩く、結果をprofile　stateに入れる

  async function handleLogout() {
    await logoutUser();
  }

  if (isCheckingAuth) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#1f6f5f" />
          <ThemedText>ログイン状態を確認中です...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <ThemedText type="title">Sukima Trip</ThemedText>
          <ThemedText style={styles.description}>
            すきま時間の移動やスポット記録をここから見ていきます。
          </ThemedText>
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="defaultSemiBold">プロフィール</ThemedText>
          {isProfileLoading ? (
            <ThemedText>読み込み中です...</ThemedText>
          ) : profile ? (
            <>
              <ThemedText>名前: {profile.name}</ThemedText>
              <ThemedText>ユーザーID: {profile.id}</ThemedText>
            </>
          ) : (
            <ThemedText>プロフィールを取得できませんでした。</ThemedText>
          )}
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="defaultSemiBold">移動データ</ThemedText>
          <ThemedText>movements 系 API をつないでここに表示します。</ThemedText>
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="defaultSemiBold">スポット</ThemedText>
          <ThemedText>Spots 一覧や visited 情報につなげていきます。</ThemedText>
        </View>

        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <ThemedText style={styles.buttonText}>ログアウト</ThemedText>
        </Pressable>
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
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 24,
  },
  description: {
    color: "#5f5a52",
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  hero: {
    gap: 8,
  },
  sectionCard: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d5cec3",
  },
  logoutButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: "#1f6f5f",
  },
});
