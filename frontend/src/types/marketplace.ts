export interface Product {
  id: string;
  brandId: string;
  name: string;
  description: string;
  category: string;
  websiteUrl?: string | null;
  productUrl?: string | null;
  usp?: string | null;
  features?: string[];
  pricingDetails?: string | null;
  targetAudience?: string | null;
  createdAt: string;
  _count?: {
    campaigns: number;
  };
}

export interface Campaign {
  id: string;
  brandId: string;
  productId?: string | null;
  title: string;
  objective: string;
  description: string;
  budgetCredits: number;
  allocatedCredits: number;
  spentCredits: number;
  rewardModel: 'CPM' | 'CPE' | 'CLICK' | 'CONVERSION' | 'HYBRID';
  cpmRate: number;
  status: 'DRAFT' | 'PUBLISHED' | 'APPLICATIONS_OPEN' | 'IN_PROGRESS' | 'CONTENT_REVIEW' | 'LIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  targetAudience?: string | null;
  contentPlatform: 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK';
  contentType?: string | null;
  creatorCategories: string[];
  requiredSkills: string[];
  contentRequirements?: string | null;
  prohibitedContent?: string | null;
  ctaUrl?: string | null;
  hashtags: string[];
  createdAt: string;
  brand?: {
    companyName: string;
    logoUrl?: string | null;
    industry?: string | null;
  };
  product?: {
    id: string;
    name: string;
    category: string;
  } | null;
  _count?: {
    applications: number;
    creators: number;
  };
}

export interface CreatorCard {
  id: string;
  userId: string;
  handle: string;
  bio?: string | null;
  location?: string | null;
  categories: string[];
  skills: string[];
  isVerified: boolean;
  user: {
    name: string;
    avatarUrl?: string | null;
  };
  socialAccounts?: {
    platform: string;
    accountName: string;
    verificationStatus: 'VERIFIED' | 'UPLOADED' | 'SELF_REPORTED';
    youtubeChannel?: {
      subscriberCount: number | string;
      totalViews: number | string;
      videoCount: number;
    };
  }[];
  portfolioItems?: {
    id: string;
    title: string;
    mediaUrl: string;
    category?: string | null;
  }[];
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export interface ConversationItem {
  conversationId: string;
  campaign?: {
    id: string;
    title: string;
  } | null;
  participants: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    email: string;
  }[];
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}
