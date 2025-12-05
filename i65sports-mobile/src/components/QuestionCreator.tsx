import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuestionCreatorProps {
  onChange: (question: any) => void;
}

export default function QuestionCreator({ onChange }: QuestionCreatorProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (text.trim().length > 0) {
      onChange({
        text: text.trim(),
      });
    } else {
      onChange(null);
    }
  }, [text]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="help-circle" size={20} color="#00FF9F" />
        <Text style={styles.title}>Ask a Question</Text>
      </View>

      <Text style={styles.description}>
        Ask your fans a question and get text responses
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Your question (e.g., What's your prediction for the playoffs?)"
        placeholderTextColor="#8892A6"
        value={text}
        onChangeText={setText}
        maxLength={300}
        multiline
      />

      <Text style={styles.charCount}>{text.length}/300</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 13,
    color: '#8892A6',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0A0E27',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#8892A6',
    textAlign: 'right',
    marginTop: 4,
  },
});
