import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/components/auth/use-auth";
import { DashboardPassport } from "@/components/dashboard/dashboard-passport";
import { getProfile, ProfileResponse } from "@/api/profile";
import { getAccessToken } from "@/components/auth/auth-storage";
import {
  getTodayMovements,
  getTotalMovements,
  TodayMovementResponse,
  TotalMovementResponse,
} from "@/api/movements";

export default function HomeScreen() {
  const { isLoggedIn, isCheckingAuth, logoutUser } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [todayMovement, setTodayMovement] =
    useState<TodayMovementResponse | null>(null);
  const [totalMovement, setTotalMovement] =
    useState<TotalMovementResponse | null>(null);
  const [isMovementLoading, setIsMovementLoading] = useState(true);
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  async function handleLogout() {
    await logoutUser();
    setIsDashboardOpen(false);
    setProfile(null);
    setTodayMovement(null);
    setTotalMovement(null);
  }

  useEffect(() => {
    async function loadHomeData() {
      try {
        const token = await getAccessToken();

        if (!token) {
          setProfile(null);
          setTodayMovement(null);
          setTotalMovement(null);
          return;
        }
        //1.プロフィールを取得
        const profileResult = await getProfile(token);
        setProfile(profileResult);

        //2.今日の移動データ（movements）を取得
        const movementResult = await getTodayMovements(token);
        console.log("movementResult", movementResult);
        setTodayMovement(movementResult);

        const totalMovementResult = await getTotalMovements(token);
        console.log("totalMovementResult", totalMovementResult);
        setTotalMovement(totalMovementResult);
      } catch (error) {
        console.error("ホームデータ取得に失敗しました", error);
        setProfile(null);
        setTodayMovement(null);
        setTotalMovement(null);
      } finally {
        setIsProfileLoading(false);
        setIsMovementLoading(false);
      }
    }

    loadHomeData();
  }, []); //ホーム画面が開いた時にプロフィール取得が走る、tokenを読んで/profileを叩く、結果をprofile　stateに入れる

 

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

  if (!isLoggedIn) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={
          isExploreMode
            ? require("@/assets/images/home/map3/map-explore-background.png")
            : require("@/assets/images/home/map1/map-background.png")
        }
        style={styles.mapArea}
        resizeMode="cover"
      >
        <View style={styles.topBar} />

        <View style={styles.distanceBadge}>
          <Image
            source={require("@/assets/images/home/map2/footprint-icon.png")}
            style={styles.footprintIcon}
          />

          {isMovementLoading ? (
            <ThemedText style={styles.distanceText}>...</ThemedText>
          ) : (
            <ThemedText style={styles.distanceText}>
              {todayMovement?.real_distance_km ?? 0}
            </ThemedText>
          )}

          <ThemedText style={styles.distanceUnit}>km</ThemedText>
        </View>

        <View style={styles.coinArea}>
          <Image
            source={require("@/assets/images/home/map1/coin-badge.png")}
            style={styles.coinBadgeImage}
          />
          <Image
            source={require("@/assets/images/home/map1/coin-icon.png")}
            style={styles.coinIconImage}
          />
          <ThemedText style={styles.coinText}>360</ThemedText>
        </View>

        {isExploreMode ? (
          <View style={styles.statusPill}>
            <ThemedText style={styles.statusText}>＜探索モード中＞</ThemedText>
          </View>
        ) : null}

        {isDashboardOpen ? (
          <View style={styles.dashboardOverlay}>
            <Pressable
              style={styles.dashboardBackdrop}
              onPress={() => setIsDashboardOpen(false)}
            />
            <DashboardPassport
              totalMovement={totalMovement}
              onLogout={handleLogout}
            />
          </View>
        ) : null}

        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            onPress={() => setIsExploreMode((current) => !current)}
          >
            <View style={styles.exploreIconWrap}>
              <Image
                source={require("@/assets/images/home/map1/explore-icon.png")}
                style={styles.exploreIconBase}
              />
              <Image
                source={
                  isExploreMode
                    ? require("@/assets/images/home/map3/walking-icon.png")
                    : require("@/assets/images/home/map1/explore-character.png")
                }
                style={
                  isExploreMode ? styles.walkingIcon : styles.exploreCharacter
                }
              />
            </View>
            <ThemedText style={styles.navLabel}>探索モード</ThemedText>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => setIsDashboardOpen((current) => !current)}
          >
            <View style={styles.passportIconWrap}>
              <Image
                source={require("@/assets/images/home/map1/explore-icon.png")}
                style={styles.passportIconBase}
              />
              <Image
                source={
                  isDashboardOpen
                    ? require("@/assets/images/dashboard/passport-selected-icon.png")
                    : require("@/assets/images/home/map1/passport-icon.png")
                }
                style={styles.passportImage}
              />
            </View>
            <ThemedText style={styles.navLabel}>マイページ</ThemedText>
          </Pressable>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#60d0e5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  mapArea: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 54,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  distanceBadge: {
    position: "absolute",
    top: 61,
    alignSelf: "center",
    width: 160,
    height: 48,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#9e171a",
    backgroundColor: "#f6ebc6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footprintIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  distanceText: {
    color: "#111111",
    fontSize: 28,
    fontWeight: "800",
  },
  distanceUnit: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "700",
  },
  coinArea: {
    position: "absolute",
    top: 56,
    right: 8,
    width: 67,
    height: 60,
    alignItems: "center",
  },
  coinBadgeImage: {
    position: "absolute",
    bottom: 0,
    width: 67,
    height: 41,
    resizeMode: "contain",
  },
  coinIconImage: {
    position: "absolute",
    top: 0,
    width: 37,
    height: 36,
    resizeMode: "contain",
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 65,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingBottom: 6,
    zIndex: 20,
  },
  navItem: {
    width: 120,
    alignItems: "center",
    gap: 4,
  },
  exploreIconWrap: {
    width: 100,
    height: 107,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  exploreIconBase: {
    position: "absolute",
    bottom: 0,
    width: 100,
    height: 107,
    resizeMode: "contain",
  },
  exploreCharacter: {
    position: "absolute",
    bottom: 25,
    width: 43,
    height: 77,
    resizeMode: "contain",
  },
  passportIconWrap: {
    width: 100,
    height: 107,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  passportIconBase: {
    position: "absolute",
    bottom: 0,
    width: 100,
    height: 107,
    resizeMode: "contain",
  },
  passportImage: {
    position: "absolute",
    left: -2,
    bottom: 8,
    width: 112,
    height: 112,
    resizeMode: "contain",
  },
  navLabel: {
    color: "#111111",
    fontSize: 12,
  },
  coinText: {
    position: "absolute",
    bottom: 6,
    color: "#585555",
    fontSize: 18,
    fontWeight: "800",
  },
  statusPill: {
    position: "absolute",
    bottom: 128,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  statusText: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "600",
  },
  walkingIcon: {
    position: "absolute",
    bottom: 20,
    width: 50,
    height: 80,
    resizeMode: "contain",
  },
  dashboardOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  dashboardBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
});
