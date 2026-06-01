import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/components/auth/use-auth";

export default function LoginScreen() {
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      router.replace("/(tabs)");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "ログインに失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AuthForm
          isRegisterMode={false}
          name=""
          gender=""
          email={email}
          password={password}
          errorMessage={errorMessage}
          isLoading={isLoading}
          onChangeName={() => {}}
          onChangeGender={() => {}}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onSubmit={handleLogin}
          onToggleMode={() => router.push("/(auth)/register")}
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
});