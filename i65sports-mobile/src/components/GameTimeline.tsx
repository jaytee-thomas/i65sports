import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TimelineEvent {
  id: string;
  takeId: string;
  title: string;
  timestamp: Date;
  gameClock: string; // e.g., "Q3 4:23"
  thumbnailUrl: string;
  reactionCount: number;
}

interface GameTimelineProps {
  events: TimelineEvent[];
  onEventPress: (takeId: string) => void;
  currentPeriod?: string; // e.g., "Q3"
}

const PERIODS = ['Q1', 'Q2', 'Q3', 'Q4', 'OT'];

export const GameTimeline: React.FC<GameTimelineProps> = ({
  events,
  onEventPress,
  currentPeriod,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  const filteredEvents = selectedPeriod
    ? events.filter((e) => e.gameClock.startsWith(selectedPeriod))
    : events;

  const getEventsForPeriod = (period: string) => {
    return events.filter((e) => e.gameClock.startsWith(period)).length;
  };

  return (
    <View style={styles.container}>
      {/* Period Filter */}
      <View style={styles.periodFilter}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            !selectedPeriod && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(null)}
        >
          <Text
            style={[
              styles.periodText,
              !selectedPeriod && styles.periodTextActive,
            ]}
          >
            All
          </Text>
          <Text style={styles.periodCount}>{events.length}</Text>
        </TouchableOpacity>

        {PERIODS.map((period) => {
          const count = getEventsForPeriod(period);
          const isActive = selectedPeriod === period;
          const isCurrent = currentPeriod === period;

          return (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                isActive && styles.periodButtonActive,
                isCurrent && styles.periodButtonCurrent,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  isActive && styles.periodTextActive,
                ]}
              >
                {period}
              </Text>
              <Text style={styles.periodCount}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Timeline */}
      <ScrollView
        style={styles.timeline}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#8892A6" />
            <Text style={styles.emptyText}>No moments yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to record a Hot Take!
            </Text>
          </View>
        ) : (
          filteredEvents.map((event, index) => (
            <TouchableOpacity
              key={event.id}
              style={styles.timelineEvent}
              onPress={() => onEventPress(event.takeId)}
            >
              {/* Timeline Line */}
              {index !== filteredEvents.length - 1 && (
                <View style={styles.timelineLine} />
              )}

              {/* Event Marker */}
              <View style={styles.eventMarker}>
                <View style={styles.markerDot} />
              </View>

              {/* Event Content */}
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.gameClock}>{event.gameClock}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(event.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <View style={styles.eventCard}>
                  <View style={styles.thumbnail}>
                    <Ionicons name="play-circle" size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <View style={styles.eventStats}>
                      <Ionicons name="flame" size={14} color="#FF1493" />
                      <Text style={styles.reactionCount}>
                        {event.reactionCount} reactions
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#8892A6"
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  periodFilter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1A1F3A',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#00FF9F',
  },
  periodButtonCurrent: {
    borderWidth: 2,
    borderColor: '#FF1493',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8C5D6',
  },
  periodTextActive: {
    color: '#0A0E27',
  },
  periodCount: {
    fontSize: 10,
    color: '#8892A6',
    marginTop: 2,
  },
  timeline: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8892A6',
    marginTop: 8,
  },
  timelineEvent: {
    flexDirection: 'row',
    paddingVertical: 16,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    bottom: -16,
    width: 2,
    backgroundColor: '#1A1F3A',
  },
  eventMarker: {
    width: 40,
    alignItems: 'center',
    paddingTop: 4,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00FF9F',
    borderWidth: 3,
    borderColor: '#0A0E27',
  },
  eventContent: {
    flex: 1,
    marginLeft: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gameClock: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00FF9F',
  },
  timestamp: {
    fontSize: 11,
    color: '#8892A6',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  eventStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionCount: {
    fontSize: 12,
    color: '#B8C5D6',
  },
});

