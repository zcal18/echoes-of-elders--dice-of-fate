import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Platform, Dimensions, Animated, KeyboardAvoidingView } from 'react-native';
import { useGameStore } from '@/hooks/useGameStore';
import colors from '@/constants/colors';
import { ChatMessage, ChatLobby, OnlineUser } from '@/types/game';
import { MessageSquare, Plus, X, ChevronLeft, ChevronRight, Smile, ExternalLink, Minimize2, Users, Type, Palette, Activity, Send, Menu } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { connectWebSocket, disconnectWebSocket, sendWebSocketMessage, getWebSocketConnection, getWebSocketStatus } from '@/lib/trpc';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isMobile = screenWidth < 768;
const isDesktop = Platform.OS === 'web' && screenWidth > 1024;

// Adjusted sidebar widths for better desktop experience
const SIDEBAR_WIDTH = Platform.OS === 'web' ? 
  (isMobile ? screenWidth * 0.85 : isDesktop ? 240 : 280) : 
  screenWidth * 0.75;

const EMOTES = [
  '😀', '😂', '😍', '😎', '🤔', '😢', '😡', '🤯',
  '👍', '👎', '👏', '🙌', '💪', '🔥', '⚡', '✨',
  '❤️', '💯', '🎉', '🎊', '🏆', '⚔️', '🛡️', '🗡️'
];

