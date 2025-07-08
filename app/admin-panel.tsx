import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Users, Shield, Settings, Database, Ban, UserX } from 'lucide-react-native';
import { useGameStore } from '@/hooks/useGameStore';
import colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function AdminPanelScreen() {
  const router = useRouter();
  const { userRole, bannedUsers, banUser, unbanUser } = useGameStore();
  
  // Redirect if not admin
  if (userRole !== 'admin') {
    Alert.alert('Access Denied', 'You do not have permission to access this area.');
    router.back();
    return null;
  }
  
  const handleBanUser = () => {
    Alert.prompt(
      'Ban User',
      'Enter user ID to ban:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Ban', 
          onPress: (userId) => {
            if (userId) {
              banUser(userId, 'Banned by admin');
              Alert.alert('Success', `User ${userId} has been banned.`);
            }
          }
        }
      ]
    );
  };
  
  const handleUnbanUser = () => {
    if (bannedUsers.length === 0) {
      Alert.alert('No Banned Users', 'There are no users currently banned.');
      return;
    }
    
    Alert.alert(
      'Unban User',
      'Select a user to unban:',
      [
        { text: 'Cancel', style: 'cancel' },
        ...bannedUsers.map(userId => ({
          text: userId,
          onPress: () => {
            unbanUser(userId);
            Alert.alert('Success', `User ${userId} has been unbanned.`);
          }
        }))
      ]
    );
  };
  
  const adminActions = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      color: colors.primary,
      onPress: () => Alert.alert('Coming Soon', 'User management features will be available soon.')
    },
    {
      title: 'Ban User',
      description: 'Ban a user from the game',
      icon: Ban,
      color: colors.error,
      onPress: handleBanUser
    },
    {
      title: 'Unban User',
      description: 'Remove ban from a user',
      icon: UserX,
      color: colors.success,
      onPress: handleUnbanUser
    },
    {
      title: 'Game Settings',
      description: 'Configure game parameters and rules',
      icon: Settings,
      color: colors.warning,
      onPress: () => Alert.alert('Coming Soon', 'Game settings will be available soon.')
    },
    {
      title: 'Database Management',
      description: 'Manage game data and statistics',
      icon: Database,
      color: colors.secondary,
      onPress: () => Alert.alert('Coming Soon', 'Database management will be available soon.')
    },
    {
      title: 'Security',
      description: 'Monitor security and anti-cheat systems',
      icon: Shield,
      color: colors.primary,
      onPress: () => Alert.alert('Coming Soon', 'Security features will be available soon.')
    }
  ];
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Admin Panel',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={isTablet ? 24 : 20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Admin Header */}
        <View style={styles.adminHeader}>
          <View style={styles.adminBadge}>
            <Shield size={isTablet ? 32 : 24} color={colors.text} />
          </View>
          <Text style={styles.adminTitle}>Administrator Panel</Text>
          <Text style={styles.adminSubtitle}>
            Manage game systems and user accounts
          </Text>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Banned Users</Text>
              <Text style={styles.statValue}>{bannedUsers.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Active Players</Text>
              <Text style={styles.statValue}>--</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Server Status</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>Online</Text>
            </View>
          </View>
        </View>
        
        {/* Admin Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          <View style={styles.actionsGrid}>
            {adminActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
              >
                <View style={styles.actionHeader}>
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    <action.icon size={isTablet ? 24 : 20} color={colors.text} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </View>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Warning Section */}
        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>⚠️ Administrator Warning</Text>
          <Text style={styles.warningText}>
            Admin actions are logged and monitored. Use these tools responsibly and in accordance with game policies.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  content: {
    padding: isTablet ? 24 : 16,
    paddingBottom: 32,
  },
  adminHeader: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: isTablet ? 32 : 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  adminBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 50,
    padding: isTablet ? 20 : 16,
    marginBottom: 16,
  },
  adminTitle: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  adminSubtitle: {
    fontSize: isTablet ? 18 : 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: isTablet ? 24 : 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  actionsSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: isTablet ? 24 : 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    borderRadius: 12,
    padding: isTablet ? 12 : 8,
    marginRight: 12,
  },
  actionTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  actionDescription: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    lineHeight: isTablet ? 22 : 20,
  },
  warningSection: {
    backgroundColor: colors.error,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    opacity: 0.9,
  },
  warningTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  warningText: {
    fontSize: isTablet ? 16 : 14,
    color: colors.text,
    lineHeight: isTablet ? 22 : 20,
  },
});