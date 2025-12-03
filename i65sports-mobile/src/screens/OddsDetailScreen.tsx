import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

interface Game {
  id: string;
  league: string;
  time: string;
  team1: string;
  team1Odds: string;
  team2: string;
  team2Odds: string;
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
  const { game } = route.params as { game: Game };

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Game not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const openBookmaker = (bookmakerName: string) => {
    const url = BOOKMAKER_LINKS[bookmakerName.toLowerCase()] || 'https://www.google.com';
    Linking.openURL(url);
  };

  const isPositiveOdds = (odds: string) => odds.includes('+');

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* League Badge */}
        <View style={styles.leagueBadge}>
          <Text style={styles.leagueText}>{game.league}</Text>
        </View>

        {/* Matchup Section */}
        <View style={styles.matchupSection}>
          <Text style={styles.gameTime}>{game.time}</Text>
          
          <View style={styles.matchup}>
            <View style={styles.teamContainer}>
              <Text style={styles.teamName}>{game.team1}</Text>
              <View style={[
                styles.oddsBadge,
                isPositiveOdds(game.team1Odds) ? styles.oddsBadgePositive : styles.oddsBadgeNegative
              ]}>
                <Text style={styles.oddsText}>{game.team1Odds}</Text>
              </View>
            </View>

            <Text style={styles.vsText}>VS</Text>

            <View style={styles.teamContainer}>
              <Text style={styles.teamName}>{game.team2}</Text>
              <View style={[
                styles.oddsBadge,
                isPositiveOdds(game.team2Odds) ? styles.oddsBadgePositive : styles.oddsBadgeNegative
              ]}>
                <Text style={styles.oddsText}>{game.team2Odds}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Betting Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="trophy" size={24} color="#00FF9F" />
            <Text style={styles.infoTitle}>Moneyline Odds</Text>
            <Text style={styles.infoText}>
              Bet on which team will win the game outright
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#00A8E8" />
            <Text style={styles.infoTitle}>How to Read Odds</Text>
            <Text style={styles.infoText}>
              <Text style={{ color: '#00FF9F' }}>+ (Positive)</Text>: Amount you win on $100 bet{'\n'}
              <Text style={{ color: '#FF6B6B' }}>- (Negative)</Text>: Amount to bet to win $100
            </Text>
          </View>
        </View>

        {/* Sportsbooks */}
        <View style={styles.bookmakerSection}>
          <Text style={styles.sectionTitle}>Place Your Bet</Text>
          <Text style={styles.sectionSubtitle}>Tap any sportsbook to get started</Text>

          {Object.entries(BOOKMAKER_LINKS).map(([key, url]) => (
            <TouchableOpacity
              key={key}
              style={styles.bookmakerCard}
              onPress={() => openBookmaker(key)}
            >
              <View style={styles.bookmakerInfo}>
                <Ionicons name="basketball" size={24} color="#00FF9F" />
                <Text style={styles.bookmakerName}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#8892A6" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <Ionicons name="alert-circle" size={20} color="#FFB800" />
          <Text style={styles.disclaimer}>
            Must be 21+ to bet. Gambling problem? Call 1-800-GAMBLER. Only available in eligible states.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#00FF9F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#0A0E27',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leagueBadge: {
    alignSelf: 'center',
    backgroundColor: '#00FF9F',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
  },
  leagueText: {
    color: '#0A0E27',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  matchupSection: {
    padding: 20,
    alignItems: 'center',
  },
  gameTime: {
    color: '#B8C5D6',
    fontSize: 16,
    marginBottom: 24,
    fontWeight: '600',
  },
  matchup: {
    width: '100%',
    gap: 20,
  },
  teamContainer: {
    backgroundColor: '#1A1F3A',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  oddsBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  oddsBadgePositive: {
    backgroundColor: 'rgba(0, 255, 159, 0.2)',
  },
  oddsBadgeNegative: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  oddsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  vsText: {
    color: '#8892A6',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  infoText: {
    color: '#B8C5D6',
    fontSize: 14,
    lineHeight: 20,
  },
  bookmakerSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#8892A6',
    fontSize: 14,
    marginBottom: 16,
  },
  bookmakerCard: {
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  bookmakerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookmakerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  disclaimer: {
    flex: 1,
    color: '#FFB800',
    fontSize: 12,
    lineHeight: 18,
  },
});