const TEXT_COLORS = [
  { name: 'Default', value: colors.text },
  { name: 'Red', value: colors.error },
  { name: 'Green', value: colors.success },
  { name: 'Blue', value: colors.info },
  { name: 'Yellow', value: colors.warning },
  { name: 'Purple', value: colors.primary },
  { name: 'Orange', value: colors.secondary },
  { name: 'Cyan', value: '#22D3EE' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Lime', value: '#84CC16' },
];

export default function ChatSystem() {
  const { 
    activeChannel,
    activeCharacter,
    chatLobbies,
    userRole,
    chatPopout,
    onlineUsers,
    setActiveChannel,
    addChatMessage,
    createChatLobby,
    joinChatLobby,
    leaveChatLobby,
    cleanupEmptyLobbies,
    addReactionToMessage,
    kickFromChat,
    banUser,
    setChatPopout,
    connectToChat,
    disconnectFromChat,
    updateUserPresence
  } = useGameStore();
  
  const [message, setMessage] = useState("");
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [showEmotesModal, setShowEmotesModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(!isMobile);
  const [membersSidebarVisible, setMembersSidebarVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(TEXT_COLORS[0].value);
  const [isEmoteMode, setIsEmoteMode] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const sidebarAnimation = useRef(new Animated.Value(sidebarVisible ? 0 : -SIDEBAR_WIDTH)).current;
  const membersSidebarAnimation = useRef(new Animated.Value(membersSidebarVisible ? 0 : SIDEBAR_WIDTH)).current;
  
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const joinChannelMutation = trpc.chat.joinChannel.useMutation();
  const leaveChannelMutation = trpc.chat.leaveChannel.useMutation();
  const createChannelMutation = trpc.chat.createChannel.useMutation();
  
  const activeLobby: ChatLobby | undefined = chatLobbies.find((lobby: ChatLobby) => lobby.id === activeChannel);
  const currentMembers = activeLobby?.members || [];
  const onlineMembersInChannel = onlineUsers.filter((user: OnlineUser) => 
    currentMembers.includes(user.id) && user.channelId === activeChannel
  );
  
  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (activeCharacter && Platform.OS === 'web') {
      const ws = connectWebSocket(activeCharacter.id, activeCharacter.name, activeChannel);
      if (ws) {
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case 'message':
                addChatMessage(data.message);
                break;
              case 'userJoined':
                updateUserPresence(data.userId, true, activeChannel);
                break;
              case 'userLeft':
                updateUserPresence(data.userId, false);
                break;
              case 'error':
                setSubscriptionError(data.message);
                break;
              case 'pvpMatchFound':
                // Handle PVP match found
                break;
              case 'guildBattleInitiated':
                // Handle guild battle initiated
                break;
              default:
                console.log('Unknown WebSocket message type:', data.type);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setSubscriptionError(null); // Don't show error to user
        };
        
        ws.onopen = () => {
          setSubscriptionError(null);
        };
        
        ws.onclose = () => {
          // Connection closed
        };
      } else {
        setSubscriptionError(null); // Don't show error to user
      }
      
      connectToChat(activeCharacter.id, activeCharacter.name);
    }
    
    return () => {
      if (activeCharacter) {
        disconnectWebSocket(activeCharacter.id);
        disconnectFromChat(activeCharacter.id);
      }
    };
  }, [activeCharacter]);

  // Join channel when active channel changes
  useEffect(() => {
    if (activeCharacter && activeChannel) {
      joinChannelMutation.mutate({
        channelId: activeChannel,
        userId: activeCharacter.id,
        userName: activeCharacter.name
      });
      
      // Send WebSocket message to switch channel
      if (Platform.OS === 'web') {
        sendWebSocketMessage({
          type: 'switchChannel',
          userId: activeCharacter.id,
          channelId: activeChannel
        });
      }
    }
  }, [activeChannel, activeCharacter]);
  
  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: sidebarVisible ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [sidebarVisible, sidebarAnimation]);
  
  useEffect(() => {
    Animated.timing(membersSidebarAnimation, {
      toValue: membersSidebarVisible ? 0 : SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [membersSidebarVisible, membersSidebarAnimation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && activeLobby?.messages.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeLobby?.messages]);
  
  const handleSend = async () => {
    if (!message.trim() || !activeCharacter) return;
    
    const messageType: 'normal' | 'emote' = isEmoteMode ? 'emote' : 'normal';
    
    const messageData = {
      channelId: activeChannel,
      content: message.trim(),
      sender: activeCharacter.name,
      senderId: activeCharacter.id,
      fontColor: selectedColor !== TEXT_COLORS[0].value ? selectedColor : undefined,
      messageType
    };

    try {
      const result = await sendMessageMutation.mutateAsync(messageData);
      
      // Send via WebSocket for real-time delivery
      if (Platform.OS === 'web') {
        const success = sendWebSocketMessage({
          type: 'message',
          channelId: activeChannel,
          message: {
            id: result.id,
            content: message.trim(),
            sender: activeCharacter.name,
            timestamp: Date.now(),
            reactions: [],
            fontColor: selectedColor !== TEXT_COLORS[0].value ? selectedColor : undefined,
            messageType
          }
        });
        
        if (!success) {
          console.warn('Failed to send message via WebSocket, message sent via HTTP only');
        }
      }
      
      setMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
      // Fallback to local message if network fails
      addChatMessage({
        id: Date.now().toString(),
        content: message.trim(),
        sender: activeCharacter.name,
        timestamp: Date.now(),
        reactions: [],
        fontColor: selectedColor !== TEXT_COLORS[0].value ? selectedColor : undefined,
        messageType
      });
      setMessage("");
    }
  };

  // Handle Enter key press on desktop
  const handleKeyPress = (event: any) => {
    if (Platform.OS === 'web' && event.nativeEvent.key === 'Enter' && !event.nativeEvent.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };
  
  const handleEmoteSelect = (emote: string) => {
    setMessage(prev => prev + emote);
    setShowEmotesModal(false);
  };
  
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setShowColorModal(false);
  };
  
  const handlePopout = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Not Available', 'Chat pop-out is only available on desktop.');
      return;
    }
    setChatPopout(!chatPopout);
  };
  
  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !activeCharacter) return;
    
    try {
      await createChannelMutation.mutateAsync({
        name: newRoomName.trim(),
        description: newRoomDescription.trim(),
        isPrivate,
        createdBy: activeCharacter.id
      });
      
      createChatLobby(
        newRoomName.trim(),
        newRoomDescription.trim(),
        isPrivate
      );
      
      setShowNewRoomModal(false);
      setNewRoomName("");
      setNewRoomDescription("");
      setIsPrivate(false);
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };
  
  const handleModAction = (userId: string, action: 'kick' | 'ban') => {
    if (!userRole || (userRole !== 'admin' && userRole !== 'moderator')) {
      return;
    }
    
    if (action === 'kick') {
      Alert.alert(
        'Kick User',
        'Are you sure you want to kick this user?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Kick',
            style: 'destructive',
            onPress: () => kickFromChat(userId, activeChannel)
          }
        ]
      );
    } else if (action === 'ban' && userRole === 'admin') {
      Alert.prompt(
        'Ban User',
        'Enter reason for ban:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Ban',
            style: 'destructive',
            onPress: (reason) => {
              if (reason) {
                banUser(userId, reason);
              }
            }
          }
        ],
        'plain-text'
      );
    }
  };
  
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  
  const toggleMembersSidebar = () => {
    setMembersSidebarVisible(!membersSidebarVisible);
  };
  
  const toggleEmoteMode = () => {
    setIsEmoteMode(!isEmoteMode);
  };
  
  const renderMessage = (message: ChatMessage, index: number) => {
    // Format emote messages differently
    const isEmote = message.messageType === 'emote';
    const formattedContent = isEmote ? `*${message.sender} ${message.content}*` : message.content;
    
    // Use message.id if available, otherwise fallback to index with timestamp
    const messageKey = message.id || `message-${index}-${message.timestamp || Date.now()}`;
    
    return (
      <View key={messageKey} style={styles.messageContainer}>
        {!isEmote && (
          <View style={styles.messageHeader}>
            <Text style={styles.sender}>{message.sender}</Text>
            <Text style={styles.timestamp}>
              {new Date(message.timestamp || Date.now()).toLocaleTimeString()}
            </Text>
          </View>
        )}
        
        <Text style={[
          styles.messageContent, 
          isEmote && styles.emoteContent,
          message.fontColor && { color: message.fontColor }
        ]}>
          {formattedContent}
        </Text>
        
        {message.reactions && message.reactions.length > 0 && (
          <View style={styles.reactionsContainer}>
            {message.reactions.map((reaction, reactionIndex) => (
              <TouchableOpacity
                key={`reaction-${messageKey}-${reaction.emoji}-${reactionIndex}`}
                style={styles.reaction}
                onPress={() => addReactionToMessage(messageKey, reaction.emoji)}
              >
                <Text>{reaction.emoji}</Text>
                <Text style={styles.reactionCount}>{reaction.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {userRole && (userRole === 'admin' || userRole === 'moderator') && message.sender && (
          <View style={styles.moderationControls}>
            <TouchableOpacity
              style={styles.moderationButton}
              onPress={() => handleModAction(message.sender, 'kick')}
            >
              <Text style={styles.moderationButtonText}>Kick</Text>
            </TouchableOpacity>
            
            {userRole === 'admin' && (
              <TouchableOpacity
                style={[styles.moderationButton, styles.banButton]}
                onPress={() => handleModAction(message.sender, 'ban')}
              >
                <Text style={styles.moderationButtonText}>Ban</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { height: isMobile ? screenHeight : '100%' }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, chatPopout && Platform.OS === 'web' && styles.popoutContainer]}>
        {/* Channels Sidebar */}
        <Animated.View 
          style={[
            styles.sidebar,
            { 
              transform: [{ translateX: sidebarAnimation }],
              position: Platform.OS === 'web' && !isMobile ? 'relative' : 'absolute',
              zIndex: 10,
              width: SIDEBAR_WIDTH,
            }
          ]}
        >
          <View style={styles.channelHeader}>
            <Text style={styles.channelHeaderText}>Channels</Text>
            <View style={styles.channelHeaderButtons}>
              <TouchableOpacity
                style={styles.newChannelButton}
                onPress={() => setShowNewRoomModal(true)}
              >
                <Plus size={20} color={colors.text} />
              </TouchableOpacity>
              {isMobile && (
                <TouchableOpacity
                  style={styles.newChannelButton}
                  onPress={toggleSidebar}
                >
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <ScrollView style={styles.channelList}>
            {chatLobbies.map((lobby: ChatLobby) => (
              <TouchableOpacity
                key={lobby.id}
                style={[
                  styles.channelItem,
                  activeChannel === lobby.id && styles.activeChannelItem
                ]}
                onPress={() => {
                  setActiveChannel(lobby.id);
                  if (isMobile) {
                    setSidebarVisible(false);
                  }
                }}
              >
                <MessageSquare size={16} color={colors.text} />
                <Text 
                  style={[
                    styles.channelName,
                    activeChannel === lobby.id && styles.activeChannelName
                  ]}
                >
                  {lobby.name}
                </Text>
                {lobby.isPrivate && (
                  <Text style={styles.privateIndicator}>🔒</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
        
        {/* Main Chat Area */}
        <View style={[
          styles.chatArea,
          Platform.OS === 'web' && !isMobile && sidebarVisible && { marginLeft: SIDEBAR_WIDTH },
          Platform.OS === 'web' && !isMobile && membersSidebarVisible && { marginRight: SIDEBAR_WIDTH },
          // Enhanced width utilization for desktop
          isDesktop && styles.desktopChatArea
        ]}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            {(isMobile || Platform.OS !== 'web') && (
              <TouchableOpacity 
                style={styles.toggleSidebarButton}
                onPress={toggleSidebar}
              >
                <Menu size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            <View style={styles.chatHeaderContent}>
              {activeLobby?.description && (
                <Text style={styles.chatHeaderDescription}>
                  {activeLobby.description}
                </Text>
              )}
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={toggleMembersSidebar}
              >
                <Users size={20} color={colors.text} />
                <Text style={styles.memberCount}>
                  {onlineMembersInChannel.length}
                </Text>
              </TouchableOpacity>
              {chatPopout && Platform.OS === 'web' && (
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => setChatPopout(false)}
                >
                  <Minimize2 size={20} color={colors.text} />
                </TouchableOpacity>
              )}
              {Platform.OS === 'web' && (
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={handlePopout}
                >
                  <ExternalLink size={20} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Messages Area */}
          <ScrollView
            ref={scrollViewRef}
            style={[styles.messageList, isDesktop && styles.desktopMessageList]}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {activeLobby?.messages.map((msg, index) => {
              const renderedMessage = renderMessage(msg, index);
              return renderedMessage;
            }).filter(Boolean)}
          </ScrollView>
          
          {/* Enhanced Input Container for Desktop/Mobile */}
          <View style={[
            styles.inputContainer,
            Platform.OS === 'web' && !isMobile && styles.desktopInputContainer,
            isDesktop && styles.desktopInputContainerWide
          ]}>
            {/* Inline Input Controls */}
            <View style={[
              styles.inlineInputControls,
              Platform.OS === 'web' && !isMobile && styles.desktopInputControls
            ]}>
              <TouchableOpacity
                style={[styles.compactControlButton, isEmoteMode && styles.activeControlButton]}
                onPress={toggleEmoteMode}
              >
                <Activity size={14} color={isEmoteMode ? colors.primary : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.compactControlButton}
                onPress={() => setShowColorModal(true)}
              >
                <Palette size={14} color={selectedColor !== TEXT_COLORS[0].value ? selectedColor : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.compactControlButton}
                onPress={() => setShowEmotesModal(true)}
              >
                <Smile size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              ref={textInputRef}
              style={[
                styles.compactInput,
                Platform.OS === 'web' && !isMobile && styles.desktopInput,
                isDesktop && styles.desktopInputWide,
                { color: selectedColor }
              ]}
              value={message}
              onChangeText={setMessage}
              placeholder={isEmoteMode ? "Describe your action..." : "Type a message..."}
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
              onKeyPress={handleKeyPress}
              blurOnSubmit={false}
            />
            
            <TouchableOpacity
              style={[
                styles.compactSendButton,
                Platform.OS === 'web' && !isMobile && styles.desktopSendButton
              ]}
              onPress={handleSend}
            >
              <Send size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Members Sidebar */}
        <Animated.View 
          style={[
            styles.membersPanel,
            { 
              transform: [{ translateX: membersSidebarAnimation }],
              position: Platform.OS === 'web' && !isMobile ? 'relative' : 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: SIDEBAR_WIDTH,
              zIndex: 5
            }
          ]}
        >
          <View style={styles.membersHeader}>
            <Users size={16} color={colors.text} />
            <Text style={styles.membersTitle}>
              Online ({onlineMembersInChannel.length})
            </Text>
            <TouchableOpacity
              style={styles.closeMembersButton}
              onPress={toggleMembersSidebar}
            >
              <X size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.membersList}>
            {onlineMembersInChannel.length > 0 ? (
              onlineMembersInChannel.map((user: OnlineUser, index: number) => (
                <View key={`member-${user.id}-${index}`} style={styles.memberItem}>
                  <View style={styles.onlineIndicator} />
                  <Text style={styles.memberName}>{user.name}</Text>
                  <Text style={styles.memberStatus}>Online</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noMembersText}>No online members in this channel</Text>
            )}
          </ScrollView>
        </Animated.View>
        
        {/* New Room Modal */}
        <Modal
          visible={showNewRoomModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNewRoomModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Channel</Text>
                <TouchableOpacity
                  onPress={() => setShowNewRoomModal(false)}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.modalInput}
                value={newRoomName}
                onChangeText={setNewRoomName}
                placeholder="Channel name"
                placeholderTextColor={colors.textSecondary}
              />
              
              <TextInput
                style={styles.modalInput}
                value={newRoomDescription}
                onChangeText={setNewRoomDescription}
                placeholder="Channel description (optional)"
                placeholderTextColor={colors.textSecondary}
                multiline
              />
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCreateRoom}
              >
                <Text style={styles.modalButtonText}>Create Channel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Emotes Modal */}
        <Modal
          visible={showEmotesModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEmotesModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.emotesModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Emote</Text>
                <TouchableOpacity
                  onPress={() => setShowEmotesModal(false)}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.emotesGrid}>
                {EMOTES.map((emote, index) => (
                  <TouchableOpacity
                    key={`emote-${emote}-${index}`}
                    style={styles.emoteItem}
                    onPress={() => handleEmoteSelect(emote)}
                  >
                    <Text style={styles.emoteText}>{emote}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Color Selection Modal */}
        <Modal
          visible={showColorModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowColorModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.colorModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Text Color</Text>
                <TouchableOpacity
                  onPress={() => setShowColorModal(false)}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.colorGrid}>
                {TEXT_COLORS.map((color, index) => (
                  <TouchableOpacity
                    key={`color-${color.name}-${index}`}
                    style={[
                      styles.colorItem,
                      { backgroundColor: color.value },
                      selectedColor === color.value && styles.selectedColorItem
                    ]}
                    onPress={() => handleColorSelect(color.value)}
                  >
                    {selectedColor === color.value && (
                      <Text style={styles.selectedColorCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.colorNameContainer}>
                {TEXT_COLORS.map((color, index) => (
                  <TouchableOpacity
                    key={`color-name-${color.name}-${index}`}
                    style={[
                      styles.colorNameItem,
                      selectedColor === color.value && styles.selectedColorNameItem
                    ]}
                    onPress={() => handleColorSelect(color.value)}
                  >
                    <Text 
                      style={[
                        styles.colorName,
                        { color: color.value }
                      ]}
                    >
                      {color.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  popoutContainer: {
    position: 'absolute',
    top: 50,
    left: 50,
    right: 50,
    bottom: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  sidebar: {
    borderRightWidth: 1,
    borderRightColor: colors.surfaceLight,
    backgroundColor: colors.surface,
    height: '100%',
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  channelHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  channelHeaderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  newChannelButton: {
    padding: 4,
  },
  channelList: {
    flex: 1,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  activeChannelItem: {
    backgroundColor: colors.primary + '20',
  },
  channelName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  activeChannelName: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  privateIndicator: {
    fontSize: 12,
  },
  chatArea: {
    flex: 1,
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column',
  },
  // Enhanced desktop chat area for wider layout
  desktopChatArea: {
    minWidth: 600, // Ensure minimum width for desktop
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
    backgroundColor: colors.surface,
  },
  toggleSidebarButton: {
    marginRight: 12,
  },
  chatHeaderContent: {
    flex: 1,
  },
  chatHeaderDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.surfaceDark,
    borderRadius: 6,
    gap: 4,
  },
  memberCount: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  // Enhanced desktop message list for wider content
  desktopMessageList: {
    paddingHorizontal: 24, // More padding for desktop
  },
  membersPanel: {
    borderLeftWidth: 1,
    borderLeftColor: colors.surfaceLight,
    backgroundColor: colors.surface,
    padding: 12,
    height: '100%',
  },
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  membersTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeMembersButton: {
    padding: 4,
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  memberName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  memberStatus: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noMembersText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginBottom: 8,
    // Enhanced width utilization for messages
    width: '100%',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sender: {
    color: colors.text,
    fontWeight: 'bold',
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  messageContent: {
    color: colors.text,
    lineHeight: 20,
  },
  emoteContent: {
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  reactionCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moderationControls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  moderationButton: {
    backgroundColor: colors.error + '20',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  banButton: {
    backgroundColor: colors.error + '40',
  },
  moderationButtonText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Enhanced Input Container Styles
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
  },
  desktopInputContainer: {
    padding: 12,
    gap: 12,
  },
  // Enhanced desktop input container for wider layout
  desktopInputContainerWide: {
    paddingHorizontal: 24, // More padding for desktop
    gap: 16,
  },
  inlineInputControls: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  desktopInputControls: {
    gap: 8,
  },
  compactControlButton: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 4,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  activeControlButton: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  compactInput: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.background,
    color: colors.text,
    maxHeight: 60,
    minHeight: 32,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    fontSize: 14,
  },
  desktopInput: {
    padding: 12,
    borderRadius: 8,
    maxHeight: 80,
    minHeight: 40,
    fontSize: 16,
  },
  // Enhanced desktop input for wider layout
  desktopInputWide: {
    minHeight: 44,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  compactSendButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    padding: 6,
    height: 32,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopSendButton: {
    padding: 8,
    height: 40,
    width: 40,
    borderRadius: 8,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Platform.OS === 'web' ? 400 : '90%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
  },
  emotesModalContent: {
    width: Platform.OS === 'web' ? 320 : '85%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    maxHeight: '70%',
  },
  colorModalContent: {
    width: Platform.OS === 'web' ? 320 : '85%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: colors.text,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  emotesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emoteItem: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoteText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorItem: {
    borderColor: colors.text,
  },
  selectedColorCheck: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  colorNameContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  colorNameItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedColorNameItem: {
    backgroundColor: colors.surface,
  },
  colorName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});