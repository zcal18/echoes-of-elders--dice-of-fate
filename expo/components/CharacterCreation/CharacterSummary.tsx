import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform, Modal, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { races } from '@/constants/gameData';
import colors from '@/constants/colors';
import { CustomClass, CustomRace } from '@/types/game';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type CharacterSummaryProps = {
  name: string;
  raceId: string;
  classId: string;
  customClass: CustomClass | null;
  customRace: CustomRace | null;
  onCreateCharacter: (profileImage?: string) => void;
  onBack: () => void;
};

export default function CharacterSummary({ 
  name, 
  raceId, 
  classId, 
  customClass, 
  customRace,
  onCreateCharacter, 
  onBack 
}: CharacterSummaryProps) {
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | undefined>(undefined);
  
  const race = raceId === 'custom' && customRace ? { 
    ...races.find(r => r.id === 'custom'), 
    name: customRace.name,
    description: customRace.description,
    statBonuses: customRace.statBonuses,
    abilities: customRace.abilities,
    lore: customRace.lore
  } : races.find(r => r.id === raceId);
  
  const className = classId === 'custom' && customClass ? customClass.name : classId;
  const classDescription = classId === 'custom' && customClass ? customClass.description : '';
  
  // Capitalize race and class names
  const capitalizeFirstLetter = (string?: string): string => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };
  
  const pickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll use a simple file input approach
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event: any) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                setTempImage(e.target.result as string);
                setShowCropModal(true);
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      }
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Permission to access camera roll is required!');
        return;
      }
      
      // Show options for different crop ratios
      Alert.alert(
        'Choose Crop Style',
        'Select how you want to crop your image',
        [
          {
            text: 'Square (1:1)',
            onPress: () => launchImagePicker([1, 1])
          },
          {
            text: 'Portrait (3:4)',
            onPress: () => launchImagePicker([3, 4])
          },
          {
            text: 'Free Crop',
            onPress: () => launchImagePicker()
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const launchImagePicker = async (aspect?: [number, number]) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspect || [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error launching image picker:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const takePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Permission to access camera is required!');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };
  
  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      pickImage();
      return;
    }
    
    Alert.alert(
      'Add Profile Image',
      'Choose how you want to add your character image',
      [
        {
          text: 'Camera',
          onPress: takePicture
        },
        {
          text: 'Photo Library',
          onPress: pickImage
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };
  
  const confirmCrop = () => {
    if (tempImage) {
      setProfileImage(tempImage);
      setShowCropModal(false);
      setTempImage(undefined);
    }
  };
  
  const cancelCrop = () => {
    setShowCropModal(false);
    setTempImage(undefined);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Character Summary</Text>
      <Text style={styles.subtitle}>Review your character before creation</Text>
      
      <View style={styles.summaryContainer}>
        <View style={styles.profileContainer}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={showImageOptions}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>📷</Text>
                <Text style={styles.placeholderSubtext}>Add Image</Text>
              </View>
            )}
            <View style={styles.editOverlay}>
              <Text style={styles.editText}>✏️</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.characterName}>{name}</Text>
          <Text style={styles.characterDetails}>
            {capitalizeFirstLetter(race?.name)} {capitalizeFirstLetter(className)}
          </Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Race Details</Text>
          <Text style={styles.description}>{race?.description}</Text>
          
          <View style={styles.statBonuses}>
            <Text style={styles.subSectionTitle}>Stat Bonuses:</Text>
            <View style={styles.statBonusGrid}>
              {race && Object.entries(race.statBonuses).map(([stat, bonus]) => 
                bonus !== undefined && bonus > 0 ? (
                  <View key={stat} style={styles.statBonusItem}>
                    <Text style={styles.statBonus}>
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}: +{bonus}
                    </Text>
                  </View>
                ) : null
              )}
            </View>
          </View>
          
          <View style={styles.abilities}>
            <Text style={styles.subSectionTitle}>Abilities:</Text>
            {race?.abilities.map((ability, index) => (
              <Text key={index} style={styles.ability}>
                • {ability}
              </Text>
            ))}
          </View>
          
          {classId === 'custom' && customClass && (
            <>
              <Text style={styles.sectionTitle}>Class Details</Text>
              <Text style={styles.description}>{classDescription}</Text>
              
              <View style={styles.abilities}>
                <Text style={styles.subSectionTitle}>Starting Abilities:</Text>
                {customClass.abilities.map((ability, index) => (
                  <Text key={index} style={styles.ability}>
                    • {ability}
                  </Text>
                ))}
              </View>
              
              <View style={styles.equipment}>
                <Text style={styles.subSectionTitle}>Starting Equipment:</Text>
                {customClass.startingEquipment.map((item, index) => (
                  <Text key={index} style={styles.equipmentItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={onBack}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={() => onCreateCharacter(profileImage)}
        >
          <Text style={styles.buttonText}>Create Character</Text>
        </TouchableOpacity>
      </View>
      
      {/* Crop Preview Modal for Web */}
      <Modal
        visible={showCropModal}
        animationType="slide"
        transparent={true}
        onRequestClose={cancelCrop}
      >
        <View style={styles.cropModalOverlay}>
          <View style={styles.cropModalContent}>
            <Text style={styles.cropModalTitle}>Preview & Adjust</Text>
            <Text style={styles.cropModalSubtitle}>This is how your image will appear on your character card</Text>
            
            {tempImage && (
              <View style={styles.cropPreviewContainer}>
                <View style={styles.cropPreview}>
                  <Image source={{ uri: tempImage }} style={styles.cropPreviewImage} />
                </View>
                <Text style={styles.cropHint}>Image will be automatically centered and cropped to fit</Text>
              </View>
            )}
            
            <View style={styles.cropButtonContainer}>
              <TouchableOpacity style={styles.cropCancelButton} onPress={cancelCrop}>
                <Text style={styles.cropButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cropConfirmButton} onPress={confirmCrop}>
                <Text style={styles.cropButtonText}>Use This Image</Text>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  summaryContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    marginBottom: 4,
  },
  placeholderSubtext: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  editOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  editText: {
    fontSize: 16,
  },
  characterName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  characterDetails: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  detailsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statBonuses: {
    marginBottom: 16,
  },
  statBonusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBonusItem: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statBonus: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  abilities: {
    marginBottom: 16,
  },
  ability: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  equipment: {
    marginBottom: 16,
  },
  equipmentItem: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: colors.surfaceDark,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textContrast,
  },
  // Crop Modal Styles
  cropModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cropModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: Math.min(400, screenWidth * 0.9),
    maxHeight: screenHeight * 0.8,
  },
  cropModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  cropModalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  cropPreviewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cropPreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  cropPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cropHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cropButtonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  cropCancelButton: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cropConfirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cropButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});