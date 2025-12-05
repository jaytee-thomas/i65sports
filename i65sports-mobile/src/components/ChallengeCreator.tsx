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
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ChallengeCreatorProps {
  onChange: (challenge: any) => void;
}

export default function ChallengeCreator({ onChange }: ChallengeCreatorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('POSTING');
  const [requirement, setRequirement] = useState('5');
  const [reward, setReward] = useState('');
  const [expiresAt, setExpiresAt] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default 1 week
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const reqNum = parseInt(requirement);
    if (
      title.trim().length > 0 &&
      type.length > 0 &&
      !isNaN(reqNum) &&
      reqNum > 0 &&
      reward.trim().length > 0
    ) {
      onChange({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        target: reqNum, // API expects 'target', maps to 'requirement' in schema
        reward: reward.trim(),
        expiresAt: expiresAt.toISOString(),
      });
    } else {
      onChange(null);
    }
  }, [title, description, type, requirement, reward, expiresAt]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpiresAt(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flame" size={20} color="#FF6B35" />
        <Text style={styles.title}>Create Challenge</Text>
      </View>

      <Text style={styles.description}>
        Set goals for fans to complete and earn rewards
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Challenge title (e.g., Post 5 Hot Takes This Week)"
        placeholderTextColor="#8892A6"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        placeholderTextColor="#8892A6"
        value={description}
        onChangeText={setDescription}
        maxLength={200}
        multiline
      />

      <Text style={styles.label}>Challenge Type</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={type}
          onValueChange={(value) => setType(value)}
          style={styles.picker}
          dropdownIconColor="#FFFFFF"
        >
          <Picker.Item label="Post Hot Takes" value="POSTING" />
          <Picker.Item label="Get Views" value="VIEWING" />
          <Picker.Item label="Get Engagement" value="ENGAGEMENT" />
          <Picker.Item label="Creative Challenge" value="CREATIVE" />
        </Picker>
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Target</Text>
          <TextInput
            style={styles.input}
            placeholder="5"
            placeholderTextColor="#8892A6"
            value={requirement}
            onChangeText={setRequirement}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>

        <View style={styles.halfInput}>
          <Text style={styles.label}>Reward</Text>
          <TextInput
            style={styles.input}
            placeholder="Badge + Points"
            placeholderTextColor="#8892A6"
            value={reward}
            onChangeText={setReward}
            maxLength={50}
          />
        </View>
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.label}>Expires:</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color="#FF6B35" />
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
    marginBottom: 12,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8C5D6',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#0A0E27',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
    height: 50,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  dateSection: {
    marginTop: 4,
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
