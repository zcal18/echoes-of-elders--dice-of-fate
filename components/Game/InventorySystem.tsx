import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useGameStore } from '@/hooks/useGameStore';
import { Item } from '@/types/game';
import colors from '@/constants/colors';
import { Sword, Shield, Shirt, Crown, Gem, Package } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

const getItemIcon = (item: Item) => {
  const iconSize = isTablet ? 24 : 20;
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

export default function InventorySystem() {
  const { activeCharacter, equipItem, useItem, sellItem, updateCharacterHealth } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  if (!activeCharacter) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No active character</Text>
      </View>
    );
  }
  
  const inventory = activeCharacter.inventory || [];
  
  const categories = [
    { id: 'all', name: 'All', count: inventory.length },
    { id: 'weapon', name: 'Weapons', count: inventory.filter(item => item.type === 'weapon').length },
    { id: 'armor', name: 'Armor', count: inventory.filter(item => item.type === 'armor').length },
    { id: 'potion', name: 'Potions', count: inventory.filter(item => item.type === 'potion').length },
    { id: 'accessory', name: 'Accessories', count: inventory.filter(item => item.type === 'accessory').length },
  ];
  
  const filteredItems = selectedCategory === 'all' 
    ? inventory 
    : inventory.filter(item => item.type === selectedCategory);
  
  const handleEquipItem = (item: Item) => {
    if (!item.equipSlot) {
      Alert.alert('Cannot Equip', 'This item cannot be equipped.');
      return;
    }
    
    Alert.alert(
      'Equip Item',
      `Do you want to equip ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Equip', 
          onPress: () => {
            equipItem(item.id);
          }
        }
      ]
    );
  };
  
  const handleUseItem = (item: Item) => {
    if (item.type !== 'potion') {
      Alert.alert('Cannot Use', 'This item cannot be used.');
      return;
    }
    
    // Check if it's a revive potion and character is fainted
    const isRevivePotion = item.name.toLowerCase().includes('revive') || 
                          item.name.toLowerCase().includes('phoenix') ||
                          (item.effects && item.effects.some(effect => effect.type === 'revive'));
    
    const isCharacterFainted = activeCharacter.health.current <= 0;
    
    if (isRevivePotion && !isCharacterFainted) {
      Alert.alert('Cannot Use', 'This revive potion can only be used when your character has fainted.');
      return;
    }
    
    if (!isRevivePotion && isCharacterFainted) {
      Alert.alert('Cannot Use', 'Your character has fainted and can only use revive potions.');
      return;
    }
    
    Alert.alert(
      'Use Item',
      `Do you want to use ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use', 
          onPress: () => {
            if (isRevivePotion && isCharacterFainted) {
              // Handle revive potion
              const reviveAmount = item.effects?.find(effect => effect.type === 'revive')?.value || 
                                 Math.floor(activeCharacter.health.max * 0.25); // Default to 25% health
              updateCharacterHealth(activeCharacter.id, reviveAmount);
              
              // Remove the item
              const gameStore = useGameStore.getState();
              gameStore.removeItem(item.id);
              
              Alert.alert('Revival Successful', `${activeCharacter.name} has been revived with ${reviveAmount} health!`);
            } else {
              // Handle regular potion
              const success = useItem(item.id);
              if (!success) {
                Alert.alert('Error', 'Failed to use item.');
              }
            }
          }
        }
      ]
    );
  };
  
  const handleSellItem = (item: Item) => {
    const sellPrice = Math.floor(item.value * 0.5);
    
    Alert.alert(
      'Sell Item',
      `Sell ${item.name} for ${sellPrice} gold?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sell', 
          onPress: () => {
            const success = sellItem(item.id);
            if (!success) {
              Alert.alert('Error', 'Failed to sell item.');
            }
          }
        }
      ]
    );
  };
  
  const renderItemActions = (item: Item) => {
    const actions = [];
    
    if (item.equipSlot) {
      actions.push(
        <TouchableOpacity
          key="equip"
          style={[styles.actionButton, styles.equipButton]}
          onPress={() => handleEquipItem(item)}
        >
          <Text style={styles.actionButtonText}>Equip</Text>
        </TouchableOpacity>
      );
    }
    
    if (item.type === 'potion') {
      const isRevivePotion = item.name.toLowerCase().includes('revive') || 
                            item.name.toLowerCase().includes('phoenix') ||
                            (item.effects && item.effects.some(effect => effect.type === 'revive'));
      const isCharacterFainted = activeCharacter.health.current <= 0;
      
      // Show different button text for revive potions
      const buttonText = isRevivePotion ? 'Revive' : 'Use';
      const isDisabled = (isRevivePotion && !isCharacterFainted) || (!isRevivePotion && isCharacterFainted);
      
      actions.push(
        <TouchableOpacity
          key="use"
          style={[
            styles.actionButton, 
            styles.useButton,
            isDisabled && styles.disabledButton
          ]}
          onPress={() => handleUseItem(item)}
          disabled={isDisabled}
        >
          <Text style={styles.actionButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      );
    }
    
    actions.push(
      <TouchableOpacity
        key="sell"
        style={[styles.actionButton, styles.sellButton]}
        onPress={() => handleSellItem(item)}
      >
        <Text style={styles.actionButtonText}>Sell</Text>
      </TouchableOpacity>
    );
    
    return actions;
  };
  
  return (
    <View style={styles.container}>
      {/* Character Status */}
      {activeCharacter.health.current <= 0 && (
        <View style={styles.faintedWarning}>
          <Text style={styles.faintedWarningText}>
            💀 Your character has fainted! Use a revive potion to restore them.
          </Text>
        </View>
      )}
      
      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.activeCategoryButton
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.activeCategoryButtonText
            ]}>
              {category.name} ({category.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Inventory Grid */}
      <ScrollView style={styles.inventoryContainer} showsVerticalScrollIndicator={false}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={isTablet ? 64 : 48} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              {selectedCategory === 'all' ? 'Your inventory is empty' : `No ${selectedCategory}s in inventory`}
            </Text>
          </View>
        ) : (
          <View style={styles.itemGrid}>
            {filteredItems.map((item, index) => {
              const isRevivePotion = item.name.toLowerCase().includes('revive') || 
                                    item.name.toLowerCase().includes('phoenix') ||
                                    (item.effects && item.effects.some(effect => effect.type === 'revive'));
              const isCharacterFainted = activeCharacter.health.current <= 0;
              
              return (
                <View key={`${item.id}_${index}`} style={[
                  styles.itemCard,
                  isRevivePotion && isCharacterFainted && styles.highlightedCard
                ]}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemIconContainer}>
                      {getItemIcon(item)}
                    </View>
                    <View style={styles.itemInfo}>
                      <Text 
                        style={[
                          styles.itemName,
                          { color: getRarityColor(item.rarity) }
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.itemType}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        {item.quantity && item.quantity > 1 && ` (${item.quantity})`}
                        {isRevivePotion && ' ✨'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  
                  {getStatBoostText(item) && (
                    <Text style={styles.itemStats}>
                      {getStatBoostText(item)}
                    </Text>
                  )}
                  
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemValue}>💰 {item.value}</Text>
                    <View style={styles.itemActions}>
                      {renderItemActions(item)}
                    </View>
                  </View>
                </View>
              );
            })}
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
  faintedWarning: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  faintedWarningText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryContainer: {
    maxHeight: isTablet ? 60 : 50,
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: isTablet ? 20 : 16,
    paddingVertical: isTablet ? 12 : 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  categoryButtonText: {
    color: colors.textSecondary,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  activeCategoryButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  inventoryContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 80 : 60,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: isTablet ? 18 : 16,
    textAlign: 'center',
    marginTop: 16,
  },
  itemGrid: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightedCard: {
    borderColor: colors.success,
    borderWidth: 2,
    backgroundColor: '#e8f5e8',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIconContainer: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 12 : 8,
    backgroundColor: colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemType: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
  },
  itemDescription: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    lineHeight: isTablet ? 20 : 16,
    marginBottom: 8,
  },
  itemStats: {
    fontSize: isTablet ? 14 : 12,
    color: colors.success,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: isTablet ? 16 : 14,
    color: colors.gold,
    fontWeight: 'bold',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: isTablet ? 16 : 12,
    paddingVertical: isTablet ? 8 : 6,
    minWidth: isTablet ? 60 : 50,
    alignItems: 'center',
  },
  equipButton: {
    backgroundColor: colors.primary,
  },
  useButton: {
    backgroundColor: colors.success,
  },
  sellButton: {
    backgroundColor: colors.warning,
  },
  disabledButton: {
    backgroundColor: colors.surfaceDark,
    opacity: 0.5,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
  },
});