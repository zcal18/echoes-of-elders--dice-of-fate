import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@/hooks/useGameStore';
import InventorySystem from '@/components/Game/InventorySystem';
import EquipmentSystem from '@/components/Game/EquipmentSystem';
import colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function InventoryScreen() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'equipment'>('inventory');
  
  const router = useRouter();
  const { isAuthenticated, activeCharacter } = useGameStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)');
    } else if (!activeCharacter) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, activeCharacter]);
  
  if (!isAuthenticated || !activeCharacter) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'inventory' && styles.activeTab
          ]}
          onPress={() => setActiveTab('inventory')}
        >
          <Text 
            style={[
              styles.tabText,
              activeTab === 'inventory' && styles.activeTabText
            ]}
          >
            Inventory
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'equipment' && styles.activeTab
          ]}
          onPress={() => setActiveTab('equipment')}
        >
          <Text 
            style={[
              styles.tabText,
              activeTab === 'equipment' && styles.activeTabText
            ]}
          >
            Equipment
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'inventory' ? (
          <InventorySystem />
        ) : (
          <EquipmentSystem />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceDark,
  },
  title: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    margin: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});