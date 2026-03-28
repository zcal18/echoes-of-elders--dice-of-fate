import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import colors from '@/constants/colors';

type NameInputProps = {
  name: string;
  onNameChange: (name: string) => void;
  onContinue: () => void;
};

export default function NameInput({ name, onNameChange, onContinue }: NameInputProps) {
  const [error, setError] = useState<string | null>(null);
  
  const handleContinue = () => {
    if (!name.trim()) {
      setError('Please enter a name for your character');
      return;
    }
    
    if (name.length < 3) {
      setError('Name must be at least 3 characters long');
      return;
    }
    
    if (name.length > 20) {
      setError('Name must be at most 20 characters long');
      return;
    }
    
    // Check for valid characters (letters, numbers, and some special characters)
    const validNameRegex = /^[a-zA-Z0-9_\-\s]+$/;
    if (!validNameRegex.test(name)) {
      setError('Name can only contain letters, numbers, spaces, underscores, and hyphens');
      return;
    }
    
    setError(null);
    onContinue();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Name Your Character</Text>
      <Text style={styles.subtitle}>Choose a name that will be known throughout Ryh'Din</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(text) => {
            onNameChange(text);
            if (error) setError(null);
          }}
          placeholder="Enter character name"
          placeholderTextColor={colors.textSecondary}
          maxLength={20}
          autoFocus
        />
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.continueButton,
          !name.trim() && styles.disabledButton
        ]} 
        onPress={handleContinue}
        disabled={!name.trim()}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
      
      <View style={styles.namingTipsContainer}>
        <Text style={styles.namingTipsTitle}>Naming Tips:</Text>
        <Text style={styles.namingTip}>• Choose a name that fits your race and class</Text>
        <Text style={styles.namingTip}>• Avoid using offensive or inappropriate names</Text>
        <Text style={styles.namingTip}>• Be creative and unique</Text>
        <Text style={styles.namingTip}>• Names between 3-20 characters are allowed</Text>
      </View>
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
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  errorText: {
    color: colors.error,
    marginTop: 8,
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.7,
  },
  continueButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  namingTipsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  namingTipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  namingTip: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});