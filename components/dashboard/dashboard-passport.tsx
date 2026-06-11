import { Image, Pressable, StyleSheet, View } from "react-native";

import { TotalMovementResponse } from "@/api/movements";
import { ThemedText } from "@/components/themed-text";

type DashboardPassportProps = {
  totalMovement: TotalMovementResponse | null;
  onLogout: () => void;
};

export function DashboardPassport({
  totalMovement,
  onLogout,
}: DashboardPassportProps) {
  const totalDistanceKm =
    totalMovement?.total_real_distance_km.toLocaleString() ?? "-";

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
            <Image
              source={require("@/assets/images/dashboard/passport-charactor-background.png")}
              style={styles.passportCharacterBackground}
            />
            <Image
              source={require("@/assets/images/dashboard/passport-charactor.png")}
              style={styles.passportCharacter}
            />
            <Image
              source={require("@/assets/images/home/map2/footprint-icon.png")}
              style={styles.passportFootprint}
            />
          </View>

          <View style={styles.passportInfo}>
            <View style={styles.profileRow}>
              <View style={styles.profileField}>
                <ThemedText style={styles.profileLabel}>氏名</ThemedText>
                <ThemedText style={styles.profileValue}>○○○○</ThemedText>
              </View>
              <View style={styles.profileField}>
                <ThemedText style={styles.profileLabel}>性別</ThemedText>
                <ThemedText style={styles.profileValue}>○</ThemedText>
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

      <Pressable style={styles.profileEditButton}>
        <ThemedText style={styles.profileEditText}>プロフィール変更</ThemedText>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <ThemedText style={styles.logoutText}>ログアウト</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardPanel: {
    width: "88%",
    maxWidth: 380,
    alignItems: "center",
    gap: 12,
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
    marginTop: 8,
    width: "72%",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#9e171a",
    backgroundColor: "#fff4c9",
    alignItems: "center",
    zIndex: 1,
  },
  profileEditText: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "NotoSerifJP",
  },
  logoutButton: {
    width: "52%",
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    alignItems: "center",
    zIndex: 1,
  },
  logoutText: {
    color: "#9e171a",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "NotoSerifJP",
  },
});
