import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useGameStore } from '@/hooks/useGameStore';
import colors from '@/constants/colors';
import { CheckCircle, XCircle, Info, X } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

const getNotificationIcon = (type: 'success' | 'error' | 'info') => {
  const iconSize = isTablet ? 20 : 16;
  
  switch (type) {
    case 'success':
      return <CheckCircle size={iconSize} color={colors.success} />;
    case 'error':
      return <XCircle size={iconSize} color={colors.error} />;
    case 'info':
    default:
      return <Info size={iconSize} color={colors.info} />;
  }
};

const getNotificationColors = (type: 'success' | 'error' | 'info') => {
  switch (type) {
    case 'success':
      return {
        background: colors.success + '20',
        border: colors.success,
        text: colors.success,
      };
    case 'error':
      return {
        background: colors.error + '20',
        border: colors.error,
        text: colors.error,
      };
    case 'info':
    default:
      return {
        background: colors.info + '20',
        border: colors.info,
        text: colors.info,
      };
  }
};

export default function NotificationSystem() {
  const { notifications, removeNotification } = useGameStore();
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container} pointerEvents="box-none">
      {notifications.map((notification, index) => {
        const notificationColors = getNotificationColors(notification.type);
        
        // Check if this is a detailed notification (contains line breaks)
        const isDetailedNotification = notification.message.includes('\n');
        
        return (
          <View
            key={notification.id}
            style={[
              styles.notification,
              isDetailedNotification && styles.detailedNotification,
              {
                backgroundColor: notificationColors.background,
                borderColor: notificationColors.border,
                top: 60 + (index * (isTablet ? 100 : 90)), // More space for detailed notifications
              }
            ]}
          >
            <View style={styles.notificationContent}>
              <View style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </View>
              
              <View style={styles.notificationTextContainer}>
                <Text 
                  style={[
                    styles.notificationText,
                    isDetailedNotification && styles.detailedNotificationText,
                    { color: notificationColors.text }
                  ]}
                  numberOfLines={isDetailedNotification ? 6 : 2}
                >
                  {notification.message}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => removeNotification(notification.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={isTablet ? 18 : 14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  notification: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  detailedNotification: {
    minHeight: isTablet ? 80 : 70,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: isTablet ? 16 : 12,
    gap: 12,
  },
  notificationIcon: {
    flexShrink: 0,
    marginTop: 2,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    lineHeight: isTablet ? 22 : 18,
  },
  detailedNotificationText: {
    fontSize: isTablet ? 15 : 13,
    lineHeight: isTablet ? 20 : 16,
  },
  closeButton: {
    flexShrink: 0,
    padding: 4,
    borderRadius: 4,
    marginTop: -2,
  },
});