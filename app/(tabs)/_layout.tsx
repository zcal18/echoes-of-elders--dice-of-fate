import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Swords, Home, BookOpen, Crown, MessageSquare, Package, Users } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceLight,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="combat"
        options={{
          title: 'Combat',
          tabBarIcon: ({ color, size }) => <Swords size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="kingdom"
        options={{
          title: 'Kingdom',
          tabBarIcon: ({ color, size }) => <Crown size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      
      {/* Hidden tabs - accessible via top icons */}
      <Tabs.Screen
        name="inbox"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      
      <Tabs.Screen
        name="shop"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}