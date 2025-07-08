import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Class, CustomClass } from '@/types/game';
import { classes } from '@/constants/gameData';
import colors from '@/constants/colors';
import { X, Plus } from 'lucide-react-native';

type ClassSelectionProps = {
  selectedClass: string | null;
  onSelectClass: (classId: string, customClass?: CustomClass) => void;
};

export default function ClassSelection({ selectedClass, onSelectClass }: ClassSelectionProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customClassName, setCustomClassName] = useState('');
  const [customClassDescription, setCustomClassDescription] = useState('');
  const [customClassLore, setCustomClassLore] = useState('');
  const [customPrimaryStat, setCustomPrimaryStat] = useState<'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'>('strength');
  const [customAbilities, setCustomAbilities] = useState(['', '', '']);
  const [customEquipment, setCustomEquipment] = useState(['', '']);

  const handleCustomClassCreate = () => {
    if (!customClassName.trim() || !customClassDescription.trim()) {
      Alert.alert('Error', 'Please fill in at least the name and description');
      return;
    }

    const customClass: CustomClass = {
      name: customClassName.trim(),
      description: customClassDescription.trim(),
      primaryStat: customPrimaryStat,
      abilities: customAbilities.filter(ability => ability.trim() !== ''),
      startingEquipment: customEquipment.filter(equipment => equipment.trim() !== ''),
      lore: customClassLore.trim() || 'A unique class forged by imagination and determination.'
    };

    onSelectClass('custom', customClass);
    setShowCustomModal(false);
    
    // Reset form
    setCustomClassName('');
    setCustomClassDescription('');
    setCustomClassLore('');
    setCustomPrimaryStat('strength');
    setCustomAbilities(['', '', '']);
    setCustomEquipment(['', '']);
  };

  const renderClassCard = (characterClass: Class) => {
    const isSelected = selectedClass === characterClass.id;
    
    if (characterClass.id === 'custom') {
      return (
        <TouchableOpacity
          key={characterClass.id}
          style={[
            styles.classCard,
            styles.customClassCard,
            isSelected && styles.selectedClassCard
          ]}
          onPress={() => setShowCustomModal(true)}
        >
          <View style={styles.classHeader}>
            <Text style={[styles.className, isSelected && styles.selectedText]}>
              {characterClass.name}
            </Text>
            <Plus size={24} color={colors.primary} />
          </View>
          
          <Text style={[styles.classDescription, isSelected && styles.selectedText]}>
            {characterClass.description}
          </Text>
          
          <Text style={[styles.customNote, isSelected && styles.selectedText]}>
            Tap to create your own unique class
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity
        key={characterClass.id}
        style={[
          styles.classCard,
          isSelected && styles.selectedClassCard
        ]}
        onPress={() => onSelectClass(characterClass.id)}
      >
        <View style={styles.classHeader}>
          <Text style={[styles.className, isSelected && styles.selectedText]}>{characterClass.name}</Text>
          <View style={styles.primaryStatBadge}>
            <Text style={[styles.primaryStatValue, isSelected && styles.selectedText]}>
              {characterClass.primaryStat.charAt(0).toUpperCase() + characterClass.primaryStat.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.classDescription, isSelected && styles.selectedText]}>{characterClass.description}</Text>
        
        <View style={styles.abilitiesSection}>
          <Text style={[styles.sectionTitle, isSelected && styles.selectedText]}>Starting Abilities:</Text>
          {characterClass.abilities.slice(0, 3).map((ability, index) => (
            <Text key={index} style={[styles.ability, isSelected && styles.selectedText]}>
              • {ability}
            </Text>
          ))}
          {characterClass.abilities.length > 3 && (
            <Text style={[styles.ability, isSelected && styles.selectedText]}>
              + {characterClass.abilities.length - 3} more...
            </Text>
          )}
        </View>
        
        <View style={styles.equipmentSection}>
          <Text style={[styles.sectionTitle, isSelected && styles.selectedText]}>Starting Equipment:</Text>
          {characterClass.startingEquipment.slice(0, 2).map((item, index) => (
            <Text key={index} style={[styles.equipmentItem, isSelected && styles.selectedText]}>
              • {item}
            </Text>
          ))}
          {characterClass.startingEquipment.length > 2 && (
            <Text style={[styles.equipmentItem, isSelected && styles.selectedText]}>
              + {characterClass.startingEquipment.length - 2} more...
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const primaryStats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Class</Text>
      <Text style={styles.subtitle}>Your class determines your combat style and abilities</Text>
      
      <ScrollView 
        style={styles.classesScrollView}
        contentContainerStyle={styles.classesContainer}
        showsVerticalScrollIndicator={false}
      >
        {classes.map(renderClassCard)}
      </ScrollView>
      
      {selectedClass && selectedClass !== 'custom' && (
        <View style={styles.loreContainer}>
          <Text style={styles.loreTitle}>Class Lore</Text>
          <ScrollView style={styles.loreScrollView}>
            <Text style={styles.loreText}>
              {classes.find(c => c.id === selectedClass)?.lore}
            </Text>
          </ScrollView>
        </View>
      )}

      {/* Custom Class Creation Modal */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Class</Text>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.inputLabel}>Class Name *</Text>
              <TextInput
                style={styles.input}
                value={customClassName}
                onChangeText={setCustomClassName}
                placeholder="Enter class name"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={customClassDescription}
                onChangeText={setCustomClassDescription}
                placeholder="Describe your class"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Primary Stat</Text>
              <View style={styles.statSelector}>
                {primaryStats.map((stat) => (
                  <TouchableOpacity
                    key={stat}
                    style={[
                      styles.statOption,
                      customPrimaryStat === stat && styles.selectedStatOption
                    ]}
                    onPress={() => setCustomPrimaryStat(stat)}
                  >
                    <Text style={[
                      styles.statOptionText,
                      customPrimaryStat === stat && styles.selectedStatOptionText
                    ]}>
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Abilities (up to 3)</Text>
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

              <Text style={styles.inputLabel}>Starting Equipment (up to 2)</Text>
              {customEquipment.map((equipment, index) => (
                <TextInput
                  key={index}
                  style={styles.input}
                  value={equipment}
                  onChangeText={(text) => {
                    const newEquipment = [...customEquipment];
                    newEquipment[index] = text;
                    setCustomEquipment(newEquipment);
                  }}
                  placeholder={`Equipment ${index + 1}`}
                  placeholderTextColor={colors.textSecondary}
                />
              ))}

              <Text style={styles.inputLabel}>Lore (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={customClassLore}
                onChangeText={setCustomClassLore}
                placeholder="Write the backstory of your class"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCustomClassCreate}
            >
              <Text style={styles.createButtonText}>Create Class</Text>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  classesScrollView: {
    flex: 1,
  },
  classesContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  classCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: 4,
  },
  customClassCard: {
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  selectedClassCard: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  primaryStatBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  primaryStatValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  classDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  customNote: {
    fontSize: 12,
    color: colors.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  abilitiesSection: {
    marginBottom: 12,
  },
  equipmentSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  ability: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  equipmentItem: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  selectedText: {
    color: colors.textContrast,
  },
  loreContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    maxHeight: 150,
  },
  loreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  loreScrollView: {
    flex: 1,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  statOption: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedStatOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statOptionText: {
    fontSize: 12,
    color: colors.text,
  },
  selectedStatOptionText: {
    color: colors.textContrast,
    fontWeight: 'bold',
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