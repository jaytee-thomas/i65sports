import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GameTimeline } from '../components/GameTimeline';
import { QuickRecordButton } from '../components/QuickRecordButton';
import socketService from '../services/socket';

type RouteParams = {
  LiveGame: {
    gameId: string;
    homeTeam: string;
    awayTeam: string;
    sport: string;
  };
};

export default function LiveGameScreen() {
  const route = useRoute<RouteProp<RouteParams, 'LiveGame'>>();
  const navigation = useNavigation();
  const { gameId, homeTeam, awayTeam, sport } = route.params;

  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState('Q3');
  const [gameClock, setGameClock] = useState('4:23');
  const [activeUsers, setActiveUsers] = useState(124);

  useEffect(() => {
    // Join game room
    socketService.joinGame(gameId);

    // Mock timeline events (replace with real data)
    setTimelineEvents([
      {
        id: '1',
        takeId: 'take1',
        title: 'STEPH CURRY 3-POINTER! 🔥',
        timestamp: new Date(),
        gameClock: 'Q3 4:23',
        thumbnailUrl: '',
        reactionCount: 234,
      },
      {
        id: '2',
        takeId: 'take2',
        title: 'LeBron posterizes defender!',
        timestamp: new Date(Date.now() - 300000),
        gameClock: 'Q3 7:45',
        thumbnailUrl: '',
        reactionCount: 189,
      },
      {
        id: '3',
        takeId: 'take3',
        title: 'Refs missed an obvious call',
        timestamp: new Date(Date.now() - 600000),
        gameClock: 'Q2 11:20',
        thumbnailUrl: '',
        reactionCount: 156,
      },
    ]);

    return () => {
      socketService.leaveGame(gameId);
    };
  }, [gameId]);

  const handleRecordNow = () => {
    // Navigate to camera with game context
    navigation.navigate('Camera' as never, {
      gameId,
      gameClock: `${currentPeriod} ${gameClock}`,
    } as never);
  };

  const handleEventPress = (takeId: string) => {
    // Navigate to Hot Take detail
    console.log('Navigate to take:', takeId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.gameInfo}>
          <Text style={styles.teams}>
            {homeTeam} vs {awayTeam}
          </Text>
          <View style={styles.gameStatus}>
            <View style={styles.liveDot} />
            <Text style={styles.period}>{currentPeriod}</Text>
            <Text style={styles.clock}>{gameClock}</Text>
            <Text style={styles.viewers}>• {activeUsers} watching</Text>
          </View>
        </View>
      </View>

      {/* Quick Record Button */}
      <QuickRecordButton
        onPress={handleRecordNow}
        gameClock={`${currentPeriod} ${gameClock}`}
      />

      {/* Timeline */}
      <GameTimeline
        events={timelineEvents}
        onEventPress={handleEventPress}
        currentPeriod={currentPeriod}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  backButton: {
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  teams: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF1493',
  },
  period: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF9F',
  },
  clock: {
    fontSize: 14,
    color: '#B8C5D6',
  },
  viewers: {
    fontSize: 12,
    color: '#8892A6',
  },
});

