import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Package, Gem, Minus, Plus } from 'lucide-react-native';
import { useGameStore } from '@/hooks/useGameStore';
import colors from '@/constants/colors';
import { ShopItem } from '@/types/game';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function ShopScreen() {
  const router = useRouter();
  const { 
    isAuthenticated,
    activeCharacter,
    userRole,
    shopItems,
    diamonds,
    purchaseItem,
    sellItem
  } = useGameStore();
  
  const [selectedCategory, setSelectedCategory] = useState<'items' | 'packages'>('items');
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)');
    } else if (!activeCharacter) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, activeCharacter]);
  
  if (!isAuthenticated || !activeCharacter) {
    return null;
  }
  
  const handlePurchase = (shopItem: ShopItem) => {
    if (activeCharacter.gold < shopItem.price * purchaseQuantity) {
      Alert.alert('Insufficient Funds', `You need ${shopItem.price * purchaseQuantity} gold but only have ${activeCharacter.gold} gold.`);
      return;
    }
    
    if (shopItem.stock < purchaseQuantity) {
      Alert.alert('Out of Stock', `Only ${shopItem.stock} items available.`);
      return;
    }
    
    Alert.alert(
      'Purchase Item',
      `Buy ${purchaseQuantity}x ${shopItem.item.name} for ${shopItem.price * purchaseQuantity} gold?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: () => {
            if (purchaseItem(shopItem.id, purchaseQuantity)) {
              Alert.alert('Purchase Successful', `You bought ${purchaseQuantity}x ${shopItem.item.name}!`);
              setPurchaseQuantity(1);
            } else {
              Alert.alert('Purchase Failed', 'Something went wrong.');
            }
          }
        }
      ]
    );
  };

  const handleQuickBuy = (shopItem: ShopItem) => {
    if (activeCharacter.gold < shopItem.price) {
      Alert.alert('Insufficient Funds', `You need ${shopItem.price} gold but only have ${activeCharacter.gold} gold.`);
      return;
    }
    
    if (shopItem.stock < 1) {
      Alert.alert('Out of Stock', `This item is currently unavailable.`);
      return;
    }
    
    if (purchaseItem(shopItem.id, 1)) {
      Alert.alert('Purchase Successful', `You bought 1x ${shopItem.item.name}!`);
    } else {
      Alert.alert('Purchase Failed', 'Something went wrong.');
    }
  };

  const diamondPackages = [
    {
      id: 'small_diamond_pack',
      name: 'Small Diamond Pack',
      description: '100 Diamonds for quick purchases',
      diamonds: 100,
      price: 99, // cents
      featured: false
    },
    {
      id: 'medium_diamond_pack',
      name: 'Medium Diamond Pack',
      description: '500 Diamonds with 20% bonus',
      diamonds: 500,
      price: 399,
      featured: true
    },
    {
      id: 'large_diamond_pack',
      name: 'Large Diamond Pack',
      description: '1200 Diamonds with 40% bonus',
      diamonds: 1200,
      price: 799,
      featured: true
    },
    {
      id: 'mega_diamond_pack',
      name: 'Mega Diamond Pack',
      description: '2500 Diamonds with 60% bonus',
      diamonds: 2500,
      price: 1499,
      featured: false
    }
  ];

  const filteredItems = shopItems.filter(item => {
    if (selectedCategory === 'items') return true;
    return false; // Packages are handled separately
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return colors.common;
      case 'uncommon': return colors.uncommon;
      case 'rare': return colors.rare;
      case 'epic': return colors.epic;
      case 'legendary': return colors.legendary;
      default: return colors.text;
    }
  };

  const canAffordItem = (item: ShopItem) => {
    return activeCharacter.gold >= item.price * purchaseQuantity;
  };

  const increaseQuantity = () => {
    setPurchaseQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setPurchaseQuantity(prev => Math.max(1, prev - 1));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Shop',
          headerShown: true,
        }}
      />
      
      {/* Currency Display */}
      <View style={styles.currencyBar}>
        <View style={styles.currencyItem}>
          <Text style={styles.currencyLabel}>Gold</Text>
          <Text style={styles.currencyValue}>💰 {activeCharacter.gold}</Text>
        </View>
        <View style={styles.currencyItem}>
          <Text style={styles.currencyLabel}>Diamonds</Text>
          <Text style={styles.currencyValue}>💎 {diamonds}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.categories}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'items' && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory('items')}
          >
            <Package size={isTablet ? 20 : 16} color={colors.text} />
            <Text style={styles.categoryText}>Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'packages' && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory('packages')}
          >
            <Gem size={isTablet ? 20 : 16} color={colors.text} />
            <Text style={styles.categoryText}>Diamond Packs</Text>
          </TouchableOpacity>
        </View>

        {selectedCategory === 'items' && (
          <View style={styles.quantitySelector}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={decreaseQuantity}
              disabled={purchaseQuantity <= 1}
            >
              <Minus size={isTablet ? 18 : 16} color={purchaseQuantity <= 1 ? colors.textMuted : colors.text} />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{purchaseQuantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={increaseQuantity}
            >
              <Plus size={isTablet ? 18 : 16} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}

        {selectedCategory === 'items' ? (
          <View style={styles.itemGrid}>
            {filteredItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemCard,
                  !canAffordItem(item) && styles.unaffordableItem
                ]}
                onPress={() => handlePurchase(item)}
                disabled={!canAffordItem(item) || item.stock === 0}
              >
                <View style={styles.itemHeader}>
                  <Text 
                    style={[
                      styles.itemName,
                      { color: getRarityColor(item.item.rarity || 'common') }
                    ]}
                  >
                    {item.item.name}
                  </Text>
                </View>
                
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.item.description}
                </Text>
                
                <View style={styles.itemStats}>
                  <Text style={styles.itemType}>
                    {item.item.type.charAt(0).toUpperCase() + item.item.type.slice(1)}
                  </Text>
                  <Text style={styles.itemRarity}>
                    {item.item.rarity ? (item.item.rarity.charAt(0).toUpperCase() + item.item.rarity.slice(1)) : 'Common'}
                  </Text>
                </View>
                
                <View style={styles.itemFooter}>
                  <Text style={[
                    styles.itemPrice,
                    !canAffordItem(item) && styles.unaffordablePrice
                  ]}>
                    💰 {item.price * purchaseQuantity}
                  </Text>
                  <Text style={[
                    styles.itemStock,
                    item.stock <= 5 && styles.lowStock
                  ]}>
                    Stock: {item.stock}
                  </Text>
                </View>
                
                {item.stock === 0 && (
                  <View style={styles.outOfStockOverlay}>
                    <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.quickBuyButton,
                    (!canAffordItem(item) || item.stock === 0) && styles.disabledQuickBuyButton
                  ]}
                  onPress={() => handleQuickBuy(item)}
                  disabled={!canAffordItem(item) || item.stock === 0}
                >
                  <Text style={styles.quickBuyText}>Buy 1</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.packageGrid}>
            {diamondPackages.map(pack => (
              <TouchableOpacity
                key={pack.id}
                style={[
                  styles.packageCard,
                  pack.featured && styles.featuredPackage
                ]}
                onPress={() => {
                  Alert.alert(
                    'Purchase Diamonds',
                    `This would open the payment system to buy ${pack.diamonds} diamonds for $${(pack.price / 100).toFixed(2)}`,
                    [{ text: 'OK' }]
                  );
                }}
              >
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName}>{pack.name}</Text>
                  {pack.featured && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredText}>BEST VALUE</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.packageContent}>
                  <Text style={styles.packageDiamonds}>💎 {pack.diamonds}</Text>
                  <Text style={styles.packageDescription}>{pack.description}</Text>
                </View>
                
                <View style={styles.packageFooter}>
                  <Text style={styles.packagePrice}>${(pack.price / 100).toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
  currencyBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    paddingVertical: isTablet ? 16 : 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currencyItem: {
    alignItems: 'center',
  },
  currencyLabel: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  currencyValue: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: isTablet ? 20 : 16,
  },
  categories: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: isTablet ? 16 : 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  categoryText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  quantityLabel: {
    fontSize: isTablet ? 16 : 14,
    color: colors.text,
    marginRight: 16,
  },
  quantityButton: {
    width: isTablet ? 40 : 36,
    height: isTablet ? 40 : 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  quantityValue: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isTablet ? 16 : 12,
  },
  itemCard: {
    width: isTablet ? '48%' : '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 16 : 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unaffordableItem: {
    opacity: 0.6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    flex: 1,
  },
  itemDescription: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: isTablet ? 20 : 16,
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemType: {
    fontSize: isTablet ? 12 : 10,
    color: colors.info,
    fontWeight: 'bold',
  },
  itemRarity: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: isTablet ? 16 : 14,
    color: colors.gold,
    fontWeight: 'bold',
  },
  unaffordablePrice: {
    color: colors.error,
  },
  itemStock: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
  },
  lowStock: {
    color: colors.warning,
    fontWeight: 'bold',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: isTablet ? 16 : 14,
  },
  quickBuyButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledQuickBuyButton: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  quickBuyText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: isTablet ? 14 : 12,
  },
  packageGrid: {
    gap: isTablet ? 16 : 12,
  },
  packageCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: isTablet ? 24 : 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredPackage: {
    borderColor: colors.secondary,
    backgroundColor: colors.surface + 'DD',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageName: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  featuredBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  featuredText: {
    fontSize: isTablet ? 10 : 8,
    fontWeight: 'bold',
    color: colors.text,
  },
  packageContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  packageDiamonds: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  packageFooter: {
    alignItems: 'center',
  },
  packagePrice: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.success,
  },
});