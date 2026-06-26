import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";

import { TotalMovementResponse } from "@/api/movements";
import { ThemedText } from "@/components/themed-text";
import { GENDER_LABELS } from "@/constants/gender";
import { AppColors } from "@/constants/theme";

type DashboardPassportProps = {
  totalMovement: TotalMovementResponse | null;
  onLogout: () => void;
  onEditProfile?: () => void;
  avatarUrl?: string | null;
  name?: string | null;
  gender?: string | null;
};

export function DashboardPassport({
  totalMovement,
  onLogout,
  onEditProfile,
  avatarUrl,
  name,
  gender,
}: DashboardPassportProps) {
  const totalDistanceKm =
    totalMovement?.total_real_distance_km.toLocaleString() ?? "-";
  const [avatarError, setAvatarError] = useState(false);

  return (
    <View style={styles.dashboardPanel}>
      <Image
        source={require("@/assets/images/dashboard/passport-open.png")}
        style={styles.dashboardPassportImage}
      />

      <View style={styles.dashboardContent}>
        <ThemedText style={styles.dashboardSectionTitle}>
          あなたの軌跡
        </ThemedText>
        <ThemedText style={styles.dashboardSmallText}>
          ＜今日の移動記録＞
        </ThemedText>
        <ThemedText style={styles.dashboardDistanceText}>1,250 km</ThemedText>
        <ThemedText style={styles.dashboardSmallText}>
          ＜今日の獲得コイン数＞
        </ThemedText>
        <ThemedText style={styles.dashboardCoinText}>40 C</ThemedText>

        <View style={styles.passportInfoArea}>
          <View style={styles.passportCharacterArea}>
            {avatarUrl && !avatarError ? (
              <View style={styles.passportAvatarWrap}>
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.passportAvatar}
                  onError={() => setAvatarError(true)}
                />
              </View>
            ) : (
              <>
                <Image
                  source={require("@/assets/images/dashboard/passport-charactor-background.png")}
                  style={styles.passportCharacterBackground}
                />
                <Image
                  source={require("@/assets/images/dashboard/passport-charactor.png")}
                  style={styles.passportCharacter}
                />
              </>
            )}
            <Image
              source={require("@/assets/images/home/map2/footprint-icon.png")}
              style={styles.passportFootprint}
            />
          </View>

          <View style={styles.passportInfo}>
            <View style={styles.profileRow}>
              <View style={styles.profileField}>
                <ThemedText style={styles.profileLabel}>氏名</ThemedText>
                <ThemedText style={styles.profileValue}>{name || "未設定"}</ThemedText>
              </View>
              <View style={styles.profileField}>
                <ThemedText style={styles.profileLabel}>性別</ThemedText>
                <ThemedText style={styles.profileValue}>{(gender && GENDER_LABELS[gender]) || gender || "未設定"}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.dashboardSmallText}>
              --- 通算移動記録 ---
            </ThemedText>
            <ThemedText style={styles.totalDistanceText}>
              {totalDistanceKm} km
            </ThemedText>
          </View>
        </View>
      </View>

      <Pressable style={styles.profileEditButton} onPress={onEditProfile}>
        <ThemedText style={styles.profileEditText}>プロフィール変更</ThemedText>
      </Pressable>

      {/* ログアウトボタン：パスポート右上に絶対配置（レイアウトに影響しない） */}
      <Pressable
        style={styles.logoutButton}
        onPress={onLogout}
        accessibilityRole="button"
        accessibilityLabel="ログアウト"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons name="exit-to-app" size={20} color={AppColors.inputBorder} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardPanel: {
    width: "88%",
    maxWidth: 380,
    alignItems: "center",
    gap: 4,
    zIndex: 1,
  },
  dashboardPassportImage: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  dashboardContent: {
    width: "78%",
    minHeight: 260,
    paddingTop: 40,
    gap: 12,
    zIndex: 1,
  },
  dashboardSectionTitle: {
    fontFamily: "NotoSerifJP",
    color: "#111111",
    fontSize: 20,
    top:10,
    fontWeight: "500",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  dashboardSmallText: {
    fontFamily: "NotoSerifJP",
    color: "#333333",
    fontSize: 13,
    textAlign: "center",
  },
  dashboardDistanceText: {
    fontFamily: "NotoSerifJP",
    color: "#111111",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
  },
  dashboardCoinText: {
    fontFamily: "NotoSerifJP",
    color: "#111111",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  passportInfoArea: {
    marginTop: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  passportCharacterArea: {
    width: 92,
    height: 92,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  passportCharacterBackground: {
    position: "absolute",
    width: 92,
    height: 92,
    resizeMode: "contain",
  },
  passportCharacter: {
    width: 72,
    height: 72,
    resizeMode: "contain",
  },
  passportAvatarWrap: {
    width: 72,
    height: 80,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d5cec3",
  },
  passportAvatar: {
    width: 72,
    height: 80,
    resizeMode: "cover",
  },
  passportFootprint: {
    position: "absolute",
    right: -8,
    bottom: -8,
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  passportInfo: {
    flex: 1,
    gap: 10,
    alignItems: "center",
    
  },
  profileRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  profileField: {
    alignItems: "center",
    gap: 2,
  },
  profileLabel: {
    color: "#333333",
    fontSize: 14,
  },
  profileValue: {
    color: "#111111",
    fontSize: 14,
  },
  totalDistanceText: {
    color: "#111111",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "NotoSerifJP",
  },
  profileEditButton: {
    width: "46%",
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: AppColors.inputBorder,
    backgroundColor: "#fff4c9",
    alignItems: "center",
    zIndex: 1,
  },
  profileEditText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "NotoSerifJP",
  },
  logoutButton: {
    position: "absolute",
    top: 19,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
});
