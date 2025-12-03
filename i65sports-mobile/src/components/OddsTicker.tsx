import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Game {
  id: string;
  league: string;
  time: string;
  team1: string;
  team1Odds: string;
  team2: string;
  team2Odds: string;
}

// Sample odds data - replace with real API data later
const MOCK_GAMES: Game[] = [
  {
    id: '1',
    league: 'NCAAB',
    time: '6:00 PM',
    team1: 'Charleston St.',
    team1Odds: '+1400',
    team2: 'Cincinnati',
    team2Odds: '-4000',
  },
  {
    id: '2',
    league: 'NCAAB',
    time: '6:00 PM',
    team1: 'Iona Gaels',
    team1Odds: '-140',
    team2: 'Delaware Bl.',
    team2Odds: '+116',
  },
  {
    id: '3',
    league: 'NCAAB',
    time: '6:00 PM',
    team1: 'North Alabama',
    team1Odds: '-210',
    team2: 'Jacksonville',
    team2Odds: '+175',
  },
  {
    id: '4',
    league: 'NBA',
    time: '7:30 PM',
    team1: 'Lakers',
    team1Odds: '-180',
    team2: 'Warriors',
    team2Odds: '+155',
  },
  {
    id: '5',
    league: 'NBA',
    time: '8:00 PM',
    team1: 'Celtics',
    team1Odds: '-220',
    team2: 'Heat',
    team2Odds: '+190',
  },
];

export default function OddsTicker() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [scrollX, setScrollX] = useState(0);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  // Duplicate games for seamless loop
  const [games] = useState<Game[]>([...MOCK_GAMES, ...MOCK_GAMES, ...MOCK_GAMES]);

  useEffect(() => {
    if (isAutoScrolling) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
    return () => stopAutoScroll();
  }, [isAutoScrolling]);

  const startAutoScroll = () => {
    stopAutoScroll(); // Clear any existing interval

    autoScrollInterval.current = setInterval(() => {
      setScrollX((prev) => {
        const newPosition = prev + 1;
        const maxScroll = (games.length * 200) / 2; // Reset at halfway point

        if (scrollViewRef.current) {
          if (newPosition >= maxScroll) {
            // Jump back to start for seamless loop
            scrollViewRef.current.scrollTo({ x: 0, animated: false });
            return 0;
          } else {
            scrollViewRef.current.scrollTo({ x: newPosition, animated: false });
            return newPosition;
          }
        }
        return prev;
      });
    }, 30); // Adjust speed here (lower = faster)
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  };

  const handleTouchStart = () => {
    setIsAutoScrolling(false);
  };

  const handleTouchEnd = () => {
    // Resume auto-scroll after 3 seconds of no interaction
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 3000);
  };

  const handleCardPress = (game: Game) => {
    setIsAutoScrolling(false);
    
    // Navigate to odds detail screen
    (navigation as any).navigate('OddsDetail', { game });
    
    // Resume auto-scroll after navigation
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 3000);
  };

  const renderGameCard = (game: Game, index: number) => {
    const isPositive1 = game.team1Odds.includes('+');
    const isPositive2 = game.team2Odds.includes('+');

    return (
      <TouchableOpacity
        key={`${game.id}-${index}`}
        style={styles.gameCard}
        onPress={() => handleCardPress(game)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.league}>{game.league}</Text>
          <Text style={styles.time}>{game.time}</Text>
        </View>
        
        <View style={styles.matchup}>
          <View style={styles.team}>
            <Text style={styles.teamName} numberOfLines={1}>
              {game.team1}
            </Text>
            <Text style={styles.at}>@</Text>
            <Text
              style={[
                styles.odds,
                isPositive1 ? styles.oddsPositive : styles.oddsNegative,
              ]}
            >
              {game.team1Odds}
            </Text>
          </View>
          <View style={styles.team}>
            <Text style={styles.teamName} numberOfLines={1}>
              {game.team2}
            </Text>
            <Text style={styles.at}>@</Text>
            <Text
              style={[
                styles.odds,
                isPositive2 ? styles.oddsPositive : styles.oddsNegative,
              ]}
            >
              {game.team2Odds}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!isAutoScrolling}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onScrollEndDrag={handleTouchEnd}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {games.map((game, index) => renderGameCard(game, index))}
      </ScrollView>
      {/* Scroll Indicator */}
      {!isAutoScrolling && (
        <View style={styles.scrollIndicator}>
          <Text style={styles.scrollIndicatorText}>
            👆 Swipe to browse • Auto-scroll resumes in 3s
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    backgroundColor: '#0A0E27',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  gameCard: {
    width: 180,
    marginHorizontal: 8,
    padding: 10,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  league: {
    color: '#00FF9F',
    fontSize: 12,
    fontWeight: '700',
  },
  time: {
    color: '#718096',
    fontSize: 11,
  },
  matchup: {
    gap: 4,
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  at: {
    color: '#718096',
    fontSize: 10,
  },
  odds: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  oddsPositive: {
    color: '#00FF9F',
  },
  oddsNegative: {
    color: '#FF6B6B',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 4,
  },
  scrollIndicatorText: {
    fontSize: 10,
    color: '#8892A6',
  },
});
