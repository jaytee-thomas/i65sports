import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';

const API_URL = 'http://192.168.86.226:3000/api';

interface Outcome {
  name: string;
  price: number;
  point?: number;
}

interface Market {
  key: string;
  outcomes: Outcome[];
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface Game {
  id: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

const BOOKMAKER_LINKS: { [key: string]: string } = {
  draftkings: 'https://sportsbook.draftkings.com',
  fanduel: 'https://sportsbook.fanduel.com',
  betmgm: 'https://sports.betmgm.com',
  caesars: 'https://www.caesars.com/sportsbook',
  pointsbet: 'https://pointsbet.com',
  bovada: 'https://www.bovada.lv',
};

export default function OddsDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { gameId } = route.params as { gameId: string };
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<'h2h' | 'spreads' | 'totals'>('h2h');

  useEffect(() => {
    fetchGameDetails();
  }, []);

  const fetchGameDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/odds`);
      const foundGame = response.data.games.find((g: Game) => g.id === gameId);
      setGame(foundGame);
    } catch (error) {
      console.error('Error fetching game details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const openBookmaker = (bookmakerKey: string) => {
    const url = BOOKMAKER_LINKS[bookmakerKey] || 'https://google.com';
    Linking.openURL(url);
  };

  const getMarketOdds = (bookmaker: Bookmaker, team: string) => {
    const market = bookmaker.markets.find(m => m.key === selectedMarket);
    if (!market) return null;
    const outcome = market.outcomes.find(o => o.name === team);
    return outcome;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF9F" />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Game not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Matchup */}
        <View style={styles.matchupSection}>
          <Text style={styles.gameTime}>{formatDate(game.commence_time)}</Text>
          
          <View style={styles.teams}>
            <View style={styles.teamRow}>
              <Text style={styles.teamName}>{game.away_team}</Text>
              <Text style={styles.atSymbol}>@</Text>
            </View>
            <View style={styles.teamRow}>
              <Text style={styles.teamName}>{game.home_team}</Text>
            </View>
          </View>
        </View>

        {/* Market Selector */}
        <View style={styles.marketSelector}>
          <TouchableOpacity
            style={[styles.marketButton, selectedMarket === 'h2h' && styles.marketButtonActive]}
            onPress={() => setSelectedMarket('h2h')}
          >
            <Text style={[styles.marketButtonText, selectedMarket === 'h2h' && styles.marketButtonTextActive]}>
              Moneyline
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.marketButton, selectedMarket === 'spreads' && styles.marketButtonActive]}
            onPress={() => setSelectedMarket('spreads')}
          >
            <Text style={[styles.marketButtonText, selectedMarket === 'spreads' && styles.marketButtonTextActive]}>
              Spread
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.marketButton, selectedMarket === 'totals' && styles.marketButtonActive]}
            onPress={() => setSelectedMarket('totals')}
          >
            <Text style={[styles.marketButtonText, selectedMarket === 'totals' && styles.marketButtonTextActive]}>
              Total
            </Text>
          </TouchableOpacity>
        </View>

        {/* Odds Comparison */}
        <View style={styles.oddsSection}>
          <View style={styles.oddsHeader}>
            <Text style={styles.oddsHeaderText}>Sportsbook</Text>
            <Text style={styles.oddsHeaderText}>{game.away_team}</Text>
            <Text style={styles.oddsHeaderText}>{game.home_team}</Text>
          </View>

          {game.bookmakers.map((bookmaker) => {
            const awayOutcome = getMarketOdds(bookmaker, game.away_team);
            const homeOutcome = getMarketOdds(bookmaker, game.home_team);
            if (!awayOutcome || !homeOutcome) return null;

            return (
              <TouchableOpacity
                key={bookmaker.key}
                style={styles.oddsRow}
                onPress={() => openBookmaker(bookmaker.key)}
              >
                <View style={styles.bookmakerCell}>
                  <Text style={styles.bookmakerName}>{bookmaker.title}</Text>
                </View>
                
                <View style={styles.oddsCell}>
                  {selectedMarket === 'spreads' && awayOutcome.point !== undefined && (
                    <Text style={styles.pointSpread}>
                      {awayOutcome.point > 0 ? '+' : ''}{awayOutcome.point}
                    </Text>
                  )}
                  <Text style={[styles.oddsValue, awayOutcome.price > 0 && styles.oddsPositive]}>
                    {formatOdds(awayOutcome.price)}
                  </Text>
                </View>

                <View style={styles.oddsCell}>
                  {selectedMarket === 'spreads' && homeOutcome.point !== undefined && (
                    <Text style={styles.pointSpread}>
                      {homeOutcome.point > 0 ? '+' : ''}{homeOutcome.point}
                    </Text>
                  )}
                  <Text style={[styles.oddsValue, homeOutcome.price > 0 && styles.oddsPositive]}>
                    {formatOdds(homeOutcome.price)}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#8892A6" />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.disclaimer}>
          Tap any sportsbook to place your bet. Must be 21+ and in eligible states.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
  },
  backButton: {
    marginRight: 16,
  },
  sportLabel: {
    color: '#00FF9F',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  matchupSection: {
    padding: 20,
    alignItems: 'center',
  },
  gameTime: {
    color: '#B8C5D6',
    fontSize: 14,
    marginBottom: 20,
  },
  teams: {
    width: '100%',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  atSymbol: {
    color: '#8892A6',
    fontSize: 18,
    marginHorizontal: 12,
  },
  marketSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  marketButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1A1F3A',
    borderWidth: 1,
    borderColor: '#3A4166',
    alignItems: 'center',
  },
  marketButtonActive: {
    backgroundColor: '#00FF9F',
    borderColor: '#00FF9F',
  },
  marketButtonText: {
    color: '#B8C5D6',
    fontSize: 14,
    fontWeight: '600',
  },
  marketButtonTextActive: {
    color: '#0A0E27',
    fontWeight: 'bold',
  },
  oddsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  oddsHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
    marginBottom: 8,
  },
  oddsHeaderText: {
    flex: 1,
    color: '#8892A6',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  oddsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#1A1F3A',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  bookmakerCell: {
    flex: 1,
  },
  bookmakerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  oddsCell: {
    flex: 1,
    alignItems: 'center',
  },
  pointSpread: {
    color: '#B8C5D6',
    fontSize: 12,
    marginBottom: 4,
  },
  oddsValue: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  oddsPositive: {
    color: '#00FF9F',
  },
  disclaimer: {
    color: '#8892A6',
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    lineHeight: 16,
  },
});

