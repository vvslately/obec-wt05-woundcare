import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BootSplashScreen } from "./src/components/common/BootSplashScreen";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { useBootSplash } from "./src/hooks/useBootSplash";

const queryClient = new QueryClient();

export default function App() {
  const { bootReady } = useBootSplash();

  if (!bootReady) {
    return <BootSplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
