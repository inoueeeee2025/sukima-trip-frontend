import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

import { getAccessToken } from "@/components/auth/auth-storage";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(1.08)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // フェードイン + ズームイン（1.08 → 1.0）
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start(async () => {
      await new Promise((r) => setTimeout(r, 900));
      const token = await getAccessToken();

      // フェードアウト
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true })
        .start(() => router.replace(token ? "/(tabs)" : "/(auth)/login"));
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.Image
        source={require("@/assets/images/splash/splash-full.png")}
        style={[styles.image, { opacity, transform: [{ scale }] }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#60d0e5",
  },
  image: {
    width,
    height,
    resizeMode: "cover",
  },
});
