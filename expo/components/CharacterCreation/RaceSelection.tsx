import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Race, CustomRace } from '@/types/game';
import { races } from '@/constants/gameData';
import colors from '@/constants/colors';
import { X, Plus } from 'lucide-react-native';

type RaceSelectionProps = {
  selectedRace: string | null;
  onSelectRace: (raceId: string, customRace?: CustomRace) => void;
};

export default function RaceSelection({ selectedRace, onSelectRace }: RaceSelectionProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRaceName, setCustomRaceName] = useState('');
  const [customRaceDescription, setCustomRaceDescription] = useState('');
  const [customRaceLore, setCustomRaceLore] = useState('');
  const [customStatBonuses, setCustomStatBonuses] = useState({
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
  });
  const [customAbilities, setCustomAbilities] = useState(['', '']);

  const handleCustomRaceCreate = () => {
    if (!customRaceName.trim() || !customRaceDescription.trim()) {
      Alert.alert('Error', 'Please fill in at least the name and description');
      return;
    }

    const customRace: CustomRace = {
      name: customRaceName.trim(),
      description: customRaceDescription.trim(),
      statBonuses: customStatBonuses,
      abilities: customAbilities.filter(ability => ability.trim() !== ''),
      lore: customRaceLore.trim() || 'A unique race shaped by imagination and heritage.'
    };

    onSelectRace('custom', customRace);
    setShowCustomModal(false);
    
    // Reset form
    setCustomRaceName('');
    setCustomRaceDescription('');
    setCustomRaceLore('');
    setCustomStatBonuses({
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    });
    setCustomAbilities(['', '']);
  };

  const renderRaceCard = (race: Race) => {
    const isSelected = selectedRace === race.id;
    
    if (race.id === 'custom') {
      return (
        <TouchableOpacity
          key={race.id}
          style={[
            styles.raceCard,
            styles.customRaceCard,
            isSelected && styles.selectedRaceCard
          ]}
          onPress={() => setShowCustomModal(true)}
        >
          <View style={styles.raceHeader}>
            <Text style={[styles.raceName, isSelected && styles.selectedText]}>
              {race.name}
            </Text>
            <Plus size={24} color={colors.primary} />
          </View>
          
          <Text style={[styles.raceDescription, isSelected && styles.selectedText]}>
            {race.description}
          </Text>
          
          <Text style={[styles.customNote, isSelected && styles.selectedText]}>
            Tap to create your own unique race
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity
        key={race.id}
        style={[
          styles.raceCard,
          isSelected && styles.selectedRaceCard
        ]}
        onPress={() => onSelectRace(race.id)}
      >
        <View style={styles.raceHeader}>
          <Text style={[styles.raceName, isSelected && styles.selectedText]}>{race.name}</Text>
          {isSelected && <Text style={styles.selectedIndicator}>✓</Text>}
        </View>
        
        <Text style={[styles.raceDescription, isSelected && styles.selectedText]}>{race.description}</Text>
        
        <View style={styles.statBonuses}>
          <Text style={[styles.statBonusesTitle, isSelected && styles.selectedText]}>Stat Bonuses:</Text>
          <View style={styles.statBonusGrid}>
            {Object.entries(race.statBonuses).map(([stat, bonus]) => 
              bonus > 0 ? (
                <View key={stat} style={styles.statBonusItem}>
                  <Text style={[styles.statBonus, isSelected && styles.selectedText]}>
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}: +{bonus}
                  </Text>
                </View>
              ) : null
            )}
          </View>
        </View>
        
        <View style={styles.abilities}>
          <Text style={[styles.abilitiesTitle, isSelected && styles.selectedText]}>Abilities:</Text>
          {race.abilities.map((ability, index) => (
            <Text key={index} style={[styles.ability, isSelected && styles.selectedText]}>
              • {ability}
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Race</Text>
      <Text style={styles.subtitle}>Your race determines your natural abilities and stat bonuses</Text>
      
      <ScrollView 
        style={styles.racesContainer}
        showsVerticalScrollIndicator={false}
      >
        {races.map(renderRaceCard)}
      </ScrollView>
      
      {selectedRace && selectedRace !== 'custom' && (
        <View style={styles.loreContainer}>
          <Text style={styles.loreTitle}>Lore</Text>
          <Text style={styles.loreText}>
            {races.find(race => race.id === selectedRace)?.lore}
          </Text>
        </View>
      )}

      {/* Custom Race Creation Modal */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Race</Text>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.inputLabel}>Race Name *</Text>
              <TextInput
                style={styles.input}
                value={customRaceName}
                onChangeText={setCustomRaceName}
                placeholder="Enter race name"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={customRaceDescription}
                onChangeText={setCustomRaceDescription}
                placeholder="Describe your race"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Stat Bonuses (distribute up to 6 points)</Text>
              <View style={styles.statSelector}>
                {stats.map((stat) => (
                  <View key={stat} style={styles.statBonusRow}>
                    <Text style={styles.statLabel}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</Text>
                    <View style={styles.statControls}>
                      <TouchableOpacity
                        style={styles.statButton}
                        onPress={() => {
                          const totalPoints = Object.values(customStatBonuses).reduce((a, b) => a + b, 0);
                          if (customStatBonuses[stat] > 0) {
                            setCustomStatBonuses(prev => ({ ...prev, [stat]: prev[stat] - 1 }));
                          }
                        }}
                      >
                        <Text style={styles.statButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.statValue}>{customStatBonuses[stat]}</Text>
                      <TouchableOpacity
                        style={styles.statButton}
                        onPress={() => {
                          const totalPoints = Object.values(customStatBonuses).reduce((a, b) => a + b, 0);
                          if (totalPoints < 6) {
                            setCustomStatBonuses(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
                          }
                        }}
                      >
                        <Text style={styles.statButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.inputLabel}>Abilities (up to 2)</Text>
              {customAbilities.map((ability, index) => (
                <TextInput
                  key={index}
                  style={styles.input}
                  value={ability}
                  onChangeText={(text) => {
                    const newAbilities = [...customAbilities];
                    newAbilities[index] = text;
                    setCustomAbilities(newAbilities);
                  }}
                  placeholder={`Ability ${index + 1}`}
                  placeholderTextColor={colors.textSecondary}
                />
              ))}

              <Text style={styles.inputLabel}>Lore (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={customRaceLore}
                onChangeText={setCustomRaceLore}
                placeholder="Write the backstory of your race"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCustomRaceCreate}
            >
              <Text style={styles.createButtonText}>Create Race</Text>
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  racesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  raceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  customRaceCard: {
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  selectedRaceCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  raceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  raceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  selectedIndicator: {
    fontSize: 18,
    color: colors.text,
    fontWeight: 'bold',
  },
  raceDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  statBonuses: {
    marginBottom: 16,
  },
  statBonusesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statBonusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBonusItem: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statBonus: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  abilities: {
    marginBottom: 8,
  },
  abilitiesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  ability: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  customNote: {
    fontSize: 12,
    color: colors.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  selectedText: {
    color: colors.text,
  },
  loreContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    maxHeight: 120,
  },
  loreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  loreText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  statSelector: {
    marginBottom: 8,
  },
  statBonusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  statControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statButton: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 4,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 14,
    color: colors.text,
    width: 30,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
});