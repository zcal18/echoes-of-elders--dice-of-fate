import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import ChatSystem from '@/components/Game/ChatSystem';
import { useGameStore } from '@/hooks/useGameStore';
import colors from '@/constants/colors';

export default function ChatScreen() {
  const { chatPopout } = useGameStore();
  
  // If chat is popped out, don't render it in the tab
  if (chatPopout) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Chat', headerShown: false }} />
        <View style={styles.popoutMessage}>
          <Text style={styles.popoutText}>Chat is currently popped out</Text>
          <Text style={styles.popoutSubtext}>Close the pop-out window to use chat here</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Chat', headerShown: false }} />
      <ChatSystem />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  popoutMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  popoutText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  popoutSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});