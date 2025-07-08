import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Mail, ShoppingCart, User } from 'lucide-react-native';
import colors from "@/constants/colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import NotificationSystem from "@/components/NotificationSystem";
import { useGameStore } from "@/hooks/useGameStore";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: Platform.OS === 'web' ? 3 : 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function HeaderIcons() {
  const router = useRouter();
  const { isAuthenticated } = useGameStore();
  
  if (!isAuthenticated) return null;
  
  return (
    <View style={{
      flexDirection: 'row',
      gap: 8,
      marginRight: 8,
    }}>
      <TouchableOpacity 
        style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          padding: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={() => router.push('/(tabs)/inbox')}
      >
        <Mail size={20} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          padding: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={() => router.push('/(tabs)/shop')}
      >
        <ShoppingCart size={20} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          padding: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <User size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <StatusBar style="light" />
          <RootLayoutNav />
          <NotificationSystem />
        </View>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold' as const,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
        headerRight: () => <HeaderIcons />,
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="character-creation" 
        options={{ 
          title: "Create Character",
          headerBackTitle: "Back",
          presentation: "modal",
        }} 
      />
    </Stack>
  );
}