import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, TextInput, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Users, Shield, Settings, Database, Ban, UserX, Plus, Edit, Trash2, Upload, Save, X } from 'lucide-react-native';
import { useGameStore } from '@/hooks/useGameStore';
import { EnemyEditorData, Enemy } from '@/types/game';
import colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function AdminPanelScreen() {
  const router = useRouter();
  const { 
    userRole, 
    bannedUsers, 
    banUser, 
    unbanUser, 
    createEnemy, 
    updateEnemy, 
    deleteEnemy, 
    uploadEnemyImage, 
    getAllEnemiesForAdmin,
    setUserRole 
  } = useGameStore();
  
  const [showEnemyEditor, setShowEnemyEditor] = useState(false);
  const [editingEnemy, setEditingEnemy] = useState<Enemy | null>(null);
  const [enemyForm, setEnemyForm] = useState<EnemyEditorData>({
    name: '',
    description: '',
    level: 1,
    requiredLevel: 1,
    maxHealth: 50,
    attack: 10,
    defense: 5,
    experience: 25,
    gold: 10,
    difficulty: 'normal',
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    armorClass: 10,
    damageDie: 6,
    attacks: [{ name: 'Basic Attack', damage: '1d6', description: 'A simple attack' }],
    abilities: [],
    weaknesses: [],
    resistances: [],
    profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
    environment: 'forest',
    lore: ''
  });
  
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
  
  const handleCreateEnemy = () => {
    setEditingEnemy(null);
    setEnemyForm({
      name: '',
      description: '',
      level: 1,
      requiredLevel: 1,
      maxHealth: 50,
      attack: 10,
      defense: 5,
      experience: 25,
      gold: 10,
      difficulty: 'normal',
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      armorClass: 10,
      damageDie: 6,
      attacks: [{ name: 'Basic Attack', damage: '1d6', description: 'A simple attack' }],
      abilities: [],
      weaknesses: [],
      resistances: [],
      profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
      environment: 'forest',
      lore: ''
    });
    setShowEnemyEditor(true);
  };
  
  const handleEditEnemy = (enemy: Enemy) => {
    setEditingEnemy(enemy);
    setEnemyForm({
      id: enemy.id,
      name: enemy.name,
      description: enemy.description,
      level: enemy.level,
      requiredLevel: enemy.requiredLevel,
      maxHealth: enemy.maxHealth,
      attack: enemy.attack,
      defense: enemy.defense,
      experience: enemy.experience,
      gold: enemy.gold,
      difficulty: enemy.difficulty,
      stats: enemy.stats,
      armorClass: enemy.armorClass || 10,
      damageDie: enemy.damageDie || 6,
      attacks: enemy.attacks,
      abilities: enemy.abilities || [],
      weaknesses: enemy.weaknesses || [],
      resistances: enemy.resistances || [],
      profileImage: enemy.profileImage || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face',
      environment: enemy.environment || 'forest',
      lore: enemy.lore || ''
    });
    setShowEnemyEditor(true);
  };
  
  const handleSaveEnemy = () => {
    if (!enemyForm.name.trim()) {
      Alert.alert('Error', 'Enemy name is required');
      return;
    }
    
    if (editingEnemy) {
      updateEnemy(editingEnemy.id, enemyForm);
    } else {
      createEnemy(enemyForm);
    }
    
    setShowEnemyEditor(false);
    setEditingEnemy(null);
  };
  
  const handleDeleteEnemy = (enemyId: string) => {
    Alert.alert(
      'Delete Enemy',
      'Are you sure you want to delete this enemy?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteEnemy(enemyId)
        }
      ]
    );
  };
  
  const handleImageUpload = () => {
    Alert.prompt(
      'Upload Image',
      'Enter image URL:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upload', 
          onPress: (imageUrl) => {
            if (imageUrl) {
              setEnemyForm(prev => ({ ...prev, profileImage: imageUrl }));
            }
          }
        }
      ],
      'plain-text',
      enemyForm.profileImage
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
      title: 'NPC Enemy Editor',
      description: 'Create and edit game enemies',
      icon: Plus,
      color: colors.secondary,
      onPress: handleCreateEnemy
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
  
  const allEnemies = getAllEnemiesForAdmin();
  
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
              <Text style={styles.statLabel}>Custom Enemies</Text>
              <Text style={styles.statValue}>{allEnemies.filter(e => e.id.startsWith('custom_')).length}</Text>
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
        
        {/* Enemy Management */}
        <View style={styles.enemySection}>
          <Text style={styles.sectionTitle}>Enemy Management</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.enemyGrid}>
              {allEnemies.slice(0, 10).map((enemy) => (
                <View key={enemy.id} style={styles.enemyCard}>
                  <Text style={styles.enemyName}>{enemy.name}</Text>
                  <Text style={styles.enemyLevel}>Level {enemy.level}</Text>
                  <Text style={styles.enemyDifficulty}>{enemy.difficulty}</Text>
                  <View style={styles.enemyActions}>
                    <TouchableOpacity
                      style={[styles.enemyActionButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleEditEnemy(enemy)}
                    >
                      <Edit size={16} color={colors.text} />
                    </TouchableOpacity>
                    {enemy.id.startsWith('custom_') && (
                      <TouchableOpacity
                        style={[styles.enemyActionButton, { backgroundColor: colors.error }]}
                        onPress={() => handleDeleteEnemy(enemy.id)}
                      >
                        <Trash2 size={16} color={colors.text} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        
        {/* Warning Section */}
        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>⚠️ Administrator Warning</Text>
          <Text style={styles.warningText}>
            Admin actions are logged and monitored. Use these tools responsibly and in accordance with game policies.
          </Text>
        </View>
      </ScrollView>
      
      {/* Enemy Editor Modal */}
      <Modal
        visible={showEnemyEditor}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingEnemy ? 'Edit Enemy' : 'Create Enemy'}
            </Text>
            <TouchableOpacity onPress={() => setShowEnemyEditor(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Basic Information</Text>
              
              <TextInput
                style={styles.textInput}
                placeholder="Enemy Name"
                placeholderTextColor={colors.textSecondary}
                value={enemyForm.name}
                onChangeText={(text) => setEnemyForm(prev => ({ ...prev, name: text }))}
              />
              
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Description"
                placeholderTextColor={colors.textSecondary}
                value={enemyForm.description}
                onChangeText={(text) => setEnemyForm(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
              
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Level</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={enemyForm.level.toString()}
                    onChangeText={(text) => setEnemyForm(prev => ({ ...prev, level: parseInt(text) || 1 }))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Required Level</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={enemyForm.requiredLevel.toString()}
                    onChangeText={(text) => setEnemyForm(prev => ({ ...prev, requiredLevel: parseInt(text) || 1 }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Combat Stats</Text>
              
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Health</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={enemyForm.maxHealth.toString()}
                    onChangeText={(text) => setEnemyForm(prev => ({ ...prev, maxHealth: parseInt(text) || 50 }))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Attack</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={enemyForm.attack.toString()}
                    onChangeText={(text) => setEnemyForm(prev => ({ ...prev, attack: parseInt(text) || 10 }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Defense</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={enemyForm.defense.toString()}
                    onChangeText={(text) => setEnemyForm(prev => ({ ...prev, defense: parseInt(text) || 5 }))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Armor Class</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={enemyForm.armorClass.toString()}
                    onChangeText={(text) => setEnemyForm(prev => ({ ...prev, armorClass: parseInt(text) || 10 }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Rewards</Text>
              
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Experience</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={enemyForm.experience.toString()}
                    onChangeText={(text) => setEnemyForm(prev => ({ ...prev, experience: parseInt(text) || 25 }))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Gold</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={enemyForm.gold.toString()}
                    onChangeText={(text) => setEnemyForm(prev => ({ ...prev, gold: parseInt(text) || 10 }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Image</Text>
              <TouchableOpacity style={styles.imageUploadButton} onPress={handleImageUpload}>
                <Upload size={20} color={colors.text} />
                <Text style={styles.imageUploadText}>Upload Image</Text>
              </TouchableOpacity>
              <Text style={styles.imageUrlText} numberOfLines={1}>
                {enemyForm.profileImage}
              </Text>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Lore</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enemy lore and background story..."
                placeholderTextColor={colors.textSecondary}
                value={enemyForm.lore}
                onChangeText={(text) => setEnemyForm(prev => ({ ...prev, lore: text }))}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowEnemyEditor(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveEnemy}
            >
              <Save size={20} color={colors.text} />
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  enemySection: {
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
  enemyGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  enemyCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    width: 150,
    alignItems: 'center',
  },
  enemyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  enemyLevel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  enemyDifficulty: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  enemyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  enemyActionButton: {
    borderRadius: 8,
    padding: 8,
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  numberInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  imageUploadText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  imageUrlText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});