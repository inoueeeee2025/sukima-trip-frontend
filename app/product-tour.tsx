import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { useAuth } from "@/components/auth/use-auth";
import { ThemedText } from "@/components/themed-text";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  { id: 1, image: require("@/assets/images/product-tour/slide-1.png") },
  { id: 2, image: require("@/assets/images/product-tour/slide-2.png") },
  { id: 3, image: require("@/assets/images/product-tour/slide-3.png") },
  { id: 4, image: require("@/assets/images/product-tour/slide-4.png") },
  { id: 5, image: require("@/assets/images/product-tour/slide-5.png") },
  { id: 6, image: require("@/assets/images/product-tour/slide-6.png") },
  { id: 7, image: require("@/assets/images/product-tour/slide-7.png") },
];

export default function ProductTourScreen() {
  const { clearNewUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  function handleFinish() {
    clearNewUser();
    router.replace("/(tabs)");
  }

  function handleNext() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleFinish();
    }
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  }

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Image source={item.image} style={styles.slide} resizeMode="cover" />
        )}
      />

      <View style={styles.overlay}>
        <Pressable style={styles.skipButton} onPress={handleFinish}>
          <ThemedText style={styles.skipText}>スキップ</ThemedText>
        </Pressable>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable style={styles.nextButton} onPress={handleNext}>
          <ThemedText style={styles.nextText}>
            {isLast ? "はじめる" : "次へ"}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  slide: {
    width,
    height,
  },
  overlay: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 20,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 20,
  },
  skipButton: {
    position: "absolute",
    top: -200,
    right: 24,
  },
  skipText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 999,
  },
  nextText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
  },
});
