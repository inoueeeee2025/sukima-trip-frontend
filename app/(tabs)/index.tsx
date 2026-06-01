import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/components/auth/use-auth";

export default function HomeScreen() {
  const { isLoggedIn, isCheckingAuth, logoutUser } = useAuth();

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
          <ThemedText>ユーザー情報をここに表示していく予定です。</ThemedText>
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
