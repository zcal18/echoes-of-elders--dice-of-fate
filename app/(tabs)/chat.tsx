import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Mail, ShoppingCart, User } from 'lucide-react-native';
import ChatSystem from '@/components/Game/ChatSystem';
import { useGameStore } from '@/hooks/useGameStore';
import { getWebSocketStatus } from '@/lib/trpc';
import colors from '@/constants/colors';

export default function ChatScreen() {
  const router = useRouter();
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
          headerShown: true,
          title: 'Chat',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <View style={styles.connectionStatus}>
                <View style={[
                  styles.connectionDot,
                  { backgroundColor: connectionStatus === 'connected' ? colors.success : colors.error }
                ]} />
              </View>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/(tabs)/inbox')}
              >
                <Mail size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/(tabs)/shop')}
              >
                <ShoppingCart size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <User size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  connectionStatus: {
    marginRight: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});