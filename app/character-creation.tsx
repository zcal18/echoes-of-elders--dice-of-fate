import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useGameStore } from '@/hooks/useGameStore';
import NameInput from '@/components/CharacterCreation/NameInput';
import RaceSelection from '@/components/CharacterCreation/RaceSelection';
import ClassSelection from '@/components/CharacterCreation/ClassSelection';
import CharacterSummary from '@/components/CharacterCreation/CharacterSummary';
import colors from '@/constants/colors';
import { CustomClass, CustomRace } from '@/types/game';

type CreationStep = 'name' | 'race' | 'class' | 'summary';

export default function CharacterCreationScreen() {
  const [step, setStep] = useState<CreationStep>('name');
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [customClass, setCustomClass] = useState<CustomClass | null>(null);
  const [customRace, setCustomRace] = useState<CustomRace | null>(null);
  
  const router = useRouter();
  const { isAuthenticated, createCharacter, characters } = useGameStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)');
      return;
    }
    
    // Check if user already has 3 characters
    if (characters.length >= 3) {
      router.replace('/character-management');
    }
  }, [isAuthenticated, characters.length]);
  
  if (!isAuthenticated || characters.length >= 3) {
    return null;
  }
  
  const handleNameContinue = () => {
    setStep('race');
  };
  
  const handleRaceSelect = (raceId: string, customRaceData?: CustomRace) => {
    setSelectedRace(raceId);
    if (customRaceData) {
      setCustomRace(customRaceData);
    }
    setStep('class');
  };
  
  const handleClassSelect = (classId: string, customClassData?: CustomClass) => {
    setSelectedClass(classId);
    if (customClassData) {
      setCustomClass(customClassData);
    }
    setStep('summary');
  };
  
  const handleCreateCharacter = (profileImage?: string) => {
    if (name && selectedRace && selectedClass) {
      createCharacter({
        name,
        race: selectedRace,
        class: selectedClass,
        profileImage,
        customClass: customClass || undefined,
        customRace: customRace || undefined
      });
      
      // Navigate back to home or character management
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    }
  };
  
  const handleBack = () => {
    switch (step) {
      case 'race':
        setStep('name');
        break;
      case 'class':
        setStep('race');
        break;
      case 'summary':
        setStep('class');
        break;
    }
  };
  
  const getStepTitle = () => {
    switch (step) {
      case 'name': return 'Character Name';
      case 'race': return 'Choose Race';
      case 'class': return 'Choose Class';
      case 'summary': return 'Character Summary';
      default: return 'Create Character';
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: getStepTitle(),
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerBackVisible: step !== 'name',
        }}
      />
      {step === 'name' && (
        <NameInput 
          name={name} 
          onNameChange={setName} 
          onContinue={handleNameContinue} 
        />
      )}
      
      {step === 'race' && (
        <RaceSelection 
          selectedRace={selectedRace} 
          onSelectRace={handleRaceSelect} 
        />
      )}
      
      {step === 'class' && (
        <ClassSelection 
          selectedClass={selectedClass} 
          onSelectClass={handleClassSelect} 
        />
      )}
      
      {step === 'summary' && selectedRace && selectedClass && (
        <CharacterSummary 
          name={name}
          raceId={selectedRace}
          classId={selectedClass}
          customClass={customClass}
          customRace={customRace}
          onCreateCharacter={handleCreateCharacter}
          onBack={handleBack}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});