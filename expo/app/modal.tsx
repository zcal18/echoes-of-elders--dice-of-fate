import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';

export default function ModalScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://i.ibb.co/hJMRkWp9/EoE-DoF.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Welcome to Ryh'Din</Text>
        <Text style={styles.paragraph}>
          Echoes of Elders: The Dice of Fate is a text-based MMORPG set in the mystical realm of Ryh'Din. 
          Embark on an epic journey, battle fearsome creatures, discover ancient artifacts, and forge your legend.
        </Text>
        
        <Text style={styles.sectionTitle}>Game Features</Text>
        <Text style={styles.listItem}>• Create unique characters with different races and classes</Text>
        <Text style={styles.listItem}>• Engage in strategic turn-based combat</Text>
        <Text style={styles.listItem}>• Collect and equip powerful items</Text>
        <Text style={styles.listItem}>• Chat with other players in various channels</Text>
        <Text style={styles.listItem}>• Level up and improve your character's abilities</Text>
        
        <Text style={styles.sectionTitle}>How to Play</Text>
        <Text style={styles.paragraph}>
          After creating your character, you can explore the world of Ryh'Din through the various tabs:
        </Text>
        <Text style={styles.listItem}>• Home: View your character stats and game news</Text>
        <Text style={styles.listItem}>• Chat: Communicate with other players</Text>
        <Text style={styles.listItem}>• Combat: Battle monsters and earn rewards</Text>
        <Text style={styles.listItem}>• Inventory: Manage your items and equipment</Text>
        <Text style={styles.listItem}>• Profile: View and switch between your characters</Text>
        
        <Text style={styles.sectionTitle}>About the Developers</Text>
        <Text style={styles.paragraph}>
          Echoes of Elders is developed by a passionate team of fantasy enthusiasts and game developers. 
          We're constantly working to improve the game and add new features.
        </Text>
        
        <Text style={styles.version}>Version 1.0.0 (Beta)</Text>
      </ScrollView>
      
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  logo: {
    width: 240,
    height: 140,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  listItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
    paddingLeft: 8,
  },
  version: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
});