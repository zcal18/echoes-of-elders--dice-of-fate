import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import ChatSystem from '@/components/Game/ChatSystem';
import { useGameStore } from '@/hooks/useGameStore';
import { getWebSocketStatus } from '@/lib/trpc';
import colors from '@/constants/colors';

export default function ChatScreen() {
  const { chatPopout } = useGameStore();
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  
  // Update connection status periodically
  useEffect(() => {
    const updateStatus = () => {
      const status = getWebSocketStatus();
      setConnectionStatus(status);
    };
    
    // Initial check
    updateStatus();
    
    // Update every second
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false
        }} 
      />
      <ChatSystem />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});