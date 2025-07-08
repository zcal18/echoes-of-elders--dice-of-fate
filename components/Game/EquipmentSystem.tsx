import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, Modal } from 'react-native';
import { useGameStore } from '@/hooks/useGameStore';
import { Item } from '@/types/game';
import colors from '@/constants/colors';
import { Sword, Shield, Shirt, Crown, Gem, Hand, Footprints, User, X, Package } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

const equipmentSlots = [
  { id: 'head', name: 'Head', icon: Crown, emoji: '👑' },
  { id: 'neck', name: 'Neck', icon: Gem, emoji: '📿' },
  { id: 'mainHand', name: 'Main Hand', icon: Sword, emoji: '⚔️' },
  { id: 'offHand', name: 'Off Hand', icon: Shield, emoji: '🛡️' },
  { id: 'chest', name: 'Chest', icon: Shirt, emoji: '👕' },
  { id: 'hands', name: 'Hands', icon: Hand, emoji: '🧤' },
  { id: 'legs', name: 'Legs', icon: User, emoji: '👖' },
  { id: 'feet', name: 'Feet', icon: Footprints, emoji: '👢' },
  { id: 'ring1', name: 'Ring 1', icon: Gem, emoji: '💍' },
  { id: 'ring2', name: 'Ring 2', icon: Gem, emoji: '💍' },
];

const getStatBoostText = (item: Item) => {
  const boosts: string[] = [];
  
  if (item.stats) {
    Object.entries(item.stats).forEach(([stat, value]) => {
      if (value && value > 0) {
        const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
        boosts.push(`+${value} ${statName}`);
      }
    });
  }
  
  if (item.boost) {
    Object.entries(item.boost).forEach(([stat, value]) => {
      if (value && value > 0) {
        const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
        boosts.push(`+${value} ${statName}`);
      }
    });
  }
  
  return boosts.join(', ');
};

const getRarityColor = (rarity?: string) => {
  switch (rarity) {
    case 'common': return colors.common;
    case 'uncommon': return colors.uncommon;
    case 'rare': return colors.rare;
    case 'epic': return colors.epic;
    case 'legendary': return colors.legendary;
    default: return colors.textSecondary;
  }
};

const calculateTotalEquipmentStats = (equipment: any) => {
  const totalStats = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
    attack: 0,
    defense: 0,
    health: 0,
    mana: 0,
  };
  
  Object.values(equipment).forEach((item: any) => {
    if (item?.stats) {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (value && stat in totalStats) {
          totalStats[stat as keyof typeof totalStats] += value as number;
        }
      });
    }
    if (item?.boost) {
      Object.entries(item.boost).forEach(([stat, value]) => {
        if (value && stat in totalStats) {
          totalStats[stat as keyof typeof totalStats] += value as number;
        }
      });
    }
  });
  
  return totalStats;
};

const getItemIcon = (item: Item) => {
  const iconSize = isTablet ? 20 : 16;
  const iconColor = colors.textSecondary;
  
  switch (item.type) {
    case 'weapon':
      return <Sword size={iconSize} color={iconColor} />;
    case 'armor':
      if (item.equipSlot === 'head') return <Crown size={iconSize} color={iconColor} />;
      if (item.equipSlot === 'offHand') return <Shield size={iconSize} color={iconColor} />;
      return <Shirt size={iconSize} color={iconColor} />;
    case 'accessory':
      return <Gem size={iconSize} color={iconColor} />;
    default:
      return <Package size={iconSize} color={iconColor} />;
  }
};

