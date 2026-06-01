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
        <ThemedText type="title">Home</ThemedText>
        <ThemedText style={styles.description}>
          ログイン済みです。ここを仮ホームとして使います。
        </ThemedText>

        <View style={styles.homeCard}>
          <ThemedText type="defaultSemiBold">Sukima Trip</ThemedText>
          <ThemedText>
            ここからホーム画面や移動ログ画面を広げていく予定です。
          </ThemedText>
        </View>

        <Pressable onPress={handleLogout} style={styles.button}>
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
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: "#1f6f5f",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  homeCard: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d5cec3",
  },
});