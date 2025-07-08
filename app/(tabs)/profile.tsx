import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Modal, Platform, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { Mail, ShoppingCart, User, Settings, Users } from 'lucide-react-native';
import { useGameStore } from '@/hooks/useGameStore';
import colors from '@/constants/colors';
import ReactivePlayerCard from '@/components/Game/ReactivePlayerCard';
import * as ImagePicker from 'expo-image-picker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    isAuthenticated, 
    activeCharacter, 
    characters,
    activeParty,
    guilds,
    diamonds,
    userRole,
    selectCharacter,
    updateCharacterProfileImage,
    logout,
    canSummonFamiliar,
    summonFamiliar,
    dismissFamiliar,
    createParty,
    leaveParty
  } = useGameStore();
  
  const [showCharacterCard, setShowCharacterCard] = useState(false);
  const [showFamiliarModal, setShowFamiliarModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showImageCropModal, setShowImageCropModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | undefined>(undefined);
  
  if (!isAuthenticated) {
    router.replace('/(auth)');
    return null;
  }
  
  if (!activeCharacter) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No character selected</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/character-creation')}
        >
          <Text style={styles.createButtonText}>Create Character</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const handleImagePicker = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll use a simple file input approach
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event: any) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                setTempImage(e.target.result as string);
                setShowImageCropModal(true);
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      }
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera roll permissions to change your profile picture.');
        return;
      }
      
      // Show crop options for mobile
      Alert.alert(
        'Choose Crop Style',
        'Select how you want to crop your image',
        [
          {
            text: 'Square (1:1)',
            onPress: () => launchImagePicker([1, 1])
          },
          {
            text: 'Portrait (3:4)',
            onPress: () => launchImagePicker([3, 4])
          },
          {
            text: 'Free Crop',
            onPress: () => launchImagePicker()
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const launchImagePicker = async (aspect?: [number, number]) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspect || [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      
      if (!result.canceled && result.assets[0]) {
        updateCharacterProfileImage(activeCharacter.id, result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error launching image picker:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const confirmImageCrop = () => {
    if (tempImage && activeCharacter) {
      updateCharacterProfileImage(activeCharacter.id, tempImage);
      setShowImageCropModal(false);
      setTempImage(undefined);
    }
  };
  
  const cancelImageCrop = () => {
    setShowImageCropModal(false);
    setTempImage(undefined);
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => {
          logout();
          router.replace('/(auth)');
        }}
      ]
    );
  };
  
  const handleAdminPanel = () => {
    router.push('/admin-panel');
  };
  
  const getGuildInfo = () => {
    if (!activeCharacter.guildId) return null;
    const guild = guilds.find(g => g.id === activeCharacter.guildId);
    if (!guild) return null;
    
    const member = guild.members.find(m => m.id === activeCharacter.id);
    return {
      name: guild.name,
      rank: member?.rank || 'R1',
      clanTag: guild.clanTag
    };
  };
  
  // Get display names for race and class, handling custom cases
  const getRaceDisplayName = (): string => {
    if (activeCharacter.race === 'custom' && activeCharacter.customRace) {
      return activeCharacter.customRace.name || "Custom Race";
    }
    const race = activeCharacter.race || "Unknown Race";
    return race.charAt(0).toUpperCase() + race.slice(1).toLowerCase();
  };
  
  const getClassDisplayName = (): string => {
    if (activeCharacter.class === 'custom' && activeCharacter.customClass) {
      return activeCharacter.customClass.name || "Custom Class";
    }
    const characterClass = activeCharacter.class || "Unknown Class";
    return characterClass.charAt(0).toUpperCase() + characterClass.slice(1).toLowerCase();
  };
  
  const guildInfo = getGuildInfo();
  
  // Transform buffs/debuffs to the expected format for ReactivePlayerCard
  const transformBuffs = (buffs: any[] = []) => {
    if (!buffs || !Array.isArray(buffs)) return [];
    
    // If buffs are already in the correct format, return them
    if (buffs.length > 0 && typeof buffs[0] === 'object' && buffs[0].name) {
      return buffs;
    }
    
    // Otherwise, transform string buffs to objects
    return buffs.map(buff => ({
      name: typeof buff === 'string' ? buff : 'Buff',
      effect: typeof buff === 'string' ? buff : 'Effect',
      duration: 3,
      type: "attack" as const
    }));
  };
  
  const transformDebuffs = (debuffs: any[] = []) => {
    if (!debuffs || !Array.isArray(debuffs)) return [];
    
    // If debuffs are already in the correct format, return them
    if (debuffs.length > 0 && typeof debuffs[0] === 'object' && debuffs[0].name) {
      return debuffs;
    }
    
    // Otherwise, transform string debuffs to objects
    return debuffs.map(debuff => ({
      name: typeof debuff === 'string' ? debuff : 'Debuff',
      effect: typeof debuff === 'string' ? debuff : 'Effect',
      duration: 3,
      type: "defense" as const
    }));
  };
  
  // Ensure health and mana objects exist with default values if they don't
  const health = activeCharacter.health || { current: 0, max: 0 };
  const mana = activeCharacter.mana || { current: 0, max: 0 };
  
  const characterAsParticipant = {
    id: activeCharacter.id,
    name: activeCharacter.name || "",
    level: activeCharacter.level,
    race: activeCharacter.race,
    class: activeCharacter.class,
    health: health,
    mana: mana,
    stats: activeCharacter.stats || {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    },
    isPlayer: true,
    buffs: transformBuffs(activeCharacter.buffs || []),
    debuffs: transformDebuffs(activeCharacter.debuffs || []),
    profileImage: activeCharacter.profileImage,
    lastDiceRoll: activeCharacter.lastDiceRoll ? {
      ...activeCharacter.lastDiceRoll,
      diceType: activeCharacter.lastDiceRoll.diceType || 20,
      modifier: activeCharacter.lastDiceRoll.modifier || 0
    } : undefined,
    customRace: activeCharacter.customRace,
    customClass: activeCharacter.customClass
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/(tabs)/inbox')}
              >
                <Mail size={isTablet ? 24 : 20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/(tabs)/shop')}
              >
                <ShoppingCart size={isTablet ? 24 : 20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <User size={isTablet ? 24 : 20} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Character Header */}
        <View style={styles.characterHeader}>
          <TouchableOpacity onPress={handleImagePicker} style={styles.profileImageContainer}>
            {activeCharacter.profileImage ? (
              <Image source={{ uri: activeCharacter.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitial}>
                  {activeCharacter.name && activeCharacter.name.length > 0 
                    ? activeCharacter.name.charAt(0).toUpperCase() 
                    : "?"}
                </Text>
              </View>
            )}
            <View style={styles.editImageOverlay}>
              <Text style={styles.editImageText}>📷</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.characterInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.characterName}>{activeCharacter.name || "Unnamed"}</Text>
              {guildInfo && (
                <Text style={styles.clanTag}>[{guildInfo.clanTag}]</Text>
              )}
            </View>
            <Text style={styles.characterDetails}>
              Level {activeCharacter.level} {getRaceDisplayName()} {getClassDisplayName()}
            </Text>
            {guildInfo && (
              <Text style={styles.guildInfo}>
                {guildInfo.name} ({guildInfo.rank})
              </Text>
            )}
            {activeCharacter.familiar && (
              <Text style={styles.familiarInfo}>
                🐾 Familiar: {activeCharacter.familiar.name} (Lv.{activeCharacter.familiar.level})
              </Text>
            )}
            {activeParty && (
              <Text style={styles.partyInfo}>
                👥 Party: {activeParty.name} ({activeParty.members.length} members)
              </Text>
            )}
            
            {/* Health and Mana Display */}
            <View style={styles.healthManaContainer}>
              <Text style={styles.healthManaText}>
                ❤️ {health.max} | 🪄 {mana.max}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.cardButton}
            onPress={() => setShowCharacterCard(true)}
          >
            <Text style={styles.cardButtonText}>View Card</Text>
          </TouchableOpacity>
        </View>
        
        {/* Currency Display */}
        <View style={styles.currencySection}>
          <View style={styles.currencyCard}>
            <Text style={styles.currencyLabel}>Gold</Text>
            <Text style={styles.currencyValue}>💰 {activeCharacter.gold}</Text>
          </View>
          <View style={styles.currencyCard}>
            <Text style={styles.currencyLabel}>Diamonds</Text>
            <Text style={styles.currencyValue}>💎 {diamonds}</Text>
          </View>
        </View>
        
        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Character Stats</Text>
          
          <View style={styles.primaryStats}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Health</Text>
              <Text style={styles.statValue}>
                {health.current}/{health.max}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Mana</Text>
              <Text style={styles.statValue}>
                {mana.current}/{mana.max}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Level</Text>
              <Text style={styles.statValue}>{activeCharacter.level}</Text>
            </View>
          </View>
          
          <View style={styles.attributeStats}>
            <View style={styles.attributeRow}>
              <View style={styles.attributeCard}>
                <Text style={styles.attributeLabel}>STR</Text>
                <Text style={styles.attributeValue}>{activeCharacter.stats?.strength || 0}</Text>
              </View>
              <View style={styles.attributeCard}>
                <Text style={styles.attributeLabel}>DEX</Text>
                <Text style={styles.attributeValue}>{activeCharacter.stats?.dexterity || 0}</Text>
              </View>
              <View style={styles.attributeCard}>
                <Text style={styles.attributeLabel}>INT</Text>
                <Text style={styles.attributeValue}>{activeCharacter.stats?.intelligence || 0}</Text>
              </View>
            </View>
            
            <View style={styles.attributeRow}>
              <View style={styles.attributeCard}>
                <Text style={styles.attributeLabel}>CON</Text>
                <Text style={styles.attributeValue}>{activeCharacter.stats?.constitution || 0}</Text>
              </View>
              <View style={styles.attributeCard}>
                <Text style={styles.attributeLabel}>WIS</Text>
                <Text style={styles.attributeValue}>{activeCharacter.stats?.wisdom || 0}</Text>
              </View>
              <View style={styles.attributeCard}>
                <Text style={styles.attributeLabel}>CHA</Text>
                <Text style={styles.attributeValue}>{activeCharacter.stats?.charisma || 0}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Experience Progress */}
        <View style={styles.experienceSection}>
          <Text style={styles.sectionTitle}>Experience Progress</Text>
          <View style={styles.experienceBar}>
            <View 
              style={[
                styles.experienceProgress,
                { width: `${((activeCharacter.experience || 0) / (activeCharacter.experienceToNextLevel || 1)) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.experienceText}>
            {activeCharacter.experience || 0} / {activeCharacter.experienceToNextLevel || 100} XP to next level
          </Text>
        </View>
        
        {/* Familiar Section */}
        <View style={styles.familiarSection}>
          <Text style={styles.sectionTitle}>Familiar</Text>
          {activeCharacter.familiar ? (
            <View style={styles.familiarCard}>
              <Text style={styles.familiarName}>
                {activeCharacter.familiar.name} ({activeCharacter.familiar.type})
              </Text>
              <Text style={styles.familiarLevel}>
                Level {activeCharacter.familiar.level} - Loyalty: {activeCharacter.familiar.loyalty}%
              </Text>
              <View style={styles.familiarActions}>
                <TouchableOpacity 
                  style={styles.familiarButton}
                  onPress={() => setShowCharacterCard(true)}
                >
                  <Text style={styles.familiarButtonText}>View Stats</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.familiarButton, styles.dismissButton]}
                  onPress={dismissFamiliar}
                >
                  <Text style={styles.familiarButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.summonButton}
              onPress={() => setShowFamiliarModal(true)}
            >
              <Text style={styles.summonButtonText}>Summon Familiar</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Party Section */}
        <View style={styles.partySection}>
          <Text style={styles.sectionTitle}>Party</Text>
          {activeParty ? (
            <View style={styles.partyCard}>
              <Text style={styles.partyName}>{activeParty.name}</Text>
              <Text style={styles.partyMembers}>
                {activeParty.members.length}/{activeParty.maxMembers} members
              </Text>
              <TouchableOpacity 
                style={[styles.partyButton, styles.leavePartyButton]}
                onPress={leaveParty}
              >
                <Text style={styles.partyButtonText}>Leave Party</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.createPartyButton}
              onPress={() => setShowPartyModal(true)}
            >
              <Text style={styles.createPartyButtonText}>Create Party</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Character Selection */}
        {characters.length > 1 && (
          <View style={styles.characterSelection}>
            <Text style={styles.sectionTitle}>Switch Character</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {characters.map(character => (
                <TouchableOpacity
                  key={character.id}
                  style={[
                    styles.characterOption,
                    character.id === activeCharacter.id && styles.activeCharacterOption
                  ]}
                  onPress={() => selectCharacter(character.id)}
                >
                  {character.profileImage ? (
                    <Image source={{ uri: character.profileImage }} style={styles.characterOptionImage} />
                  ) : (
                    <View style={styles.characterOptionPlaceholder}>
                      <Text style={styles.characterOptionInitial}>
                        {character.name && character.name.length > 0 
                          ? character.name.charAt(0).toUpperCase() 
                          : "?"}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.characterOptionName}>{character.name || "Unnamed"}</Text>
                  <Text style={styles.characterOptionLevel}>Lv. {character.level}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/character-management')}
          >
            <View style={styles.adminButtonContent}>
              <Users size={isTablet ? 20 : 18} color={colors.text} />
              <Text style={styles.actionButtonText}>Manage Characters</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/character-creation')}
          >
            <Text style={styles.actionButtonText}>Create New Character</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
          
          {/* Admin Panel Button - Only show for admin users */}
          {userRole === 'admin' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.adminButton]}
              onPress={handleAdminPanel}
            >
              <View style={styles.adminButtonContent}>
                <Settings size={isTablet ? 20 : 18} color={colors.text} />
                <Text style={styles.actionButtonText}>Admin Panel</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      
      {/* Character Card Modal */}
      <Modal
        visible={showCharacterCard}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCharacterCard(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Character Card</Text>
            
            <View style={styles.cardContainer}>
              <ReactivePlayerCard
                participant={characterAsParticipant}
                isActive={false}
                isAnimating={false}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowCharacterCard(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Image Crop Modal */}
      <Modal
        visible={showImageCropModal}
        animationType="slide"
        transparent={true}
        onRequestClose={cancelImageCrop}
      >
        <View style={styles.cropModalOverlay}>
          <View style={styles.cropModalContent}>
            <Text style={styles.cropModalTitle}>Preview & Adjust</Text>
            <Text style={styles.cropModalSubtitle}>This is how your image will appear on your character card</Text>
            
            {tempImage && (
              <View style={styles.cropPreviewContainer}>
                <View style={styles.cropPreview}>
                  <Image source={{ uri: tempImage }} style={styles.cropPreviewImage} />
                </View>
                <Text style={styles.cropHint}>Image will be automatically centered and cropped to fit</Text>
              </View>
            )}
            
            <View style={styles.cropButtonContainer}>
              <TouchableOpacity style={styles.cropCancelButton} onPress={cancelImageCrop}>
                <Text style={styles.cropButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cropConfirmButton} onPress={confirmImageCrop}>
                <Text style={styles.cropButtonText}>Use This Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Familiar Modal */}
      <Modal
        visible={showFamiliarModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFamiliarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Summon Familiar</Text>
            <Text style={styles.modalSubtitle}>Choose your companion wisely</Text>
            
            <ScrollView style={styles.familiarTypesList}>
              {(['sprite', 'raven', 'wolf', 'golem', 'dragon', 'phoenix'] as const).map(type => {
                const { canSummon, reason, cost } = canSummonFamiliar(type);
                
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.familiarTypeItem,
                      !canSummon && styles.familiarTypeItemDisabled
                    ]}
                    onPress={() => {
                      if (canSummon) {
                        const success = summonFamiliar(type, `${type.charAt(0).toUpperCase() + type.slice(1)} Companion`);
                        if (success) {
                          setShowFamiliarModal(false);
                        }
                      } else {
                        Alert.alert('Cannot Summon', reason);
                      }
                    }}
                    disabled={!canSummon}
                  >
                    <View style={styles.familiarTypeHeader}>
                      <Text style={styles.familiarTypeName}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                      <Text style={styles.familiarTypeCost}>💎 {cost}</Text>
                    </View>
                    <Text style={styles.familiarTypeDescription}>
                      A loyal {type} companion to aid you in battle.
                    </Text>
                    {!canSummon && (
                      <Text style={styles.familiarTypeReason}>{reason}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowFamiliarModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Party Modal */}
      <Modal
        visible={showPartyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPartyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Party</Text>
            
            <TouchableOpacity
              style={styles.createPartyModalButton}
              onPress={() => {
                const partyName = `${activeCharacter.name || "Player"}'s Party`;
                createParty(partyName);
                setShowPartyModal(false);
              }}
            >
              <Text style={styles.createPartyModalButtonText}>Create Party</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowPartyModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Cancel</Text>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8,
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
  content: {
    padding: isTablet ? 24 : 16,
    paddingBottom: 32,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: isTablet ? 18 : 16,
    textAlign: 'center',
    marginTop: 20,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  createButtonText: {
    color: colors.text,
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  profileImageContainer: {
    position: 'relative',
    marginRight: isTablet ? 20 : 16,
  },
  profileImage: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 16 : 12,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profilePlaceholder: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 16 : 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  profileInitial: {
    fontSize: isTablet ? 40 : 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    width: isTablet ? 32 : 24,
    height: isTablet ? 32 : 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageText: {
    fontSize: isTablet ? 16 : 12,
  },
  characterInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  characterName: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  clanTag: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  characterDetails: {
    fontSize: isTablet ? 18 : 16,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  guildInfo: {
    fontSize: isTablet ? 16 : 14,
    color: colors.success,
    marginBottom: 2,
  },
  familiarInfo: {
    fontSize: isTablet ? 16 : 14,
    color: colors.primary,
    marginBottom: 2,
  },
  partyInfo: {
    fontSize: isTablet ? 16 : 14,
    color: colors.warning,
    marginBottom: 8,
  },
  healthManaContainer: {
    marginTop: 4,
  },
  healthManaText: {
    fontSize: isTablet ? 16 : 14,
    color: colors.text,
    fontWeight: '600',
  },
  cardButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: isTablet ? 20 : 16,
    paddingVertical: isTablet ? 12 : 8,
  },
  cardButtonText: {
    color: colors.text,
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
  currencySection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  currencyCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currencyLabel: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  currencyValue: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
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
  primaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: isTablet ? 12 : 8,
  },
  statCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: isTablet ? 16 : 12,
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: isTablet ? 20 : 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  attributeStats: {
    gap: isTablet ? 12 : 8,
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: isTablet ? 12 : 8,
  },
  attributeCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: isTablet ? 12 : 8,
    alignItems: 'center',
    flex: 1,
  },
  attributeLabel: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  attributeValue: {
    fontSize: isTablet ? 18 : 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  experienceSection: {
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
  experienceBar: {
    height: isTablet ? 16 : 12,
    backgroundColor: colors.surfaceDark,
    borderRadius: isTablet ? 8 : 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  experienceProgress: {
    height: '100%',
    backgroundColor: colors.experience,
    borderRadius: isTablet ? 8 : 6,
  },
  experienceText: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  familiarSection: {
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
  familiarCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: isTablet ? 16 : 12,
  },
  familiarName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  familiarLevel: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  familiarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  familiarButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: isTablet ? 12 : 8,
    alignItems: 'center',
  },
  dismissButton: {
    backgroundColor: colors.error,
  },
  familiarButtonText: {
    color: colors.text,
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
  summonButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    alignItems: 'center',
  },
  summonButtonText: {
    color: colors.text,
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
  partySection: {
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
  partyCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: isTablet ? 16 : 12,
  },
  partyName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  partyMembers: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  partyButton: {
    borderRadius: 12,
    paddingVertical: isTablet ? 12 : 8,
    alignItems: 'center',
  },
  leavePartyButton: {
    backgroundColor: colors.error,
  },
  partyButtonText: {
    color: colors.text,
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
  createPartyButton: {
    backgroundColor: colors.warning,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    alignItems: 'center',
  },
  createPartyButtonText: {
    color: colors.text,
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
  characterSelection: {
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
  characterOption: {
    alignItems: 'center',
    marginRight: 16,
    padding: isTablet ? 12 : 8,
    borderRadius: 16,
    backgroundColor: colors.background,
    minWidth: isTablet ? 100 : 80,
  },
  activeCharacterOption: {
    backgroundColor: colors.primary,
  },
  characterOptionImage: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 60 : 50,
    borderRadius: isTablet ? 12 : 8,
    marginBottom: 8,
  },
  characterOptionPlaceholder: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 60 : 50,
    borderRadius: isTablet ? 12 : 8,
    backgroundColor: colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterOptionInitial: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  characterOptionName: {
    fontSize: isTablet ? 14 : 12,
    color: colors.text,
    marginBottom: 2,
    textAlign: 'center',
  },
  characterOptionLevel: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButton: {
    backgroundColor: colors.warning,
  },
  adminButton: {
    backgroundColor: colors.secondary,
  },
  adminButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: isTablet ? 24 : 20,
    alignItems: 'center',
    maxWidth: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
    marginBottom: 20,
  },
  familiarTypesList: {
    maxHeight: isTablet ? 400 : 300,
    width: '100%',
  },
  familiarTypeItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    marginBottom: 8,
  },
  familiarTypeItemDisabled: {
    opacity: 0.5,
  },
  familiarTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  familiarTypeName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  familiarTypeCost: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  familiarTypeDescription: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  familiarTypeReason: {
    fontSize: isTablet ? 14 : 12,
    color: colors.error,
    fontStyle: 'italic',
  },
  createPartyModalButton: {
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingVertical: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? 24 : 20,
    marginBottom: 16,
  },
  createPartyModalButtonText: {
    color: colors.text,
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? 32 : 24,
    minWidth: isTablet ? 120 : 100,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: colors.text,
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
  // Crop Modal Styles
  cropModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cropModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: Math.min(400, screenWidth * 0.9),
    maxHeight: screenHeight * 0.8,
  },
  cropModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  cropModalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  cropPreviewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cropPreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  cropPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cropHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cropButtonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  cropCancelButton: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cropConfirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cropButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});