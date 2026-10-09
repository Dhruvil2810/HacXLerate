import { env } from '../../config/env.js';

export interface ScoreFactors {
  audienceFitScore: number; // 0 - 100
  contentFitScore: number;  // 0 - 100
  performanceScore: number; // 0 - 100
  engagementScore: number;  // 0 - 100
  historyScore: number;     // 0 - 100
  budgetFitScore: number;   // 0 - 100
}

export interface MatchResult {
  overallScore: number;
  consistencyScore: number;
  factors: ScoreFactors;
  weights: Record<string, number>;
  metrics: {
    averageViews: number;
    medianViews: number;
    stdDev: number;
    coefficientOfVariation: number;
    engagementRatePercent: number;
  };
}

export function calculateDeterministicMatch(
  campaignCategories: string[],
  campaignCpm: number,
  creatorCategories: string[],
  creatorViewsHistory: number[],
  creatorLikesHistory: number[],
  historicalCampaignsCount: number
): MatchResult {
  // 1. Audience & Category Fit (30% default)
  const matchingCategories = campaignCategories.filter((c) =>
    creatorCategories.map((x) => x.toLowerCase()).includes(c.toLowerCase())
  );
  const audienceFitScore = campaignCategories.length > 0
    ? Math.min(100, Math.round((matchingCategories.length / campaignCategories.length) * 100) || 75)
    : 80;

  // 2. Content Format Fit (25% default)
  const contentFitScore = matchingCategories.length > 0 ? 90 : 70;

  // 3. Statistical Performance & Consistency
  const views = creatorViewsHistory.length > 0 ? creatorViewsHistory : [120000, 115000, 130000, 110000, 125000];
  const avgViews = Math.round(views.reduce((a, b) => a + b, 0) / views.length);
  
  const sorted = [...views].sort((a, b) => a - b);
  const medianViews = sorted[Math.floor(sorted.length / 2)];

  // Variance & Standard Deviation
  const variance = views.reduce((acc, v) => acc + Math.pow(v - avgViews, 2), 0) / views.length;
  const stdDev = Math.round(Math.sqrt(variance));
  
  // Coefficient of Variation (CV) = (StdDev / Mean) * 100
  const cv = avgViews > 0 ? Math.round((stdDev / avgViews) * 100) : 25;
  const consistencyScore = Math.max(10, Math.min(100, 100 - cv));

  // Performance score mapped on view volume
  const performanceScore = Math.min(100, Math.max(50, Math.round(avgViews / 2000)));

  // 4. Engagement Rate Score (10% default)
  const totalLikes = creatorLikesHistory.reduce((a, b) => a + b, 0) || Math.round(avgViews * 0.045);
  const engagementRate = avgViews > 0 ? ((totalLikes / views.length) / avgViews) * 100 : 4.5;
  const engagementScore = Math.min(100, Math.round(engagementRate * 20));

  // 5. Historical Campaign Score (10% default)
  const historyScore = Math.min(100, 60 + historicalCampaignsCount * 10);

  // 6. Budget / CPM Fit Score (5% default)
  const budgetFitScore = campaignCpm >= 45 ? 95 : 80;

  const weights = {
    audience: env.MATCH_AUDIENCE_WEIGHT,
    content: env.MATCH_CONTENT_WEIGHT,
    performance: env.MATCH_PERFORMANCE_WEIGHT,
    engagement: env.MATCH_ENGAGEMENT_WEIGHT,
    history: env.MATCH_HISTORY_WEIGHT,
    budget: env.MATCH_BUDGET_WEIGHT,
  };

  const factors: ScoreFactors = {
    audienceFitScore,
    contentFitScore,
    performanceScore,
    engagementScore,
    historyScore,
    budgetFitScore,
  };

  const weightedSum =
    factors.audienceFitScore * weights.audience +
    factors.contentFitScore * weights.content +
    factors.performanceScore * weights.performance +
    factors.engagementScore * weights.engagement +
    factors.historyScore * weights.history +
    factors.budgetFitScore * weights.budget;

  const overallScore = Math.min(99.4, Math.max(40.0, Number(weightedSum.toFixed(1))));

  return {
    overallScore,
    consistencyScore,
    factors,
    weights,
    metrics: {
      averageViews: avgViews,
      medianViews,
      stdDev,
      coefficientOfVariation: cv,
      engagementRatePercent: Number(engagementRate.toFixed(2)),
    },
  };
}
