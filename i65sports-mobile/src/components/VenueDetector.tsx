import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import Toast from 'react-native-toast-message';

const API_URL = 'http://192.168.86.226:3000/api';
const { width } = Dimensions.get('window');

interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
  distance: number;
  sport: string;
  team: string;
}

interface VenueDetectorProps {
  onVenueDetected?: (venue: Venue) => void;
  onCheckInSuccess?: (venue: Venue) => void;
}

const getSportIcon = (sport: string) => {
  switch (sport?.toUpperCase()) {
    case 'NBA':
      return '🏀';
    case 'NFL':
      return '🏈';
    case 'NHL':
      return '🏒';
    case 'MLB':
      return '⚾';
    case 'NCAA':
      return '🎓';
    case 'MLS':
      return '⚽';
    default:
      return '🏟️';
  }
};

export const VenueDetector: React.FC<VenueDetectorProps> = ({
  onVenueDetected,
  onCheckInSuccess,
}) => {
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    detectVenues();
  }, []);

  const detectVenues = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      setLocation({ latitude, longitude });
      console.log('📍 Current location:', { latitude, longitude });

      const response = await axios.get(`${API_URL}/venues/nearby`, {
        params: {
          latitude,
          longitude,
          radius: 1, // 1km radius
        },
      });

      const venues = response.data.venues;
      console.log('🏟️ Found nearby venues:', venues.length);
      console.log('🏟️ Venues:', JSON.stringify(venues, null, 2));

      if (venues.length > 0) {
        setNearbyVenues(venues);

        if (venues.length === 1) {
          console.log('✅ Auto-selected single venue');
          // Only one venue, auto-select it
          setSelectedVenue(venues[0]);
          if (onVenueDetected) {
            onVenueDetected(venues[0]);
          }
        } else {
          console.log('🎯 Multiple venues - showing picker');
          // Multiple venues, show picker
          setShowPicker(true);
        }
      }
    } catch (error) {
      console.error('Error detecting venues:', error);
    }
  };

  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    setShowPicker(false);
    
    if (onVenueDetected) {
      onVenueDetected(venue);
    }

    console.log('✅ Selected venue:', venue.name);
  };

  const handleCheckIn = async () => {
    if (!selectedVenue || !location || isLoading) return;

    try {
      setIsLoading(true);
      const token = await getToken();

      const response = await axios.post(
        `${API_URL}/venues/check-in`,
        {
          venueId: selectedVenue.id,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsCheckedIn(true);

      Toast.show({
        type: 'success',
        text1: `Checked in at ${selectedVenue.name}! 🏟️`,
        text2: `You're at the ${selectedVenue.team} game!`,
        position: 'top',
        visibilityTime: 3000,
      });

      if (onCheckInSuccess) {
        onCheckInSuccess(selectedVenue);
      }
    } catch (error: any) {
      console.error('Error checking in:', error);

      const errorMessage = error.response?.data?.error || 'Failed to check in';

      Toast.show({
        type: 'error',
        text1: 'Check-in Failed',
        text2: errorMessage,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (nearbyVenues.length === 0) {
    return null;
  }

  return (
    <>
      {/* Venue Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Game</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.venueList}>
              {nearbyVenues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.venueOption}
                  onPress={() => handleVenueSelect(venue)}
                >
                  <View style={styles.venueOptionIcon}>
                    <Text style={styles.sportEmoji}>{getSportIcon(venue.sport)}</Text>
                  </View>
                  <View style={styles.venueOptionInfo}>
                    <Text style={styles.venueOptionName}>{venue.name}</Text>
                    <Text style={styles.venueOptionTeam}>
                      {venue.team} ({venue.sport})
                    </Text>
                    <Text style={styles.venueOptionDistance}>
                      {(venue.distance * 1000).toFixed(0)}m away
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#8892A6" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Check-In Banner */}
      {selectedVenue && (
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.venueInfo}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.sportEmoji}>{getSportIcon(selectedVenue.sport)}</Text>
            <View style={styles.textContainer}>
              <Text style={styles.venueName}>{selectedVenue.name}</Text>
              <Text style={styles.venueDetails}>
                {selectedVenue.team} • {(selectedVenue.distance * 1000).toFixed(0)}m away
              </Text>
            </View>
            {nearbyVenues.length > 1 && (
              <Ionicons name="chevron-down" size={20} color="#8892A6" />
            )}
          </TouchableOpacity>

          {!isCheckedIn ? (
            <TouchableOpacity
              style={[styles.checkInButton, isLoading && styles.checkInButtonDisabled]}
              onPress={handleCheckIn}
              disabled={isLoading}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.checkInText}>
                {isLoading ? 'Checking in...' : 'Check In'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.checkedInBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#00FF9F" />
              <Text style={styles.checkedInText}>Checked In</Text>
            </View>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#00FF9F',
  },
  venueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  venueDetails: {
    fontSize: 12,
    color: '#B8C5D6',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF9F',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  checkInButtonDisabled: {
    opacity: 0.5,
  },
  checkInText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  checkedInText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF9F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A0E27',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  venueList: {
    padding: 16,
  },
  venueOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  venueOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  venueOptionInfo: {
    flex: 1,
  },
  venueOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  venueOptionTeam: {
    fontSize: 14,
    color: '#B8C5D6',
    marginBottom: 2,
  },
  venueOptionDistance: {
    fontSize: 12,
    color: '#8892A6',
  },
});
