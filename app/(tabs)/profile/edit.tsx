import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getProfile, updateProfile, uploadAvatar } from "@/api/profile";
import { getAccessToken } from "@/components/auth/auth-storage";
import { AppColors } from "@/constants/theme";

type Gender = "男性" | "女性" | "その他";

const GENDERS: Gender[] = ["男性", "女性", "その他"];
const GENDER_VALUES: Record<Gender, string> = {
  男性: "male",
  女性: "female",
  その他: "other",
};
const GENDER_LABELS: Record<string, Gender> = {
  male: "男性",
  female: "女性",
  other: "その他",
};

export default function ProfileEditScreen() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (!token) return;
      try {
        const profile = await getProfile(token);
        setName(profile.name ?? "");
        setGender(profile.gender ? (GENDER_LABELS[profile.gender] ?? "") : "");
        setExistingAvatarUrl(profile.avatar_url ?? null);
      } catch {
        // ignore, user can still edit manually
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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

  async function handleSave() {
    if (isSaving) return;
    setErrorMessage("");
    setIsSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setErrorMessage("ログインが必要です");
        return;
      }
      if (avatarUri) {
        await uploadAvatar(avatarUri, token).catch(() => {
          Alert.alert(
            "画像アップロード失敗",
            "プロフィール画像のアップロードに失敗しました。他の変更は保存されます。"
          );
        });
      }
      await updateProfile(
        {
          name: name.trim() || undefined,
          gender: gender ? GENDER_VALUES[gender] : undefined,
        },
        token
      );
      router.back();
    } catch {
      setErrorMessage("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }

  const displayAvatarUri = avatarUri ?? existingAvatarUrl;

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a1a1a" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* アバター */}
          <Pressable style={styles.avatarWrap} onPress={handlePickAvatar}>
            {displayAvatarUri ? (
              <Image source={{ uri: displayAvatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarIcon}>＋</Text>
              </View>
            )}
          </Pressable>

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

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              style={[styles.button, isSaving && styles.buttonDisabled]}
            >
              {isSaving ? (
                <ActivityIndicator color={AppColors.white} />
              ) : (
                <Text style={styles.buttonText}>保存する</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
