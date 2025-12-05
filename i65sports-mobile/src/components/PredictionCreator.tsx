import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface PredictionCreatorProps {
  onChange: (prediction: any) => void;
}

export default function PredictionCreator({ onChange }: PredictionCreatorProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Default 24h
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const validOptions = options.filter((opt) => opt.trim().length > 0);
    if (question.trim().length > 0 && validOptions.length >= 2) {
      onChange({
        question: question.trim(),
        options: validOptions,
        expiresAt: expiresAt.toISOString(),
      });
    } else {
      onChange(null);
    }
  }, [question, options, expiresAt]);

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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpiresAt(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={20} color="#FFD700" />
        <Text style={styles.title}>Create Prediction Game</Text>
      </View>

      <Text style={styles.description}>
        Fans predict outcomes and earn points for correct guesses
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Prediction question (e.g., Who will win the championship?)"
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
          <Ionicons name="add-circle" size={20} color="#FFD700" />
          <Text style={styles.addButtonText}>Add Option</Text>
        </TouchableOpacity>
      )}

      <View style={styles.dateSection}>
        <Text style={styles.label}>Lock predictions before:</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color="#FFD700" />
          <Text style={styles.dateText}>
            {expiresAt.toLocaleDateString()} {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={expiresAt}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
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
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  dateSection: {
    marginTop: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0A0E27',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
