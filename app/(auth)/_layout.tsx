import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, SafeAreaView, View } from "react-native";

import { useAuth } from "@/components/auth/use-auth";

export default function AuthLayout() {
  const { isLoggedIn, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}