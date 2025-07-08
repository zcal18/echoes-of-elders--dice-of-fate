import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useGameStore } from '@/hooks/useGameStore';
import colors from '@/constants/colors';
import { Plus, Trash2, User, Crown, Sword, Shield } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function CharacterManagementScreen() {
  const router = useRouter();
  const { characters, activeCharacter, selectCharacter, deleteCharacter } = useGameStore();
  const [deletingCharacterId, setDeletingCharacterId] = useState<string | null>(null);

  const handleDeleteCharacter = (characterId: string, characterName: string) => {
    Alert.alert(
      'Delete Character',
      `Are you sure you want to permanently delete "${characterName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setDeletingCharacterId(null)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCharacter(characterId);
            setDeletingCharacterId(null);
          }
        }
      ]
    );
  };

  const handleSelectCharacter = (characterId: string) => {
    selectCharacter(characterId);
    router.back();
  };

  const getClassIcon = (characterClass: string) => {
    switch (characterClass.toLowerCase()) {
      case 'warrior':
        return <Sword size={isTablet ? 24 : 20} color={colors.error} />;
      case 'mage':
        return <Crown size={isTablet ? 24 : 20} color={colors.primary} />;
      case 'rogue':
        return <Shield size={isTablet ? 24 : 20} color={colors.success} />;
      default:
        return <User size={isTablet ? 24 : 20} color={colors.textSecondary} />;
    }
  };

  const getRaceEmoji = (race: string) => {
    switch (race.toLowerCase()) {
      case 'human':
        return '👤';
      case 'elf':
        return '🧝';
      case 'dwarf':
        return '🧔';
      case 'orc':
        return '👹';
      case 'halfling':
        return '🧙';
      default:
        return '❓';
    }
  };
  
  // Get display names for race and class, handling custom cases
  const getRaceDisplayName = (character: any): string => {
    if (character.race === 'custom' && character.customRace) {
      return character.customRace.name || "Custom Race";
    }
    const race = character.race || "Unknown Race";
    return race.charAt(0).toUpperCase() + race.slice(1).toLowerCase();
  };
  
  const getClassDisplayName = (character: any): string => {
    if (character.class === 'custom' && character.customClass) {
      return character.customClass.name || "Custom Class";
    }
    const characterClass = character.class || "Unknown Class";
    return characterClass.charAt(0).toUpperCase() + characterClass.slice(1).toLowerCase();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Character Management',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Characters</Text>
          <Text style={styles.subtitle}>
            {characters.length}/3 characters created
          </Text>
        </View>

        {/* Character List */}
        <View style={styles.characterList}>
          {characters.map((character) => (
            <View key={character.id} style={styles.characterCard}>
              <TouchableOpacity
                style={[
                  styles.characterContent,
                  activeCharacter?.id === character.id && styles.activeCharacterContent
                ]}
                onPress={() => handleSelectCharacter(character.id)}
              >
                {/* Character Avatar */}
                <View style={styles.avatarSection}>
                  {character.profileImage ? (
                    <Image source={{ uri: character.profileImage }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {character.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {activeCharacter?.id === character.id && (
                    <View style={styles.activeBadge}>
                      <Crown size={12} color={colors.text} />
                    </View>
                  )}
                </View>

                {/* Character Info */}
                <View style={styles.characterInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.characterName}>{character.name}</Text>
                    {activeCharacter?.id === character.id && (
                      <Text style={styles.activeLabel}>ACTIVE</Text>
                    )}
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <Text style={styles.raceEmoji}>{getRaceEmoji(character.race)}</Text>
                    <Text style={styles.characterDetails}>
                      Level {character.level} {getRaceDisplayName(character)} {getClassDisplayName(character)}
                    </Text>
                    {getClassIcon(character.class)}
                  </View>
                  
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Health</Text>
                      <Text style={styles.statValue}>
                        {character.health.current}/{character.health.max}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Gold</Text>
                      <Text style={styles.statValue}>{character.gold}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>XP</Text>
                      <Text style={styles.statValue}>{character.experience}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  setDeletingCharacterId(character.id);
                  handleDeleteCharacter(character.id, character.name);
                }}
                disabled={deletingCharacterId === character.id}
              >
                <Trash2 
                  size={isTablet ? 20 : 16} 
                  color={deletingCharacterId === character.id ? colors.textSecondary : colors.error} 
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Create New Character Button */}
        {characters.length < 3 && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/character-creation')}
          >
            <Plus size={isTablet ? 24 : 20} color={colors.text} />
            <Text style={styles.createButtonText}>Create New Character</Text>
          </TouchableOpacity>
        )}

        {characters.length === 3 && (
          <View style={styles.maxCharactersNotice}>
            <Text style={styles.maxCharactersText}>
              You have reached the maximum of 3 characters. Delete a character to create a new one.
            </Text>
          </View>
        )}

        {characters.length === 0 && (
          <View style={styles.emptyState}>
            <User size={isTablet ? 64 : 48} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Characters Yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first character to begin your adventure in Echoes of Elders!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: isTablet ? 24 : 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
  },
  characterList: {
    gap: 16,
    marginBottom: 24,
  },
  characterCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  characterContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeCharacterContent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: isTablet ? 16 : 12,
    marginLeft: -4,
  },
  avatarSection: {
    position: 'relative',
    marginRight: isTablet ? 16 : 12,
  },
  avatar: {
    width: isTablet ? 64 : 48,
    height: isTablet ? 64 : 48,
    borderRadius: isTablet ? 12 : 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: isTablet ? 64 : 48,
    height: isTablet ? 64 : 48,
    borderRadius: isTablet ? 12 : 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  avatarText: {
    fontSize: isTablet ? 24 : 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  activeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.warning,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
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
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  activeLabel: {
    fontSize: isTablet ? 10 : 8,
    fontWeight: 'bold',
    color: colors.warning,
    backgroundColor: colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  raceEmoji: {
    fontSize: isTablet ? 16 : 14,
    marginRight: 6,
  },
  characterDetails: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: isTablet ? 16 : 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: isTablet ? 10 : 8,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: 'bold',
    color: colors.text,
  },
  deleteButton: {
    padding: isTablet ? 12 : 8,
    borderRadius: 8,
    backgroundColor: colors.errorLight,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  maxCharactersNotice: {
    backgroundColor: colors.warningLight,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  maxCharactersText: {
    fontSize: isTablet ? 14 : 12,
    color: colors.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: isTablet ? 48 : 32,
  },
  emptyStateTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: isTablet ? 24 : 20,
    maxWidth: isTablet ? 400 : 280,
  },
});