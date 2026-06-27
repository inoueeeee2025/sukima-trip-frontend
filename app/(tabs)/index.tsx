import { router, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

import { Animated, Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCoinBalance, getTodayCoins } from "@/api/coins";
import {
  getTodayMovements,
  getTotalMovements,
  updateTodayMovement,
  TodayMovementResponse,
  TotalMovementResponse,
} from "@/api/movements";
import { getProfile, ProfileResponse } from "@/api/profile";
import { getAccessToken } from "@/components/auth/auth-storage";
import { useAuth } from "@/components/auth/use-auth";
import { DashboardPassport } from "@/components/dashboard/dashboard-passport";
import { ThemedText } from "@/components/themed-text";
import { StreetViewAvailabilityChecker } from "@/components/street-view/street-view-availability-checker";
import {
  type StreetViewPosition,
  type StreetViewStatus,
} from "@/components/street-view/street-view-panel";
import { WalkModeScreen } from "@/components/walk-mode/walk-mode-screen";
import { ExploreMapPanel } from "@/components/explore-map/explore-map-panel";
import { VisitedMapPanel } from "@/components/visited-map/visited-map-panel";

type LandingPoint = {
  screenX: number;
  screenY: number;
  latitude: number | null;
  longitude: number | null;
  name: string;
};

type LandingPointSelection = {
  screenX: number;
  screenY: number;
  latitude: number;
  longitude: number;
  name: string;
};

type TripPoint = {
  name: string;
  latitude: number;
  longitude: number;
};

type VirtualTripMovementLog = {
  id: string;
  fromPoint: TripPoint;
  toPoint: TripPoint;
  distanceKm: number;
  movedAt: string;
};

type VisitedRoutePoint = {
  latitude: number;
  longitude: number;
};

type VirtualTripState = {
  startPoint: TripPoint | null;
  currentPoint: TripPoint | null;
  totalVirtualDistanceKm: number;
  usedVirtualDistanceKm: number;
  movementLog: VirtualTripMovementLog[];
};

type WalkSessionLocation = {
  latitude: number;
  longitude: number;
};

type WalkSessionState = {
  isActive: boolean;
  startedAt: string | null;
  realDistanceKm: number;
  lastLocation: WalkSessionLocation | null;
};

const INITIAL_WALK_SESSION: WalkSessionState = {
  isActive: false,
  startedAt: null,
  realDistanceKm: 0,
  lastLocation: null,
};

const VIRTUAL_DISTANCE_FINISH_THRESHOLD_KM = 0.5;
const VIRTUAL_DISTANCE_MULTIPLIER = 5;

function calculateDistanceKm(fromPoint: TripPoint, toPoint: TripPoint) {
  const earthRadiusKm = 6371;
  const toRadians = (degree: number) => (degree * Math.PI) / 180;

  const latitudeDifference = toRadians(toPoint.latitude - fromPoint.latitude);
  const longitudeDifference = toRadians(
    toPoint.longitude - fromPoint.longitude,
  );

  const fromLatitude = toRadians(fromPoint.latitude);
  const toLatitude = toRadians(toPoint.latitude);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HomeScreen() {
  const { isLoggedIn, logoutUser } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [todayMovement, setTodayMovement] =
    useState<TodayMovementResponse | null>(null);
  const [totalMovement, setTotalMovement] =
    useState<TotalMovementResponse | null>(null);
  const [isMovementLoading, setIsMovementLoading] = useState(true);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const [todayCoins, setTodayCoins] = useState<number | null>(null);
  // setter は #62（バックエンドに座標追加）対応後に使用予定
  const [visitedRoute] = useState<VisitedRoutePoint[]>([]);
  // アプリ起動中だけ増える一時的な距離データ。保存済みのtodayMovementとは分けて扱う
  const [walkSession, setWalkSession] =
    useState<WalkSessionState>(INITIAL_WALK_SESSION);
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [isWalkMode, setIsWalkMode] = useState(false);
  // Street Viewが表示できない原因をログで追うための状態
  const [streetViewStatus, setStreetViewStatus] =
    useState<StreetViewStatus | null>(null);
  const [streetViewAddress, setStreetViewAddress] =
    useState<string>("現在地を取得中");
  const [streetViewRollbackPosition, setStreetViewRollbackPosition] =
    useState<StreetViewPosition | null>(null);
  const [isWalkFinishedModalOpen, setIsWalkFinishedModalOpen] = useState(false);
  // ×ボタンでいきなり終了せず、まず確認ダイアログを出すための状態
  const [isWalkExitConfirmOpen, setIsWalkExitConfirmOpen] = useState(false);
  // Street Viewが見つからなかった時の文言を、Home(map)2上に出すために保持する
  const [streetViewUnavailableMessage, setStreetViewUnavailableMessage] =
    useState<string | null>(null);
  // not_found文言を3秒後に薄く消すための透明度
  const streetViewUnavailableOpacity = useRef(new Animated.Value(0)).current;
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [selectedLandingPoint, setSelectedLandingPoint] =
    useState<LandingPoint | null>(null);
  // Walk modeへ切り替える前に、裏側でStreet Viewがあるか確認する地点
  const [pendingStreetViewPoint, setPendingStreetViewPoint] =
    useState<TripPoint | null>(null);
  const [virtualTrip, setVirtualTrip] = useState<VirtualTripState>({
    startPoint: null,
    currentPoint: null,
    totalVirtualDistanceKm: 0,
    usedVirtualDistanceKm: 0,
    movementLog: [],
  });
  // Walk mode中に毎回currentPointをstate更新するとWebViewが黒くなるため、最新地点はrefで保持する
  const streetViewLatestPointRef = useRef<TripPoint | null>(null);
  // 終了時に保存する今回分のStreet View移動ログも、移動中はrefにためる
  const streetViewMovementLogRef = useRef<VirtualTripMovementLog[]>([]);

  const hasSelectedLandingPoint = selectedLandingPoint !== null;

  const availableVirtualDistanceKm =
    virtualTrip.totalVirtualDistanceKm +
    walkSession.realDistanceKm * VIRTUAL_DISTANCE_MULTIPLIER;

  const remainingVirtualDistanceKm = Math.max(
    availableVirtualDistanceKm - virtualTrip.usedVirtualDistanceKm,
    0,
  );

  const displayedHeldRealDistanceKm =
    remainingVirtualDistanceKm <= VIRTUAL_DISTANCE_FINISH_THRESHOLD_KM
      ? 0
      : remainingVirtualDistanceKm / VIRTUAL_DISTANCE_MULTIPLIER;
  const hasUsedAllVirtualDistance =
    isWalkMode &&
    remainingVirtualDistanceKm <= VIRTUAL_DISTANCE_FINISH_THRESHOLD_KM;

  async function handleLogout() {
    await logoutUser();
    setIsDashboardOpen(false);
    setIsExploreMode(false);
    setIsWalkMode(false);
    setWalkSession(INITIAL_WALK_SESSION);
    setSelectedLandingPoint(null);
    setPendingStreetViewPoint(null);
    setVirtualTrip({
      startPoint: null,
      currentPoint: null,
      totalVirtualDistanceKm: 0,
      usedVirtualDistanceKm: 0,
      movementLog: [],
    });
    streetViewLatestPointRef.current = null;
    streetViewMovementLogRef.current = [];
    setProfile(null);
    setTodayMovement(null);
    setTotalMovement(null);
    setCoinBalance(null);
  }

  const DEFAULT_MAP_CENTER: TripPoint = {
    name: "日本付近",
    latitude: 36.2048,
    longitude: 138.2529,
  };

  // 両モードで共通に使う初期ズーム
  const DEFAULT_MAP_ZOOM = 5;

  // 最後に見ていた地図の中心を共通で保持する
  const [mapCenter, setMapCenter] = useState<TripPoint>(DEFAULT_MAP_CENTER);
  // 最後に見ていたズーム倍率も共通で保持する
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
  const homeMapCenter = virtualTrip.currentPoint ?? mapCenter;

  function handleSelectLandingPoint(point: LandingPointSelection) {
    if (!isExploreMode) {
      return;
    }

    setSelectedLandingPoint({
      screenX: point.screenX,
      screenY: point.screenY,
      latitude: point.latitude,
      longitude: point.longitude,
      name: point.name,
    });
    // 新しい地点を選び直したら、前回の「Street Viewなし」案内は消す
    setStreetViewUnavailableMessage(null);

    console.log("selectedLandingPoint", point);
  }

  function handleConfirmLandingPoint() {
    if (!selectedLandingPoint) {
      return;
    }

    console.log("confirmLandingPoint", selectedLandingPoint);

    if (remainingVirtualDistanceKm <= VIRTUAL_DISTANCE_FINISH_THRESHOLD_KM) {
      setSelectedLandingPoint(null);
      setPendingStreetViewPoint(null);

      setTimeout(() => {
        setStreetViewUnavailableMessage(
          "移動できる距離がないため、この地点には降り立てません",
        );
      }, 100);

      return;
    }

    //選択された地点をTripPointとして作成
    const startPoint: TripPoint = {
      name: selectedLandingPoint.name,
      latitude: selectedLandingPoint.latitude ?? 0,
      longitude: selectedLandingPoint.longitude ?? 0,
    };

    // まだWalk modeへは切り替えず、まず裏側でStreet Viewがあるか確認する
    setStreetViewStatus("loading");
    setStreetViewUnavailableMessage(null);
    // 「はい」を押した時点で確認モーダルを消す
    setSelectedLandingPoint(null);
    setPendingStreetViewPoint(startPoint);
  }

  function handleCancelLandingPoint() {
    setSelectedLandingPoint(null);
  }

  function handleRequestExitWalkMode() {
    setIsWalkExitConfirmOpen(true);
  }

  function calculateCurrentConsumedVirtualDistanceKm() {
    return streetViewMovementLogRef.current.reduce(
      (totalDistanceKm, log) => totalDistanceKm + log.distanceKm,
      0,
    );
  }

  async function saveWalkSessionMovement() {
    const token = await getAccessToken();

    if (!token) {
      return;
    }

    const usedVirtualDistanceKm = calculateCurrentConsumedVirtualDistanceKm();

    if (walkSession.realDistanceKm <= 0 && usedVirtualDistanceKm <= 0) {
      return;
    }

    console.log("saveWalkSessionMovement input", {
      real_distance_km: walkSession.realDistanceKm,
      used_virtual_distance_km: usedVirtualDistanceKm,
    });

    await updateTodayMovement(
      {
        real_distance_km: walkSession.realDistanceKm,
        used_virtual_distance_km: usedVirtualDistanceKm,
      },
      token,
    );

    const [movementResult, totalMovementResult] = await Promise.all([
      getTodayMovements(token),
      getTotalMovements(token),
    ]);

    setTodayMovement(movementResult);
    setTotalMovement(totalMovementResult);

    setVirtualTrip((current) => ({
      ...current,
      currentPoint: streetViewLatestPointRef.current ?? current.currentPoint,
      totalVirtualDistanceKm: movementResult.virtual_distance_km,
      usedVirtualDistanceKm: movementResult.used_virtual_distance_km,
      movementLog: [],
    }));
    streetViewMovementLogRef.current = [];

    setWalkSession({
      ...INITIAL_WALK_SESSION,
      isActive: true,
      startedAt: new Date().toISOString(),
    });
  }

  async function handleConfirmExitWalkMode() {
    setIsWalkExitConfirmOpen(false);
    setIsWalkMode(false);
    setIsExploreMode(true);

    try {
      await saveWalkSessionMovement();
    } catch (error) {
      console.warn("探索終了時の距離保存に失敗しました", error);
    }
  }

  function handleCancelExitWalkMode() {
    setIsWalkExitConfirmOpen(false);
  }

  async function handleCloseWalkFinishedModal() {
    setIsWalkFinishedModalOpen(false);
    setIsWalkMode(false);
    setIsExploreMode(true);

    try {
      await saveWalkSessionMovement();
    } catch (error) {
      console.warn("探索終了時の距離保存に失敗しました", error);
    }
  }

  function handleWalkLocationChange(location: WalkSessionLocation) {
    setWalkSession((current) => {
      if (!current.isActive) {
        return current;
      }

      if (!current.lastLocation) {
        return {
          ...current,
          lastLocation: location,
        };
      }

      const movedDistanceKm = calculateDistanceKm(
        {
          name: "前回の現在地",
          latitude: current.lastLocation.latitude,
          longitude: current.lastLocation.longitude,
        },
        {
          name: "現在地",
          latitude: location.latitude,
          longitude: location.longitude,
        },
      );

      if (movedDistanceKm < 0.005) {
        return {
          ...current,
          lastLocation: location,
        };
      }

      return {
        ...current,
        realDistanceKm: current.realDistanceKm + movedDistanceKm,
        lastLocation: location,
      };
    });
  }

  function handleStreetViewPositionChange(position: StreetViewPosition) {
    setVirtualTrip((current) => {
      if (!current.currentPoint) {
        return current;
      }

      const previousPoint =
        streetViewLatestPointRef.current ?? current.currentPoint;

      const nextPoint: TripPoint = {
        name: "Street View移動地点",
        latitude: position.latitude,
        longitude: position.longitude,
      };

      const movedDistanceKm = calculateDistanceKm(
        previousPoint,
        nextPoint,
      );

      const availableDistanceKm =
        current.totalVirtualDistanceKm +
        walkSession.realDistanceKm * VIRTUAL_DISTANCE_MULTIPLIER;

      const remainingDistanceKm = Math.max(
        availableDistanceKm - current.usedVirtualDistanceKm,
        0,
      );

      // 初期表示や同じ地点からの重複通知では距離を消費しない
      if (movedDistanceKm < 0.001) {
        return current;
      }

      if (remainingDistanceKm <= VIRTUAL_DISTANCE_FINISH_THRESHOLD_KM) {
        setStreetViewRollbackPosition({
          latitude: previousPoint.latitude,
          longitude: previousPoint.longitude,
        });
        setIsWalkFinishedModalOpen(true);

        return current;
      }

      if (movedDistanceKm > remainingDistanceKm) {
        setStreetViewRollbackPosition({
          latitude: previousPoint.latitude,
          longitude: previousPoint.longitude,
        });

        return current;
      }

      const nextRemainingDistanceKm = remainingDistanceKm - movedDistanceKm;
      const shouldFinishWalk =
        nextRemainingDistanceKm <= VIRTUAL_DISTANCE_FINISH_THRESHOLD_KM;
      const consumedDistanceKm = shouldFinishWalk
        ? remainingDistanceKm
        : movedDistanceKm;

      if (shouldFinishWalk) {
        setIsWalkFinishedModalOpen(true);
      }

      const movementLog: VirtualTripMovementLog = {
        id: `${Date.now()}`,
        fromPoint: previousPoint,
        toPoint: nextPoint,
        distanceKm: consumedDistanceKm,
        movedAt: new Date().toISOString(),
      };

      streetViewLatestPointRef.current = nextPoint;
      streetViewMovementLogRef.current = [
        ...streetViewMovementLogRef.current,
        movementLog,
      ];

      return {
        ...current,
        usedVirtualDistanceKm:
          current.usedVirtualDistanceKm + consumedDistanceKm,
      };
    });
  }

  useEffect(() => {
    if (!isLoggedIn) {
      setWalkSession(INITIAL_WALK_SESSION);
      return;
    }

    setWalkSession((current) => {
      if (current.isActive) {
        return current;
      }

      return {
        ...INITIAL_WALK_SESSION,
        isActive: true,
        startedAt: new Date().toISOString(),
      };
    });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!walkSession.isActive) {
      return;
    }

    let subscription: Location.LocationSubscription | null = null;

    async function watchLocation() {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setWalkSession(INITIAL_WALK_SESSION);
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 5,
        },
        (location) => {
          handleWalkLocationChange({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        },
      );
    }

    watchLocation();

    return () => {
      subscription?.remove();
    };
  }, [walkSession.isActive]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const token = await getAccessToken();

        if (!token) {
          setProfile(null);
          setTodayMovement(null);
          setTotalMovement(null);
          setCoinBalance(null);
          setTodayCoins(null);
          return;
        }

        // 独立したAPIを並列取得
        const [
          profileResult,
          movementResult,
          totalMovementResult,
          coinResult,
          todayCoinsResult,
        ] = await Promise.all([
          getProfile(token),
          getTodayMovements(token),
          getTotalMovements(token),
          getCoinBalance(token),
          getTodayCoins(token),
        ]);

        setProfile(profileResult);
        setTodayMovement(movementResult);
        setTotalMovement(totalMovementResult);
        setCoinBalance(coinResult.balance);
        setTodayCoins(todayCoinsResult.earned_today);

        // 仮想距離と消費済み距離を仮想旅行のstateへ反映
        setVirtualTrip((current) => ({
          ...current,
          totalVirtualDistanceKm: movementResult.virtual_distance_km,
          usedVirtualDistanceKm: movementResult.used_virtual_distance_km,
        }));
      } catch (error) {
        console.error("ホームデータ取得に失敗しました", error);
        setProfile(null);
        setTodayMovement(null);
        setTotalMovement(null);
        setCoinBalance(null);
        setTodayCoins(null);
      } finally {
        setIsProfileLoading(false);
        setIsMovementLoading(false);
      }
    }

    loadHomeData();
  }, []); //ホーム画面が開いた時にプロフィール取得が走る、tokenを読んで/profileを叩く、結果をprofile　stateに入れる

  useEffect(() => {
    if (!isDashboardOpen) return;

    async function refreshDashboardData() {
      const token = await getAccessToken();
      if (!token) return;
      try {
        const [
          movementResult,
          totalMovementResult,
          coinResult,
          todayCoinsResult,
        ] = await Promise.all([
          getTodayMovements(token),
          getTotalMovements(token),
          getCoinBalance(token),
          getTodayCoins(token),
        ]);
        setTodayMovement(movementResult);
        setTotalMovement(totalMovementResult);
        setCoinBalance(coinResult.balance);
        setTodayCoins(todayCoinsResult.earned_today);
      } catch (error) {
        console.error("ダッシュボードデータ取得に失敗しました", error);
      }
    }

    refreshDashboardData();
  }, [isDashboardOpen]);

  const isFirstMount = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }
      async function refreshProfile() {
        const token = await getAccessToken();
        if (!token) return;
        try {
          const profileResult = await getProfile(token);
          setProfile(profileResult);
        } catch {
          // ignore, keep existing profile data
        }
      }
      refreshProfile();
    }, []),
  );

  useEffect(() => {
    if (!streetViewUnavailableMessage) {
      return;
    }

    // 表示直後ははっきり見せて、3秒後にフェードアウトする
    streetViewUnavailableOpacity.setValue(1);

    const timerId = setTimeout(() => {
      Animated.timing(streetViewUnavailableOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }).start(() => {
        setStreetViewUnavailableMessage(null);
      });
    }, 3000);

    return () => {
      clearTimeout(timerId);
      streetViewUnavailableOpacity.stopAnimation();
    };
  }, [streetViewUnavailableMessage, streetViewUnavailableOpacity]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {isWalkMode && virtualTrip.currentPoint ? (
        <>
          <WalkModeScreen
            latitude={virtualTrip.currentPoint.latitude}
            longitude={virtualTrip.currentPoint.longitude}
            locationName={streetViewAddress}
            remainingVirtualDistanceKm={remainingVirtualDistanceKm}
            rollbackPosition={streetViewRollbackPosition}
            onStatusChange={(status) => {
              console.log("streetViewStatus", status);
              setStreetViewStatus(status);
            }}
            onPositionChange={handleStreetViewPositionChange}
            onAddressChange={setStreetViewAddress}
            onExit={handleRequestExitWalkMode}
          />

          {isWalkExitConfirmOpen ? (
            <View style={styles.walkExitConfirmOverlay}>
              <View style={styles.walkExitConfirmCard}>
                <ThemedText style={styles.walkExitConfirmTitle}>
                  探索を終了しますか？
                </ThemedText>

                <View style={styles.walkExitConfirmActions}>
                  <Pressable
                    style={styles.walkExitCancelButton}
                    onPress={handleCancelExitWalkMode}
                  >
                    <ThemedText style={styles.walkExitCancelButtonText}>
                      続ける
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    style={styles.walkExitConfirmButton}
                    onPress={handleConfirmExitWalkMode}
                  >
                    <ThemedText style={styles.walkExitConfirmButtonText}>
                      終了する
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}

          {isWalkFinishedModalOpen || hasUsedAllVirtualDistance ? (
            <View style={styles.walkFinishedOverlay}>
              <View style={styles.walkFinishedCard}>
                <ThemedText style={styles.walkFinishedTitle}>
                  探索終了
                </ThemedText>
                <ThemedText style={styles.walkFinishedMessage}>
                  移動できる距離を使い切りました
                </ThemedText>

                <Pressable
                  style={styles.walkFinishedButton}
                  onPress={handleCloseWalkFinishedModal}
                >
                  <ThemedText style={styles.walkFinishedButtonText}>
                    ホームに戻る
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.mapArea}>
          {isExploreMode ? (
            <ExploreMapPanel
              latitude={mapCenter.latitude}
              longitude={mapCenter.longitude}
              zoom={mapZoom}
              onSelectPoint={handleSelectLandingPoint}
              onCenterChanged={({ latitude, longitude, zoom }) => {
                setMapCenter((current) => ({
                  ...current,
                  latitude,
                  longitude,
                }));
                setMapZoom(zoom);
              }}
            />
          ) : (
            <VisitedMapPanel
              latitude={homeMapCenter.latitude}
              longitude={homeMapCenter.longitude}
              zoom={mapZoom}
              visitedRoute={visitedRoute}
              onCenterChanged={({ latitude, longitude, zoom }) => {
                setMapCenter((current) => ({
                  ...current,
                  latitude,
                  longitude,
                }));
                setMapZoom(zoom);
              }}
            />
          )}

          {pendingStreetViewPoint ? (
            <StreetViewAvailabilityChecker
              point={pendingStreetViewPoint}
              onResult={(result) => {
                console.log("streetViewAvailability", result);
                setStreetViewStatus(result.status);

                if (result.status === "ready") {
                  // Street Viewが見つかった時だけ、補正後の座標を仮想現在地にしてWalk modeへ進む
                  const correctedPoint: TripPoint = {
                    name: pendingStreetViewPoint.name,
                    latitude: result.latitude,
                    longitude: result.longitude,
                  };

                  streetViewLatestPointRef.current = correctedPoint;
                  streetViewMovementLogRef.current = [];

                  setVirtualTrip((current) => ({
                    ...current,
                    startPoint: current.startPoint ?? correctedPoint,
                    currentPoint: correctedPoint,
                  }));
                  setPendingStreetViewPoint(null);
                  setIsWalkMode(true);
                  setIsExploreMode(false);
                  return;
                }

                // Street Viewがない時は画面を切り替えず、Home(map)2上に案内を出す
                setPendingStreetViewPoint(null);
                setStreetViewUnavailableMessage(
                  "この地点の近くにStreet Viewがありません",
                );
              }}
            />
          ) : null}

          <Pressable
            style={styles.favoriteButton}
            onPress={() => router.push("/(tabs)/spots")}
          >
            <Image
              source={require("@/assets/images/spots/favorite-button.png")}
              style={styles.favoriteButtonImage}
            />
          </Pressable>
          <View style={styles.distanceBadge}>
            <Image
              source={require("@/assets/images/home/map2/footprint-icon.png")}
              style={styles.footprintIcon}
            />

            {isMovementLoading ? (
              <ThemedText style={styles.distanceText}>...</ThemedText>
            ) : (
              <ThemedText style={styles.distanceText}>
                {displayedHeldRealDistanceKm.toFixed(1)}
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
            <ThemedText style={styles.coinText}>
              {isMovementLoading ? "..." : (coinBalance ?? "-")}
            </ThemedText>
          </View>
          {isExploreMode ? (
            <View style={styles.statusPill}>
              <ThemedText style={styles.statusText}>
                ＜探索モード中＞
              </ThemedText>
            </View>
          ) : null}
          {isExploreMode && streetViewUnavailableMessage ? (
            <Animated.View
              style={[
                styles.streetViewUnavailableCard,
                { opacity: streetViewUnavailableOpacity },
              ]}
            >
              <ThemedText style={styles.streetViewUnavailableTitle}>
                {streetViewUnavailableMessage}
              </ThemedText>
            </Animated.View>
          ) : null}
          {isExploreMode && hasSelectedLandingPoint && selectedLandingPoint ? (
            <>
              <View style={styles.landingConfirm}>
                <ThemedText style={styles.landingConfirmText}>
                  この地点に降り立ちますか？
                </ThemedText>

                <View style={styles.landingConfirmActions}>
                  <Pressable
                    style={styles.landingYesButton}
                    onPress={handleConfirmLandingPoint}
                  >
                    <ThemedText style={styles.landingYesButtonText}>
                      はい
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    style={styles.landingNoButton}
                    onPress={handleCancelLandingPoint}
                  >
                    <ThemedText style={styles.landingNoButtonText}>
                      いいえ
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </>
          ) : null}

          {isDashboardOpen ? (
            <View style={styles.dashboardOverlay}>
              <Pressable
                style={styles.dashboardBackdrop}
                onPress={() => setIsDashboardOpen(false)}
              />
              <DashboardPassport
                todayMovement={todayMovement}
                totalMovement={totalMovement}
                todayCoins={todayCoins}
                onLogout={handleLogout}
                onEditProfile={() => router.push("/(tabs)/profile/edit")}
                avatarUrl={profile?.avatar_url}
                name={profile?.name}
                gender={profile?.gender}
              />
            </View>
          ) : null}
          <View style={styles.bottomNav}>
            <Pressable
              style={styles.navItem}
              onPress={() => {
                setIsExploreMode((current) => {
                  const next = !current;

                  if (!next) {
                    setSelectedLandingPoint(null);
                  }

                  return next;
                });
              }}
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
        </View>
      )}
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
  streetViewUnavailableCard: {
    position: "absolute",
    bottom: 164,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  streetViewUnavailableTitle: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  mapSelectLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  distanceBadge: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    width: 160,
    height: 60,
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
    position: "absolute",
    left: 6,
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  distanceText: {
    color: "#111111",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  distanceUnit: {
    position: "absolute",
    right: 8,
    color: "#111111",
    fontSize: 22,
    fontWeight: "700",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButtonImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  coinArea: {
    position: "absolute",
    top: 8,
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
  landingPin: {
    position: "absolute",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 8,
  },
  landingPinText: {
    fontSize: 24,
  },
  landingConfirm: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 154,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    zIndex: 8,
  },
  landingConfirmText: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "700",
  },
  landingConfirmActions: {
    marginTop: 10,
    flexDirection: "row",
    gap: 12,
  },
  landingYesButton: {
    minWidth: 72,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#9e171a",
    alignItems: "center",
  },
  landingYesButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  landingNoButton: {
    minWidth: 72,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#9e171a",
    alignItems: "center",
  },
  landingNoButtonText: {
    color: "#9e171a",
    fontSize: 14,
    fontWeight: "700",
  },
  walkingIcon: {
    position: "absolute",
    bottom: 20,
    width: 50,
    height: 80,
    resizeMode: "contain",
  },
  walkFinishedOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  walkFinishedCard: {
    width: "78%",
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    alignItems: "center",
  },
  walkFinishedTitle: {
    color: "#9e171a",
    fontSize: 22,
    fontWeight: "800",
  },
  walkFinishedMessage: {
    marginTop: 10,
    color: "#333333",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  walkFinishedButton: {
    marginTop: 18,
    minWidth: 128,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#9e171a",
    alignItems: "center",
  },
  walkFinishedButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  walkExitConfirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  walkExitConfirmCard: {
    width: "80%",
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    alignItems: "center",
  },
  walkExitConfirmTitle: {
    color: "#333333",
    fontSize: 20,
    fontWeight: "800",
  },

  walkExitConfirmActions: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
  },
  walkExitCancelButton: {
    minWidth: 104,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#9e171a",
    alignItems: "center",
  },
  walkExitCancelButtonText: {
    color: "#9e171a",
    fontSize: 14,
    fontWeight: "800",
  },
  walkExitConfirmButton: {
    minWidth: 104,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#9e171a",
    alignItems: "center",
  },
  walkExitConfirmButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
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
