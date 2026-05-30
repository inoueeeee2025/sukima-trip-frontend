import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import { register } from "@/api/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/components/auth/use-auth";

export default function HomeScreen() {
  const { isLoggedIn, isCheckingAuth, loginUser, logoutUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setErrorMessage("メールアドレスとパスワードを入力してください");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      Alert.alert("ログイン成功", `user_id: ${result.user_id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "ログインに失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister() {
    if (!email || !password || !name) {
      setErrorMessage("メールアドレス、パスワード、名前を入力してください");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      await register({ email, password, name, gender });

      Alert.alert("登録成功", "ログイン画面からログインしてください");
      setIsRegisterMode(false);
      setPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "新規登録に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await logoutUser();
    setEmail("");
    setPassword("");
    setErrorMessage("");
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

  if (isLoggedIn) {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AuthForm
          isRegisterMode={isRegisterMode}
          name={name}
          gender={gender}
          email={email}
          password={password}
          errorMessage={errorMessage}
          isLoading={isLoading}
          onChangeName={setName}
          onChangeGender={setGender}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onSubmit={isRegisterMode ? handleRegister : handleLogin}
          onToggleMode={() => {
            setIsRegisterMode(!isRegisterMode);
            setErrorMessage("");
          }}
        />
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
