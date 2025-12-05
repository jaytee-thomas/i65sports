import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PollCreatorProps {
  onChange: (poll: any) => void;
}

export default function PollCreator({ onChange }: PollCreatorProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    // Validate and send data up
    const validOptions = options.filter((opt) => opt.trim().length > 0);
    if (question.trim().length > 0 && validOptions.length >= 2) {
      onChange({
        question: question.trim(),
        options: validOptions,
      });
    } else {
      onChange(null);
    }
  }, [question, options]);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bar-chart" size={20} color="#00FF9F" />
        <Text style={styles.title}>Create Poll</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Poll question (e.g., Who will win?)"
        placeholderTextColor="#8892A6"
        value={question}
        onChangeText={setQuestion}
        maxLength={200}
      />

      <Text style={styles.label}>Options (2-6)</Text>
      {options.map((option, index) => (
        <View key={index} style={styles.optionRow}>
          <TextInput
            style={styles.optionInput}
            placeholder={`Option ${index + 1}`}
            placeholderTextColor="#8892A6"
            value={option}
            onChangeText={(value) => handleOptionChange(index, value)}
            maxLength={100}
          />
          {options.length > 2 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveOption(index)}
            >
              <Ionicons name="close-circle" size={24} color="#FF4444" />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {options.length < 6 && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddOption}>
          <Ionicons name="add-circle" size={20} color="#00FF9F" />
          <Text style={styles.addButtonText}>Add Option</Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#0A0E27',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8C5D6',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    backgroundColor: '#0A0E27',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF9F',
  },
});

