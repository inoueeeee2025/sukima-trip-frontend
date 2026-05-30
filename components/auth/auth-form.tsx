import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type AuthFormProps = {
  isRegisterMode: boolean;
  name: string;
  gender: string;
  email: string;
  password: string;
  errorMessage: string;
  isLoading: boolean;
  onChangeName: (value: string) => void;
  onChangeGender: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
  onToggleMode: () => void;
};

export function AuthForm({
  isRegisterMode,
  name,
  gender,
  email,
  password,
  errorMessage,
  isLoading,
  onChangeName,
  onChangeGender,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  onToggleMode,
}: AuthFormProps) {
  return (
    <>
      <ThemedText type="title">
        {isRegisterMode ? "Register" : "Login"}
      </ThemedText>

      <ThemedText style={styles.description}>
        {isRegisterMode
          ? "Sukima Trip の新規登録画面です"
          : "Sukima Trip の認証確認用画面です"}
      </ThemedText>

      {isRegisterMode ? (
        <>
          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">名前</ThemedText>
            <TextInput
              value={name}
              onChangeText={onChangeName}
              placeholder="山田 太郎"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">性別</ThemedText>
            <TextInput
              value={gender}
              onChangeText={onChangeGender}
              placeholder="任意"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>
        </>
      ) : null}

      <View style={styles.form}>
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">メールアドレス</ThemedText>
          <TextInput
            value={email}
            onChangeText={onChangeEmail}
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
            onChangeText={onChangePassword}
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
          onPress={onSubmit}
          disabled={isLoading}
          style={[styles.button, isLoading && styles.buttonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.buttonText}>
              {isRegisterMode ? "新規登録" : "ログイン"}
            </ThemedText>
          )}
        </Pressable>

        <Pressable onPress={onToggleMode}>
          <ThemedText style={styles.switchText}>
            {isRegisterMode ? "ログイン画面に戻る" : "新規登録はこちら"}
          </ThemedText>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  switchText: {
    color: "#1f6f5f",
    textAlign: "center",
  },
});