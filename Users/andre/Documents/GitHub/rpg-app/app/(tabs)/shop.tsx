import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useGameStore } from '@/hooks/useGameStore';
import COLORS from '@/constants/colors';
import { Stack } from 'expo-router';

export default function ShopScreen() {
  // Define the type for shop items
  interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    stats?: Record<string, number>;
    requirements?: Record<string, number>;
    effects?: string[];
  }

  // Mock data for shop items - in a real app, this would come from the store or API
  const mockShopItems: ShopItem[] = [
    {
      id: '1',
      name: 'Steel Sword',
      description: 'A sturdy steel sword for novice adventurers.',
      price: 100,
      image: 'https://images.unsplash.com/photo-16173c1a583a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'weapon',
      rarity: 'common',
      stats: { attack: 5 },
      requirements: { strength: 5 },
    },
    {
      id: '2',
      name: 'Magic Staff',
      description: 'A staff imbued with basic magical properties.',
      price: 150,
      image: 'https://images.unsplash.com/photo-1659121455349-7b0713ec3015?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'weapon',
      rarity: 'uncommon',
      stats: { magic: 7 },
      requirements: { intelligence: 8 },
    },
    {
      id: '3',
      name: 'Leather Armor',
      description: 'Lightweight armor for better mobility.',
      price: 120,
      image: 'https://images.unsplash.com/photo-1612039069260-3527b7e5e7e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'armor',
      rarity: 'common',
      stats: { defense: 4 },
      requirements: { dexterity: 6 },
    },
    {
      id: '4',
      name: 'Health Potion',
      description: 'Restores a small amount of health when consumed.',
      price: 50,
      image: 'https://images.unsplash.com/photo-1634312282299-7d43f5a36c8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'consumable',
      rarity: 'common',
      effects: ['Restore 25 HP'],
    },
    {
      id: '5',
      name: 'Mana Elixir',
      description: 'Restores a moderate amount of mana.',
      price: 75,
      image: 'https://images.unsplash.com/photo-1634312282299-7d43f5a36c8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'consumable',
      rarity: 'uncommon',
      effects: ['Restore 40 MP'],
    },
    {
      id: '6',
      name: 'Dragon Scale Mail',
      description: 'Armor crafted from dragon scales, offering superior protection.',
      price: 1000,
      image: 'https://images.unsplash.com/photo-1612039069260-3527b7e5e7e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'armor',
      rarity: 'legendary',
      stats: { defense: 25, fireResistance: 10 },
      requirements: { strength: 15, level: 10 },
    },
    {
      id: '7',
      name: 'Thunderstrike Blade',
      description: 'A blade that channels the power of storms.',
      price: 800,
      image: 'https://images.unsplash.com/photo-16173c1a583a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'weapon',
      rarity: 'epic',
      stats: { attack: 18, lightningDamage: 5 },
      requirements: { strength: 12, dexterity: 10 },
      effects: ['10% chance to stun on hit'],
    },
    {
      id: '8',
      name: 'Phoenix Feather',
      description: 'A rare item that can revive a fallen ally.',
      price: 500,
      image: 'https://images.unsplash.com/photo-1634312282299-7d43f5a36c8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      category: 'consumable',
      rarity: 'rare',
      effects: ['Revive ally with 50% HP'],
    },
  ];

  const [shopItems] = useState<ShopItem[]>(mockShopItems);
  const { characters, updateCharacter } = useGameStore((state) => ({
    characters: state.characters,
    updateCharacter: state.updateCharacter,
  }));

  const handlePurchase = (item: ShopItem) => {
    if (!characters || characters.length === 0) {
      Alert.alert('Error', 'No character selected. Please create or select a character first.');
      return;
    }

    if (characters[0].gold < item.price) {
      Alert.alert('Insufficient Gold', 'You do not have enough gold to purchase this item.');
      return;
    }

    // Check requirements for weapons and armor
    if (item.category !== 'consumable' && item.requirements) {
      for (const [stat, value] of Object.entries(item.requirements)) {
        if ((characters[0].stats as any)[stat] < value) {
          Alert.alert('Requirement Not Met', `You need at least ${value} ${stat} to use this item.`);
          return;
        }
      }
    }

    // Update character inventory and gold
    const updatedCharacter = {
      ...characters[0],
      gold: characters[0].gold - item.price,
      inventory: [...(characters[0].inventory || []), item],
    };

    updateCharacter(updatedCharacter.id, updatedCharacter);
    Alert.alert('Purchase Successful', `${item.name} has been added to your inventory.`);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return COLORS.neutral;
      case 'uncommon':
        return COLORS.success;
      case 'rare':
        return COLORS.info;
      case 'epic':
        return COLORS.primaryLight;
      case 'legendary':
        return COLORS.warning;
      default:
        return COLORS.neutral;
    }
  };

  const renderItem = ({ item }: { item: ShopItem }) => (
    <View style={[styles.itemCard, { borderColor: getRarityColor(item.rarity) }]}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: getRarityColor(item.rarity) }]}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemPrice}>Price: {item.price} Gold</Text>
        {item.stats && (
          <View style={styles.statsContainer}>
            {Object.entries(item.stats).map(([stat, value]) => (
              <Text key={stat} style={styles.statText}>
                {stat.charAt(0).toUpperCase() + stat.slice(1)}: +{value}
              </Text>
            ))}
          </View>
        )}
        {item.requirements && (
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Requirements:</Text>
            {Object.entries(item.requirements).map(([stat, value]) => (
              <Text key={stat} style={styles.requirementText}>
                {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value}
              </Text>
            ))}
          </View>
        )}
        {item.effects && item.effects.length > 0 && (
          <View style={styles.effectsContainer}>
            <Text style={styles.effectsTitle}>Effects:</Text>
            {item.effects.map((effect, index) => (
              <Text key={index} style={styles.effectText}>- {effect}</Text>
            ))}
          </View>
        )}
      </View>
      <TouchableOpacity
        style={[styles.purchaseButton, { backgroundColor: COLORS.primary }]}
        onPress={() => handlePurchase(item)}
      >
        <Text style={styles.purchaseButtonText}>Buy</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Shop' }} />
      <FlatList
        data={shopItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  itemDetails: {
    padding: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  statsContainer: {
    marginTop: 8,
  },
  statText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '500',
  },
  requirementsContainer: {
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  requirementText: {
    color: COLORS.warning,
    fontSize: 13,
  },
  effectsContainer: {
    marginTop: 8,
  },
  effectsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  effectText: {
    color: COLORS.info,
    fontSize: 13,
  },
  purchaseButton: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
