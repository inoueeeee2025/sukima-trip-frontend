import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { login } from "@/api/auth";
import { ThemedText } from "@/components/themed-text";

export default function HomeScreen() {
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
      const result = await login({ email, password });

      Alert.alert("ログイン成功", `user_id: ${result.user_id}`);
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
        <ThemedText type="title">Login</ThemedText>
        <ThemedText style={styles.description}>
          Sukima Trip の認証確認用画面です。
        </ThemedText>

        <View style={styles.form}>
          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">メールアドレス</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="test@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">パスワード</ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          {errorMessage ? (
            <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
          ) : null}

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.button, isLoading && styles.buttonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <ThemedText style={styles.buttonText}>ログイン</ThemedText>
            )}
          </Pressable>
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
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 24,
  },
  description: {
    color: "#5f5a52",
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d5cec3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  errorText: {
    color: "#c0392b",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: "#1f6f5f",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
