import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { register } from "@/api/auth";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      router.replace("/(auth)/login");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "新規登録に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AuthForm
          isRegisterMode
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
          onSubmit={handleRegister}
          onToggleMode={() => router.push("/(auth)/login")}
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