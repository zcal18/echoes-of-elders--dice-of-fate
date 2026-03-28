import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CombatSystem from '@/components/Game/CombatSystem';
import { PvpCombatSystem } from '@/components/Game/PvpCombatSystem';
import colors from '@/constants/colors';

type CombatTab = 'npc' | 'pvp';

export default function CombatScreen() {
  const [activeTab, setActiveTab] = useState<CombatTab>('npc');

  const renderTabButton = (tab: CombatTab, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabIcon,
        activeTab === tab && styles.activeTabIcon
      ]}>
        {icon}
      </Text>
      <Text style={[
        styles.tabLabel,
        activeTab === tab && styles.activeTabLabel
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>⚔️ Battle Arena</Text>
        <View style={styles.tabContainer}>
          {renderTabButton('npc', 'NPC Battles', '🐉')}
          {renderTabButton('pvp', 'PVP Arena', '⚔️')}
        </View>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'npc' ? (
          <CombatSystem />
        ) : (
          <PvpCombatSystem />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabIcon: {
    fontSize: 18,
  },
  activeTabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabLabel: {
    color: colors.text,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});