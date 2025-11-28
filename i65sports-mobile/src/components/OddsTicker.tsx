import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const API_URL = 'http://192.168.86.226:3000/api';

interface Game {
  id: string;
  sport_title: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers: any[];
}

export default function OddsTicker() {
  const navigation = useNavigation();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
    // Refresh every 5 minutes
    const interval = setInterval(fetchGames, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get(`${API_URL}/odds`, {
        timeout: 15000 // 15 second timeout
      });
      setGames(response.data.games.slice(0, 10)); // Top 10 upcoming games
    } catch (error) {
      console.error('Error fetching odds:', error);
      // Silently fail - don't break the app if odds fail
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMoneyline = (game: Game, team: string) => {
    if (!game.bookmakers || game.bookmakers.length === 0) return null;
    
    const book = game.bookmakers[0]; // Use first bookmaker
    const h2hMarket = book.markets?.find((m: any) => m.key === 'h2h');
    const outcome = h2hMarket?.outcomes?.find((o: any) => o.name === team);
    
    if (outcome) {
      return outcome.price > 0 ? `+${outcome.price}` : `${outcome.price}`;
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#00FF9F" />
      </View>
    );
  }

  if (games.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trending-up" size={16} color="#00FF9F" />
        <Text style={styles.headerText}>LIVE ODDS</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {games.map((game) => {
          const awayOdds = getMoneyline(game, game.away_team);
          const homeOdds = getMoneyline(game, game.home_team);
          
          return (
            <TouchableOpacity 
              key={game.id} 
              style={styles.gameCard}
              onPress={() => navigation.navigate('OddsDetail' as never, { gameId: game.id } as never)}
            >
              <Text style={styles.sportLabel}>{game.sport_title}</Text>
              <Text style={styles.time}>{formatTime(game.commence_time)}</Text>
              
              <View style={styles.matchup}>
                <View style={styles.teamRow}>
                  <Text style={styles.teamName} numberOfLines={1}>
                    {game.away_team}
                  </Text>
                  {awayOdds && (
                    <Text style={[styles.odds, awayOdds.startsWith('+') && styles.oddsPositive]}>
                      {awayOdds}
                    </Text>
                  )}
                </View>
                
                <Text style={styles.vs}>@</Text>
                
                <View style={styles.teamRow}>
                  <Text style={styles.teamName} numberOfLines={1}>
                    {game.home_team}
                  </Text>
                  {homeOdds && (
                    <Text style={[styles.odds, homeOdds.startsWith('+') && styles.oddsPositive]}>
                      {homeOdds}
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Add "Tap for more" hint */}
              <View style={styles.tapHint}>
                <Ionicons name="chevron-forward" size={12} color="#8892A6" />
                <Text style={styles.tapHintText}>Tap for all books</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  headerText: {
    color: '#00FF9F',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  gameCard: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  sportLabel: {
    color: '#8892A6',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  time: {
    color: '#B8C5D6',
    fontSize: 11,
    marginBottom: 8,
  },
  matchup: {
    gap: 4,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  vs: {
    color: '#8892A6',
    fontSize: 10,
    textAlign: 'center',
    marginVertical: 2,
  },
  odds: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 45,
    textAlign: 'right',
  },
  oddsPositive: {
    color: '#00FF9F',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#3A4166',
    gap: 4,
  },
  tapHintText: {
    color: '#8892A6',
    fontSize: 10,
  },
});

