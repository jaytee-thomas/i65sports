interface TrendingScore {
  takeId: string;
  score: number;
  reactionVelocity: number;
  totalReactions: number;
}

interface Reaction {
  timestamp: Date;
  emoji: string;
}

export class TrendingCalculator {
  // Calculate reaction velocity (reactions per minute)
  static calculateVelocity(reactions: Reaction[], timeWindowMinutes: number = 5): number {
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeWindowMinutes * 60 * 1000);
    
    const recentReactions = reactions.filter(
      (r) => new Date(r.timestamp) > cutoff
    );
    
    return recentReactions.length / timeWindowMinutes;
  }

  // Calculate trending score
  static calculateTrendingScore(
    totalReactions: number,
    reactionVelocity: number,
    ageMinutes: number
  ): number {
    // Decay factor: older content gets lower scores
    const decayFactor = Math.exp(-ageMinutes / 60); // Decay over 1 hour
    
    // Velocity weight: reactions per minute are important
    const velocityScore = reactionVelocity * 10;
    
    // Total engagement: but don't let old viral content stay forever
    const engagementScore = Math.log(totalReactions + 1) * 5;
    
    // Combined score
    return (velocityScore + engagementScore) * decayFactor;
  }

  // Determine if content is trending
  static isTrending(score: number): boolean {
    return score > 10; // Threshold for "🔥 TRENDING" badge
  }

  // Get trending status label
  static getTrendingLabel(velocity: number): string {
    if (velocity > 20) return '🔥 ON FIRE';
    if (velocity > 10) return '🔥 TRENDING';
    if (velocity > 5) return '📈 Rising';
    return '';
  }
}

