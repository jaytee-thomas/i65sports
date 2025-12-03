import { useState, useEffect } from 'react';
import { TrendingCalculator } from '../utils/trendingAlgorithm';

interface HotTake {
  id: string;
  createdAt: string;
  reactions?: Array<{ timestamp: Date; emoji: string }>;
}

export const useTrendingDetection = (hotTakes: HotTake[]) => {
  const [trendingTakes, setTrendingTakes] = useState<
    Array<{ takeId: string; score: number; label: string; velocity: number }>
  >([]);

  useEffect(() => {
    const calculateTrending = () => {
      const scored = hotTakes.map((take) => {
        const reactions = take.reactions || [];
        const ageMinutes =
          (Date.now() - new Date(take.createdAt).getTime()) / 60000;
        
        const velocity = TrendingCalculator.calculateVelocity(reactions);
        const score = TrendingCalculator.calculateTrendingScore(
          reactions.length,
          velocity,
          ageMinutes
        );
        
        return {
          takeId: take.id,
          score,
          velocity,
          label: TrendingCalculator.getTrendingLabel(velocity),
        };
      });

      // Sort by score and get top trending
      const trending = scored
        .filter((s) => TrendingCalculator.isTrending(s.score))
        .sort((a, b) => b.score - a.score);

      setTrendingTakes(trending);
    };

    calculateTrending();
    
    // Recalculate every 30 seconds
    const interval = setInterval(calculateTrending, 30000);
    
    return () => clearInterval(interval);
  }, [hotTakes]);

  return trendingTakes;
};

