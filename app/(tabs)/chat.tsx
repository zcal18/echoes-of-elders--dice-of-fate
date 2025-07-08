import React from 'react';
import { View, StyleSheet } from 'react-native';
import ChatSystem from '@/components/Game/ChatSystem';
import colors from '@/constants/colors';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
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