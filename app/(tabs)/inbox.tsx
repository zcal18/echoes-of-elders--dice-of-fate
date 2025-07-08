import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { Mail, Send, Trash2, Star, StarOff, ShoppingCart, User } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useGameStore } from '@/hooks/useGameStore';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function InboxScreen() {
  const [selectedMail, setSelectedMail] = useState<any>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  
  const router = useRouter();
  const { 
    activeCharacter, 
    mailbox = [], // Default to empty array
    sendMail, 
    markMailAsRead, 
    deleteMail, 
    toggleMailStar 
  } = useGameStore();
  
  if (!activeCharacter) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No character selected</Text>
      </View>
    );
  }
  
  const handleSendMail = () => {
    if (!composeRecipient.trim() || !composeSubject.trim() || !composeMessage.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    sendMail(composeRecipient, composeSubject, composeMessage);
    setShowCompose(false);
    setComposeRecipient('');
    setComposeSubject('');
    setComposeMessage('');
    Alert.alert('Success', 'Mail sent successfully!');
  };
  
  const handleMailPress = (mail: any) => {
    if (!mail.isRead) {
      markMailAsRead(mail.id);
    }
    setSelectedMail(mail);
  };
  
  const renderMailItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.mailItem,
        !item.isRead && styles.unreadMail
      ]}
      onPress={() => handleMailPress(item)}
    >
      <View style={styles.mailHeader}>
        <View style={styles.mailInfo}>
          <Text style={[styles.mailSender, !item.isRead && styles.unreadText]}>
            {item.sender}
          </Text>
          <Text style={styles.mailDate}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.mailActions}>
          <TouchableOpacity onPress={() => toggleMailStar(item.id)}>
            {item.isStarred ? (
              <Star size={isTablet ? 20 : 16} color={colors.gold} fill={colors.gold} />
            ) : (
              <StarOff size={isTablet ? 20 : 16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </View>
      <Text style={[styles.mailSubject, !item.isRead && styles.unreadText]} numberOfLines={1}>
        {item.subject}
      </Text>
      <Text style={styles.mailPreview} numberOfLines={2}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Inbox',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
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
      
      <View style={styles.header}>
        <Text style={styles.title}>📬 Inbox</Text>
        <TouchableOpacity 
          style={styles.composeButton}
          onPress={() => setShowCompose(true)}
        >
          <Send size={isTablet ? 24 : 20} color={colors.text} />
          <Text style={styles.composeButtonText}>Compose</Text>
        </TouchableOpacity>
      </View>
      
      {mailbox.length === 0 ? (
        <View style={styles.emptyInbox}>
          <Mail size={isTablet ? 80 : 64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No mail yet</Text>
          <Text style={styles.emptySubtext}>
            Your messages from other players will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={mailbox}
          renderItem={renderMailItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.mailList}
        />
      )}
      
      {/* Mail Detail Modal */}
      <Modal
        visible={!!selectedMail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedMail(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.mailDetailModal}>
            {selectedMail && (
              <>
                <View style={styles.mailDetailHeader}>
                  <Text style={styles.mailDetailSubject}>{selectedMail.subject}</Text>
                  <View style={styles.mailDetailActions}>
                    <TouchableOpacity onPress={() => toggleMailStar(selectedMail.id)}>
                      {selectedMail.isStarred ? (
                        <Star size={isTablet ? 24 : 20} color={colors.gold} fill={colors.gold} />
                      ) : (
                        <StarOff size={isTablet ? 24 : 20} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => {
                        deleteMail(selectedMail.id);
                        setSelectedMail(null);
                      }}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={isTablet ? 24 : 20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.mailDetailInfo}>
                  <Text style={styles.mailDetailSender}>From: {selectedMail.sender}</Text>
                  <Text style={styles.mailDetailDate}>
                    {new Date(selectedMail.timestamp).toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.mailDetailContent}>
                  <Text style={styles.mailDetailMessage}>{selectedMail.message}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedMail(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Compose Mail Modal */}
      <Modal
        visible={showCompose}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCompose(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.composeModal}>
            <Text style={styles.composeTitle}>Compose Mail</Text>
            
            <TextInput
              style={styles.composeInput}
              placeholder="To (character name)"
              placeholderTextColor={colors.textSecondary}
              value={composeRecipient}
              onChangeText={setComposeRecipient}
            />
            
            <TextInput
              style={styles.composeInput}
              placeholder="Subject"
              placeholderTextColor={colors.textSecondary}
              value={composeSubject}
              onChangeText={setComposeSubject}
            />
            
            <TextInput
              style={[styles.composeInput, styles.composeMessageInput]}
              placeholder="Message"
              placeholderTextColor={colors.textSecondary}
              value={composeMessage}
              onChangeText={setComposeMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <View style={styles.composeActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCompose(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSendMail}
              >
                <Send size={isTablet ? 20 : 16} color={colors.text} />
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
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
    padding: isTablet ? 24 : 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  composeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: isTablet ? 20 : 16,
    paddingVertical: isTablet ? 12 : 8,
    borderRadius: 8,
    gap: 8,
  },
  composeButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: isTablet ? 16 : 14,
  },
  emptyInbox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: isTablet ? 20 : 18,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mailList: {
    paddingBottom: 16,
  },
  mailItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isTablet ? 20 : 16,
    marginBottom: 12,
  },
  unreadMail: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  mailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mailInfo: {
    flex: 1,
  },
  mailSender: {
    fontSize: isTablet ? 18 : 16,
    color: colors.text,
    fontWeight: '600',
  },
  mailDate: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
  },
  mailActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unreadDot: {
    width: isTablet ? 10 : 8,
    height: isTablet ? 10 : 8,
    borderRadius: isTablet ? 5 : 4,
    backgroundColor: colors.primary,
  },
  mailSubject: {
    fontSize: isTablet ? 16 : 14,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  mailPreview: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    lineHeight: isTablet ? 20 : 16,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mailDetailModal: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isTablet ? 24 : 20,
    width: '90%',
    maxHeight: '80%',
  },
  mailDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  mailDetailSubject: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 16,
  },
  mailDetailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  mailDetailInfo: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  mailDetailSender: {
    fontSize: isTablet ? 16 : 14,
    color: colors.text,
    marginBottom: 4,
  },
  mailDetailDate: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
  },
  mailDetailContent: {
    flex: 1,
    marginBottom: 16,
  },
  mailDetailMessage: {
    fontSize: isTablet ? 16 : 14,
    color: colors.text,
    lineHeight: isTablet ? 24 : 20,
  },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: isTablet ? 16 : 14,
  },
  composeModal: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isTablet ? 24 : 20,
    width: '90%',
    maxHeight: '80%',
  },
  composeTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  composeInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: isTablet ? 16 : 12,
    marginBottom: 12,
    color: colors.text,
    fontSize: isTablet ? 16 : 14,
  },
  composeMessageInput: {
    height: isTablet ? 150 : 120,
  },
  composeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingVertical: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: isTablet ? 16 : 14,
  },
  sendButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: isTablet ? 16 : 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: isTablet ? 16 : 14,
  },
});