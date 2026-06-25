import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

import { getAccessToken } from "@/components/auth/auth-storage";
import { AppColors } from "@/constants/theme";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(1.08)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start(async () => {
      await new Promise((r) => setTimeout(r, 900));
      if (cancelled) return;

      const token = await getAccessToken();
      if (cancelled) return;

      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true })
        .start(() => {
          if (!cancelled) router.replace(token ? "/(tabs)" : "/(auth)/login");
        });
    });

    return () => { cancelled = true; };
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
    backgroundColor: AppColors.primary,
  },
  image: {
    width,
    height,
    resizeMode: "cover",
  },
});
