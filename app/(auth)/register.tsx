import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { register } from "@/api/auth";
import { uploadAvatar } from "@/api/profile";
import { AppColors } from "@/constants/theme";

type Gender = "男性" | "女性" | "その他";
const GENDERS: Gender[] = ["男性", "女性", "その他"];
const GENDER_VALUES: Record<Gender, string> = {
  男性: "male",
  女性: "female",
  その他: "other",
};

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const passwordConfirmRef = useRef<TextInput>(null);

  async function handlePickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setErrorMessage("フォトライブラリへのアクセスを許可してください");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function handleRegister() {
    if (!name || !email || !password) {
      setErrorMessage("名前・メールアドレス・パスワードを入力してください");
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage("パスワードが一致しません");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await register({ email, password, name, gender: gender ? GENDER_VALUES[gender] : "" });
      if (avatarUri) {
        await uploadAvatar(avatarUri, result.access_token).catch(() => {});
      }
      router.replace("/(auth)/login");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "新規登録に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 戻るボタン */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* アバター */}
        <Pressable style={styles.avatarWrap} onPress={handlePickAvatar}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarIcon}>＋</Text>
            </View>
          )}
        </Pressable>

        {/* フォーム */}
        <View style={styles.form}>
          {/* 名前 */}
          <View style={styles.field}>
            <Text style={styles.label}>名前</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              style={styles.input}
            />
          </View>

          {/* 性別 */}
          <View style={styles.field}>
            <Text style={styles.label}>性別</Text>
            <View style={styles.genderRow}>
              {GENDERS.map((g) => (
                <Pressable
                  key={g}
                  style={styles.genderOption}
                  onPress={() => setGender(g)}
                >
                  <View style={styles.radio}>
                    {gender === g && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.genderLabel}>{g}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* メールアドレス */}
          <View style={styles.field}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              ref={emailRef}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              style={styles.input}
            />
          </View>

          {/* パスワード */}
          <View style={styles.field}>
            <Text style={styles.label}>パスワード</Text>
            <TextInput
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => passwordConfirmRef.current?.focus()}
              style={styles.input}
            />
          </View>

          {/* パスワード確認 */}
          <View style={styles.field}>
            <Text style={styles.label}>パスワード（確認用）</Text>
            <TextInput
              ref={passwordConfirmRef}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              style={styles.input}
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Pressable
            onPress={handleRegister}
            disabled={isLoading}
            style={[styles.button, isLoading && styles.buttonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <Text style={styles.buttonText}>新規登録</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primary,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingTop: 8,
    alignSelf: "flex-start",
  },
  backArrow: {
    fontSize: 28,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  avatarWrap: {
    alignItems: "center",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#d0d0d0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarIcon: {
    fontSize: 32,
    color: "#888",
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
  genderRow: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    paddingTop: 4,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1a1a1a",
  },
  genderLabel: {
    fontSize: 14,
    color: "#1a1a1a",
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
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: AppColors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