export default function EquipmentSystem() {
  const { activeCharacter, unequipItem, equipItem, addNotification } = useGameStore();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlotForModal, setSelectedSlotForModal] = useState<string | null>(null);
  
  if (!activeCharacter) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No active character</Text>
      </View>
    );
  }
  
  const equipment = activeCharacter.equipment || {};
  const inventory = activeCharacter.inventory || [];
  const totalStats = calculateTotalEquipmentStats(equipment);
  
  // Function to get eligible items for a specific slot
  const getEligibleItems = (slot: string): Item[] => {
    return inventory.filter(item => {
      if (!item.equipSlot) return false;
      
      // Handle slot mapping for different item types
      if (item.equipSlot === 'weapon' && (slot === 'mainHand' || slot === 'offHand')) {
        return true;
      }
      if (item.equipSlot === 'armor' && ['chest', 'head', 'hands', 'legs', 'feet'].includes(slot)) {
        return true;
      }
      if (item.equipSlot === 'accessory' && ['ring1', 'ring2', 'neck'].includes(slot)) {
        return true;
      }
      
      return item.equipSlot === slot;
    });
  };
  
  const handleUnequipItem = (slot: string, item: Item) => {
    Alert.alert(
      'Unequip Item',
      `Do you want to unequip ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unequip', 
          onPress: () => {
            unequipItem(slot);
            addNotification(`${item.name} unequipped`, 'info');
          }
        }
      ]
    );
  };
  
  const handleSlotPress = (slot: any) => {
    const equippedItem = equipment[slot.id];
    
    if (equippedItem) {
      // If item is equipped, show details
      setSelectedSlot(selectedSlot === slot.id ? null : slot.id);
    } else {
      // If slot is empty, show modal with eligible items
      setSelectedSlotForModal(slot.id);
      setModalVisible(true);
    }
  };
  
  const handleEquipFromModal = (item: Item) => {
    if (selectedSlotForModal) {
      equipItem(item.id, selectedSlotForModal);
      setModalVisible(false);
      setSelectedSlotForModal(null);
    }
  };
  
  const renderEquipmentSlot = (slot: any) => {
    const equippedItem = equipment[slot.id];
    const IconComponent = slot.icon;
    const eligibleItemsCount = getEligibleItems(slot.id).length;
    
    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.equipmentSlot,
          selectedSlot === slot.id && styles.selectedSlot,
          equippedItem && styles.equippedSlot
        ]}
        onPress={() => handleSlotPress(slot)}
        onLongPress={() => {
          if (equippedItem) {
            handleUnequipItem(slot.id, equippedItem);
          }
        }}
      >
        <View style={styles.slotHeader}>
          <View style={styles.slotIconContainer}>
            {equippedItem ? (
              <Text style={styles.slotEmoji}>{slot.emoji}</Text>
            ) : (
              <IconComponent size={isTablet ? 24 : 20} color={colors.textMuted} />
            )}
          </View>
          <View style={styles.slotNameContainer}>
            <Text style={styles.slotName}>{slot.name}</Text>
            {!equippedItem && eligibleItemsCount > 0 && (
              <Text style={styles.eligibleCount}>({eligibleItemsCount} available)</Text>
            )}
          </View>
        </View>
        
        {equippedItem ? (
          <View style={styles.equippedItemInfo}>
            <Text 
              style={[
                styles.equippedItemName,
                { color: getRarityColor(equippedItem.rarity) }
              ]}
              numberOfLines={1}
            >
              {equippedItem.name}
            </Text>
            {getStatBoostText(equippedItem) && (
              <Text style={styles.equippedItemStats} numberOfLines={1}>
                {getStatBoostText(equippedItem)}
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.emptySlotText}>
            {eligibleItemsCount > 0 ? 'Tap to equip' : 'Empty'}
          </Text>
        )}
        
        {selectedSlot === slot.id && equippedItem && (
          <View style={styles.itemDetails}>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {equippedItem.description}
            </Text>
            <View style={styles.slotActions}>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => {
                  setSelectedSlotForModal(slot.id);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.unequipButton}
                onPress={() => handleUnequipItem(slot.id, equippedItem)}
              >
                <Text style={styles.unequipButtonText}>Unequip</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  const renderEquipmentModal = () => {
    if (!selectedSlotForModal) return null;
    
    const eligibleItems = getEligibleItems(selectedSlotForModal);
    const slotInfo = equipmentSlots.find(s => s.id === selectedSlotForModal);
    
    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Equip {slotInfo?.name}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={isTablet ? 24 : 20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {eligibleItems.length === 0 ? (
                <View style={styles.emptyModalContainer}>
                  <Package size={isTablet ? 48 : 40} color={colors.textMuted} />
                  <Text style={styles.emptyModalText}>
                    No eligible items for this slot
                  </Text>
                </View>
              ) : (
                <View style={styles.modalItemGrid}>
                  {eligibleItems.map((item, index) => (
                    <TouchableOpacity
                      key={`${item.id}_${index}`}
                      style={styles.modalItemCard}
                      onPress={() => handleEquipFromModal(item)}
                    >
                      <View style={styles.modalItemHeader}>
                        <View style={styles.modalItemIconContainer}>
                          {getItemIcon(item)}
                        </View>
                        <View style={styles.modalItemInfo}>
                          <Text 
                            style={[
                              styles.modalItemName,
                              { color: getRarityColor(item.rarity) }
                            ]}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text style={styles.modalItemType}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.modalItemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                      
                      {getStatBoostText(item) && (
                        <Text style={styles.modalItemStats}>
                          {getStatBoostText(item)}
                        </Text>
                      )}
                      
                      <View style={styles.modalItemFooter}>
                        <Text style={styles.modalItemValue}>💰 {item.value}</Text>
                        <View style={styles.equipButtonContainer}>
                          <Text style={styles.equipButtonText}>Tap to Equip</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Equipment Bonuses</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>STR</Text>
              <Text style={[styles.statValue, totalStats.strength > 0 && styles.positiveValue]}>
                +{totalStats.strength}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DEX</Text>
              <Text style={[styles.statValue, totalStats.dexterity > 0 && styles.positiveValue]}>
                +{totalStats.dexterity}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CON</Text>
              <Text style={[styles.statValue, totalStats.constitution > 0 && styles.positiveValue]}>
                +{totalStats.constitution}
              </Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>INT</Text>
              <Text style={[styles.statValue, totalStats.intelligence > 0 && styles.positiveValue]}>
                +{totalStats.intelligence}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>WIS</Text>
              <Text style={[styles.statValue, totalStats.wisdom > 0 && styles.positiveValue]}>
                +{totalStats.wisdom}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CHA</Text>
              <Text style={[styles.statValue, totalStats.charisma > 0 && styles.positiveValue]}>
                +{totalStats.charisma}
              </Text>
            </View>
          </View>
          {(totalStats.attack > 0 || totalStats.defense > 0) && (
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>ATK</Text>
                <Text style={[styles.statValue, totalStats.attack > 0 && styles.positiveValue]}>
                  +{totalStats.attack}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>DEF</Text>
                <Text style={[styles.statValue, totalStats.defense > 0 && styles.positiveValue]}>
                  +{totalStats.defense}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>HP</Text>
                <Text style={[styles.statValue, totalStats.health > 0 && styles.positiveValue]}>
                  +{totalStats.health}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.equipmentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.equipmentGrid}>
          {equipmentSlots.map(renderEquipmentSlot)}
        </View>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <View style={styles.instructionsTextContainer}>
            <Text style={styles.instructionItem}>• Tap an empty slot to see available equipment</Text>
            <Text style={styles.instructionItem}>• Tap an equipped item to view details and options</Text>
            <Text style={styles.instructionItem}>• Long press an equipped item to unequip it quickly</Text>
            <Text style={styles.instructionItem}>• Equipment bonuses are automatically calculated</Text>
          </View>
        </View>
      </ScrollView>
      
      {renderEquipmentModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: isTablet ? 18 : 16,
    textAlign: 'center',
    marginTop: 20,
  },
  statsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  statsGrid: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  positiveValue: {
    color: colors.success,
  },
  equipmentContainer: {
    flex: 1,
  },
  equipmentGrid: {
    gap: 12,
  },
  equipmentSlot: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedSlot: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  equippedSlot: {
    backgroundColor: colors.surfaceLight,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotIconContainer: {
    width: isTablet ? 40 : 32,
    height: isTablet ? 40 : 32,
    borderRadius: isTablet ? 8 : 6,
    backgroundColor: colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  slotEmoji: {
    fontSize: isTablet ? 20 : 16,
  },
  slotNameContainer: {
    flex: 1,
  },
  slotName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: colors.text,
  },
  eligibleCount: {
    fontSize: isTablet ? 12 : 10,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  equippedItemInfo: {
    flex: 1,
  },
  equippedItemName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  equippedItemStats: {
    fontSize: isTablet ? 14 : 12,
    color: colors.success,
    fontWeight: '600',
  },
  emptySlotText: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  itemDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemDescription: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    lineHeight: isTablet ? 20 : 16,
    marginBottom: 12,
  },
  slotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  changeButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: isTablet ? 8 : 6,
    paddingHorizontal: isTablet ? 16 : 12,
    flex: 1,
    alignItems: 'center',
  },
  changeButtonText: {
    color: colors.text,
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
  },
  unequipButton: {
    backgroundColor: colors.warning,
    borderRadius: 8,
    paddingVertical: isTablet ? 8 : 6,
    paddingHorizontal: isTablet ? 16 : 12,
    flex: 1,
    alignItems: 'center',
  },
  unequipButtonText: {
    color: colors.text,
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionsTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  instructionsTextContainer: {
    gap: 4,
  },
  instructionItem: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    lineHeight: isTablet ? 20 : 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    maxWidth: isTablet ? 600 : undefined,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isTablet ? 20 : 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceDark,
  },
  modalContent: {
    flex: 1,
    padding: isTablet ? 20 : 16,
  },
  emptyModalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 60 : 40,
  },
  emptyModalText: {
    color: colors.textMuted,
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    marginTop: 12,
  },
  modalItemGrid: {
    gap: 12,
  },
  modalItemCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalItemIconContainer: {
    width: isTablet ? 36 : 30,
    height: isTablet ? 36 : 30,
    borderRadius: isTablet ? 8 : 6,
    backgroundColor: colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  modalItemType: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
  },
  modalItemDescription: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
    lineHeight: isTablet ? 16 : 14,
    marginBottom: 8,
  },
  modalItemStats: {
    fontSize: isTablet ? 12 : 10,
    color: colors.success,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemValue: {
    fontSize: isTablet ? 14 : 12,
    color: colors.gold,
    fontWeight: 'bold',
  },
  equipButtonContainer: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: isTablet ? 12 : 8,
    paddingVertical: isTablet ? 6 : 4,
  },
  equipButtonText: {
    color: colors.text,
    fontSize: isTablet ? 12 : 10,
    fontWeight: 'bold',
  },
});