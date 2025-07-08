import { Stack } from "expo-router";
import colors from "@/constants/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Echoes of Elders",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          title: "Login",
          headerBackTitle: "Back",
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: "Register",
          headerBackTitle: "Back",
        }} 
      />
    </Stack>
  );
}