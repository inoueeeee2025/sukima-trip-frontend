import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/components/auth/use-auth";
import { AppColors } from "@/constants/theme";

export default function LoginScreen() {
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  async function handleLogin() {
    if (!email || !password) {
      setErrorMessage("メールアドレスとパスワードを入力してください");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      await loginUser(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "ログインに失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* アイコン */}
        <Image
          source={require("@/assets/images/splash/login-icon.png")}
          style={styles.icon}
        />

        {/* 入力フォーム */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder=""
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>パスワード</Text>
            <TextInput
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              placeholder=""
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              style={styles.input}
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.button, isLoading && styles.buttonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <Text style={styles.buttonText}>ログイン</Text>
            )}
          </Pressable>
        </View>

        {/* 区切り線 */}
        <View style={styles.divider} />

        {/* 新規登録 */}
        <View style={styles.registerSection}>
          <Text style={styles.registerHint}>初めての方はこちら</Text>
          <Pressable
            onPress={() => router.push("/(auth)/register")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>新規登録へ</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 40,
    gap: 32,
  },
  icon: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  form: {
    width: "100%",
    gap: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  input: {
    backgroundColor: AppColors.inputBackground,
    borderWidth: 2,
    borderColor: AppColors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    width: "100%",
  },
  errorText: {
    color: AppColors.inputBorder,
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    backgroundColor: AppColors.danger,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: AppColors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: AppColors.inputBorder,
    opacity: 0.4,
  },
  registerSection: {
    width: "100%",
    gap: 16,
    alignItems: "center",
  },
  registerHint: {
    fontSize: 14,
    color: "#1a1a1a",
  },
});
