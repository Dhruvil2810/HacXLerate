export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  scope?: string | null;
}

export interface NormalizedChannelProfile {
  platformAccountId: string;
  title: string;
  description?: string | null;
  customUrl?: string | null;
  avatarUrl?: string | null;
  subscriberCount: number;
  totalViews: number;
  videoCount: number;
  publishedAt?: Date | null;
}

export interface NormalizedVideoItem {
  videoId: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  duration?: string | null;
  categoryId?: string | null;
  tags?: string[];
  views: number;
  likes: number;
  comments: number;
  publishedAt: Date;
}

export interface NormalizedAnalyticsSnapshot {
  snapshotDate: Date;
  views: number;
  incrementalViews: number;
  watchTimeMinutes: number;
  avgDurationSeconds: number;
  avgViewPercentage?: number;
  likes: number;
  comments: number;
  shares: number;
  subscribersGained: number;
  subscribersLost: number;
  sourceType: 'PLATFORM_VERIFIED' | 'UPLOADED' | 'SELF_REPORTED';
}

export interface NormalizedAudienceDemographics {
  geography: Record<string, number>; // Country code -> percentage
  ageGroups: Record<string, number>; // Age group -> percentage
  gender: {
    male: number;
    female: number;
    other: number;
  };
}

export interface ISocialPlatformConnector {
  platform: 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK';
  generateAuthUrl(state: string): string;
  exchangeCodeForTokens(code: string): Promise<OAuthTokens>;
  refreshTokens(refreshToken: string): Promise<OAuthTokens>;
  getChannelProfile(tokens: OAuthTokens): Promise<NormalizedChannelProfile>;
  getPublishedVideos(tokens: OAuthTokens, maxResults?: number): Promise<NormalizedVideoItem[]>;
  getAnalyticsSnapshots(tokens: OAuthTokens, startDate?: Date, endDate?: Date): Promise<NormalizedAnalyticsSnapshot[]>;
  getAudienceDemographics(tokens: OAuthTokens): Promise<NormalizedAudienceDemographics>;
}
