import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/hooks/useGameStore';
import colors from '@/constants/colors';
import { Users, UserPlus, Crown, Shield, MessageSquare, Plus, X, Map, Swords } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function CommunityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'guilds' | 'parties' | 'friends'>('guilds');
  const [showCreateGuildModal, setShowCreateGuildModal] = useState(false);
  const [showCreatePartyModal, setShowCreatePartyModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [guildDescription, setGuildDescription] = useState('');
  const [guildTag, setGuildTag] = useState('');
  const [partyName, setPartyName] = useState('');
  const [friendName, setFriendName] = useState('');
  
  const { 
    activeCharacter,
    guilds,
    activeParty,
    friendsList,
    onlineFriends,
    territories,
    guildBattles,
    createGuild,
    joinGuild,
    leaveGuild,
    createParty,
    leaveParty,
    addFriend,
    removeFriend
  } = useGameStore();
  
  const createChannelMutation = trpc.chat.createChannel.useMutation();
  const joinChannelMutation = trpc.chat.joinChannel.useMutation();
  const leaveChannelMutation = trpc.chat.leaveChannel.useMutation();
  
  if (!activeCharacter) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No character selected</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleCreateGuild = async () => {
    if (!guildName.trim() || !guildTag.trim()) {
      Alert.alert('Error', 'Please fill in guild name and tag');
      return;
    }
    
    if (guildTag.length > 5) {
      Alert.alert('Error', 'Guild tag must be 5 characters or less');
      return;
    }
    
    // Create guild in game store
    createGuild(guildName.trim(), guildDescription.trim(), guildTag.trim().toUpperCase());
    
    // Create guild chat channel
    try {
      const newGuildId = Date.now().toString(); // This should match the guild ID from createGuild
      await createChannelMutation.mutateAsync({
        guildId: newGuildId,
        guildName: guildName.trim(),
        guildTag: guildTag.trim().toUpperCase(),
        createdBy: activeCharacter.id,
        members: [activeCharacter.id]
      });
    } catch (error) {
      console.error('Failed to create guild channel:', error);
    }
    
    setShowCreateGuildModal(false);
    setGuildName('');
    setGuildDescription('');
    setGuildTag('');
    Alert.alert('Success', 'Guild created successfully!');
  };
  
  const handleCreateParty = () => {
    if (!partyName.trim()) {
      Alert.alert('Error', 'Please enter a party name');
      return;
    }
    
    createParty(partyName.trim());
    setShowCreatePartyModal(false);
    setPartyName('');
    Alert.alert('Success', 'Party created successfully!');
  };
  
  const handleAddFriend = () => {
    if (!friendName.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }
    
    const success = addFriend(friendName.trim());
    if (success) {
      setShowAddFriendModal(false);
      setFriendName('');
      Alert.alert('Success', 'Friend request sent!');
    } else {
      Alert.alert('Error', 'Could not send friend request');
    }
  };
  
  const handleJoinGuild = async (guildId: string) => {
    if (activeCharacter.guildId) {
      Alert.alert('Error', 'You are already in a guild. Leave your current guild first.');
      return;
    }
    
    // Join guild in game store
    joinGuild(guildId);
    
    // Join guild chat channel
    try {
      await joinChannelMutation.mutateAsync({
        guildId,
        userId: activeCharacter.id,
        userName: activeCharacter.name
      });
    } catch (error) {
      console.error('Failed to join guild channel:', error);
    }
    
    Alert.alert('Success', 'Joined guild successfully!');
  };
  
  const handleLeaveGuild = async () => {
    if (!activeCharacter.guildId) return;
    
    Alert.alert(
      'Leave Guild',
      'Are you sure you want to leave your guild?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive', 
          onPress: async () => {
            const guildId = activeCharacter.guildId!;
            
            // Leave guild chat channel
            try {
              await leaveChannelMutation.mutateAsync({
                guildId,
                userId: activeCharacter.id
              });
            } catch (error) {
              console.error('Failed to leave guild channel:', error);
            }
            
            // Leave guild in game store
            leaveGuild();
          }
        }
      ]
    );
  };
  
  const handleLeaveParty = () => {
    Alert.alert(
      'Leave Party',
      'Are you sure you want to leave your party?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: leaveParty }
      ]
    );
  };
  
  const handleRemoveFriend = (friendId: string) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFriend(friendId) }
      ]
    );
  };

  const getGuildTerritoryInfo = () => {
    if (!activeCharacter.guildId) return null;
    
    const guildTerritories = territories.filter(t => t.controllingGuild === activeCharacter.guildId);
    const activeBattles = guildBattles.filter(b => 
      (b.attackingGuild.id === activeCharacter.guildId || b.defendingGuild?.id === activeCharacter.guildId) &&
      (b.status === 'recruiting' || b.status === 'active')
    );
    
    return {
      territories: guildTerritories,
      battles: activeBattles
    };
  };

  const guildTerritoryInfo = getGuildTerritoryInfo();
  
  const renderGuilds = () => {
    const userGuild = guilds.find(g => g.id === activeCharacter.guildId);
    const availableGuilds = guilds.filter(g => g.id !== activeCharacter.guildId);
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Guilds</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateGuildModal(true)}
          >
            <Plus size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Kingdom Map Access */}
        <TouchableOpacity 
          style={styles.kingdomMapButton}
          onPress={() => router.push('/(tabs)/kingdom')}
        >
          <View style={styles.kingdomMapContent}>
            <View style={styles.kingdomMapHeader}>
              <Map size={24} color={colors.text} />
              <Text style={styles.kingdomMapTitle}>Kingdom Map</Text>
            </View>
            <Text style={styles.kingdomMapSubtitle}>
              View territories, initiate guild battles, and claim the crown
            </Text>
            {guildTerritoryInfo && (
              <View style={styles.kingdomMapStats}>
                <Text style={styles.kingdomMapStat}>
                  🏰 {guildTerritoryInfo.territories.length} territories controlled
                </Text>
                {guildTerritoryInfo.battles.length > 0 && (
                  <Text style={styles.kingdomMapStat}>
                    ⚔️ {guildTerritoryInfo.battles.length} active battles
                  </Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        {userGuild && (
          <View style={styles.currentSection}>
            <Text style={styles.currentSectionTitle}>Your Guild</Text>
            <View style={styles.guildCard}>
              <View style={styles.guildHeader}>
                <View style={styles.guildInfo}>
                  <Text style={styles.guildName}>{userGuild.name}</Text>
                  <Text style={styles.guildTag}>[{userGuild.clanTag}]</Text>
                </View>
                <TouchableOpacity 
                  style={styles.leaveButton}
                  onPress={handleLeaveGuild}
                >
                  <Text style={styles.leaveButtonText}>Leave</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.guildDescription}>{userGuild.description}</Text>
              <View style={styles.guildStats}>
                <Text style={styles.guildStat}>👥 {userGuild.members.length} members</Text>
                <Text style={styles.guildStat}>⭐ Level {userGuild.level || 1}</Text>
                {guildTerritoryInfo && (
                  <Text style={styles.guildStat}>🏰 {guildTerritoryInfo.territories.length} territories</Text>
                )}
              </View>
              <View style={styles.guildFeatures}>
                <Text style={styles.guildFeatureTitle}>Guild Features:</Text>
                <Text style={styles.guildFeature}>• Private guild chat channel</Text>
                <Text style={styles.guildFeature}>• Territory control battles (3v3)</Text>
                <Text style={styles.guildFeature}>• Shared guild resources</Text>
                <Text style={styles.guildFeature}>• Guild ranking system</Text>
              </View>
              {guildTerritoryInfo && guildTerritoryInfo.battles.length > 0 && (
                <View style={styles.activeBattles}>
                  <Text style={styles.activeBattlesTitle}>⚔️ Active Battles:</Text>
                  {guildTerritoryInfo.battles.map(battle => (
                    <Text key={battle.id} style={styles.activeBattle}>
                      • {territories.find(t => t.id === battle.territoryId)?.name} ({battle.status})
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
        
        <Text style={styles.availableTitle}>Available Guilds</Text>
        <ScrollView style={styles.guildsList}>
          {availableGuilds.map(guild => (
            <View key={guild.id} style={styles.guildCard}>
              <View style={styles.guildHeader}>
                <View style={styles.guildInfo}>
                  <Text style={styles.guildName}>{guild.name}</Text>
                  <Text style={styles.guildTag}>[{guild.clanTag}]</Text>
                </View>
                {!activeCharacter.guildId && (
                  <TouchableOpacity 
                    style={styles.joinButton}
                    onPress={() => handleJoinGuild(guild.id)}
                  >
                    <Text style={styles.joinButtonText}>Join</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.guildDescription}>{guild.description}</Text>
              <View style={styles.guildStats}>
                <Text style={styles.guildStat}>👥 {guild.members.length} members</Text>
                <Text style={styles.guildStat}>⭐ Level {guild.level || 1}</Text>
                <Text style={styles.guildStat}>
                  🏰 {territories.filter(t => t.controllingGuild === guild.id).length} territories
                </Text>
              </View>
            </View>
          ))}
          
          {availableGuilds.length === 0 && (
            <View style={styles.emptyState}>
              <Shield size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No other guilds available</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your own guild to start building your community
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };
  
  const renderParties = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Parties</Text>
          {!activeParty && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowCreatePartyModal(true)}
            >
              <Plus size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
        
        {activeParty ? (
          <View style={styles.currentSection}>
            <Text style={styles.currentSectionTitle}>Your Party</Text>
            <View style={styles.partyCard}>
              <View style={styles.partyHeader}>
                <Text style={styles.partyName}>{activeParty.name}</Text>
                <TouchableOpacity 
                  style={styles.leaveButton}
                  onPress={handleLeaveParty}
                >
                  <Text style={styles.leaveButtonText}>Leave</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.partyMembers}>
                {activeParty.members.length}/{activeParty.maxMembers} members
              </Text>
              <View style={styles.membersList}>
                {activeParty.members.map(member => (
                  <View key={member.id} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberDetails}>
                        Level {member.level} {member.class}
                      </Text>
                    </View>
                    <View style={styles.memberStatus}>
                      {member.id === activeParty.leaderId && (
                        <Crown size={16} color={colors.warning} />
                      )}
                      <View 
                        style={[
                          styles.statusDot,
                          { backgroundColor: member.isOnline ? colors.success : colors.error }
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Users size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>You are not in a party</Text>
            <Text style={styles.emptyStateSubtext}>
              Create or join a party to adventure with friends
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  const renderFriends = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddFriendModal(true)}
          >
            <Plus size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {friendsList.length > 0 ? (
          <ScrollView style={styles.friendsList}>
            {friendsList.map(friend => (
              <View key={friend.id} style={styles.friendCard}>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendDetails}>
                    Level {friend.level} {friend.race} {friend.class}
                  </Text>
                  <Text style={styles.friendLastSeen}>
                    {onlineFriends.includes(friend.id) 
                      ? '🟢 Online' 
                      : `Last seen: ${new Date(friend.lastSeen).toLocaleDateString()}`
                    }
                  </Text>
                </View>
                <View style={styles.friendActions}>
                  <TouchableOpacity style={styles.messageButton}>
                    <MessageSquare size={16} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveFriend(friend.id)}
                  >
                    <X size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <UserPlus size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No friends yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add friends to chat and adventure together
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'guilds' && styles.activeTab]}
          onPress={() => setActiveTab('guilds')}
        >
          <Shield size={20} color={activeTab === 'guilds' ? colors.text : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'guilds' && styles.activeTabText]}>
            Guilds
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'parties' && styles.activeTab]}
          onPress={() => setActiveTab('parties')}
        >
          <Users size={20} color={activeTab === 'parties' ? colors.text : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'parties' && styles.activeTabText]}>
            Parties
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <UserPlus size={20} color={activeTab === 'friends' ? colors.text : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      {activeTab === 'guilds' && renderGuilds()}
      {activeTab === 'parties' && renderParties()}
      {activeTab === 'friends' && renderFriends()}
      
      {/* Create Guild Modal */}
      <Modal
        visible={showCreateGuildModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateGuildModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Guild</Text>
            
            <TextInput
              style={styles.modalInput}
              value={guildName}
              onChangeText={setGuildName}
              placeholder="Guild name"
              placeholderTextColor={colors.textSecondary}
            />
            
            <TextInput
              style={styles.modalInput}
              value={guildTag}
              onChangeText={setGuildTag}
              placeholder="Guild tag (max 5 chars)"
              placeholderTextColor={colors.textSecondary}
              maxLength={5}
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={guildDescription}
              onChangeText={setGuildDescription}
              placeholder="Guild description (optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateGuildModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateGuild}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Create Party Modal */}
      <Modal
        visible={showCreatePartyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreatePartyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Party</Text>
            
            <TextInput
              style={styles.modalInput}
              value={partyName}
              onChangeText={setPartyName}
              placeholder="Party name"
              placeholderTextColor={colors.textSecondary}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreatePartyModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateParty}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriendModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddFriendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Friend</Text>
            
            <TextInput
              style={styles.modalInput}
              value={friendName}
              onChangeText={setFriendName}
              placeholder="Player name"
              placeholderTextColor={colors.textSecondary}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddFriendModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={handleAddFriend}
              >
                <Text style={styles.createButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: isTablet ? 18 : 16,
    textAlign: 'center',
    marginTop: 20,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 16 : 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: colors.primary + '20',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: isTablet ? 20 : 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
  },
  kingdomMapButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kingdomMapContent: {
    gap: 8,
  },
  kingdomMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kingdomMapTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  kingdomMapSubtitle: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
  },
  kingdomMapStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  kingdomMapStat: {
    fontSize: isTablet ? 12 : 10,
    color: colors.primary,
    fontWeight: 'bold',
  },
  currentSection: {
    marginBottom: 24,
  },
  currentSectionTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  availableTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  guildsList: {
    flex: 1,
  },
  guildCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guildHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  guildInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guildName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  guildTag: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
    color: colors.secondary,
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  guildDescription: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  guildStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  guildStat: {
    fontSize: isTablet ? 14 : 12,
    color: colors.text,
  },
  guildFeatures: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
  },
  guildFeatureTitle: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  guildFeature: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  activeBattles: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
  },
  activeBattlesTitle: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  activeBattle: {
    fontSize: isTablet ? 12 : 10,
    color: colors.text,
    marginBottom: 2,
  },
  joinButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  joinButtonText: {
    color: colors.text,
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  leaveButtonText: {
    color: colors.text,
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
  },
  partyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partyName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  partyMembers: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  membersList: {
    gap: 8,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: isTablet ? 12 : 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  memberDetails: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
  },
  memberStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  friendsList: {
    flex: 1,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  friendDetails: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  friendLastSeen: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  messageButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 8,
  },
  removeButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyStateText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  emptyStateSubtext: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 24 : 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: isTablet ? 12 : 10,
    marginBottom: 12,
    color: colors.text,
    fontSize: isTablet ? 16 : 14,
  },
  modalTextArea: {
    height: isTablet ? 80 : 60,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: isTablet ? 12 : 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceDark,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  createButtonText: {
    color: colors.text,
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
});