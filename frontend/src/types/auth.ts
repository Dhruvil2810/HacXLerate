export type RoleType = 'BRAND' | 'CREATOR' | 'ADMIN';

export interface BrandProfile {
  id: string;
  userId: string;
  companyName: string;
  industry?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
  logoUrl?: string | null;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  handle: string;
  bio?: string | null;
  location?: string | null;
  categories: string[];
  skills: string[];
  tools: string[];
  contentTypes: string[];
  isVerified: boolean;
}

export interface CreditWallet {
  balance: number;
  reservedBalance: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  status: string;
  roles: RoleType[];
  activeRole: RoleType;
  brandProfile?: BrandProfile | null;
  creatorProfile?: CreatorProfile | null;
  creditWallet?: CreditWallet | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
