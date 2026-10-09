import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleType } from '../types/auth';
import { apiRequest } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role: RoleType) => Promise<{ success: boolean; error?: string }>;
  switchRole: (role: RoleType) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  demoLogin: (role: RoleType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'creatoros_access_token';
const USER_KEY = 'creatoros_user_cache';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem(USER_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync token into fetch headers / local storage
  const saveSession = (authToken: string, authUser: User) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  // Check current session validity on mount
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiRequest<{ user: User }>('/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (response.success && response.data) {
          setUser(response.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        } else {
          clearSession();
        }
      } catch {
        // Keep offline cache if offline
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await apiRequest<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setIsLoading(false);

    if (res.success && res.data) {
      saveSession(res.data.accessToken, res.data.user);
      return { success: true };
    }

    return {
      success: false,
      error: res.error?.message || 'Login failed. Please check your credentials.',
    };
  };

  const register = async (email: string, password: string, name: string, role: RoleType) => {
    setIsLoading(true);
    const res = await apiRequest<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
    setIsLoading(false);

    if (res.success && res.data) {
      saveSession(res.data.accessToken, res.data.user);
      return { success: true };
    }

    return {
      success: false,
      error: res.error?.message || 'Registration failed. Please try again.',
    };
  };

  const switchRole = async (targetRole: RoleType) => {
    if (!token) return { success: false, error: 'Not authenticated' };

    const res = await apiRequest<{ activeRole: RoleType; accessToken: string; user: User }>('/auth/switch-role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: targetRole }),
    });

    if (res.success && res.data) {
      saveSession(res.data.accessToken, res.data.user);
      return { success: true };
    }

    return { success: false, error: res.error?.message || 'Failed to switch role' };
  };

  const logout = () => {
    if (token) {
      apiRequest('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    clearSession();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  // Demo account instant login for zero-friction evaluation
  const demoLogin = (role: RoleType) => {
    const demoUser: User = {
      id: `demo_${role.toLowerCase()}_101`,
      email: `demo.${role.toLowerCase()}@creatoros.io`,
      name: role === 'BRAND' ? 'Nexus Tech Labs' : role === 'CREATOR' ? 'Alex Rivera (Tech Reviews)' : 'Admin Operator',
      status: 'ACTIVE',
      roles: ['BRAND', 'CREATOR', 'ADMIN'],
      activeRole: role,
      brandProfile: {
        id: 'bp_demo_1',
        userId: `demo_${role.toLowerCase()}_101`,
        companyName: 'Nexus Tech Labs',
        industry: 'Consumer Electronics & SaaS',
        websiteUrl: 'https://nexustechlabs.io',
        description: 'Next-generation creator productivity hardware and developer tools.',
      },
      creatorProfile: {
        id: 'cp_demo_1',
        userId: `demo_${role.toLowerCase()}_101`,
        handle: 'alexrivera_tech',
        bio: 'In-depth tech breakdowns, developer productivity, and consumer hardware testing. 250K+ combined audience.',
        location: 'San Francisco, CA',
        categories: ['Technology', 'Software', 'Gadgets'],
        skills: ['4K Video Production', 'Benchmark Testing', 'Shorts/Reels'],
        tools: ['Final Cut Pro', 'DaVinci Resolve', 'Sony A7S III'],
        contentTypes: ['Long-form Review', 'Dedicated Video', 'Product Integration'],
        isVerified: true,
      },
      creditWallet: {
        balance: role === 'BRAND' ? 12500 : 2850,
        reservedBalance: role === 'BRAND' ? 4000 : 0,
      },
    };

    saveSession('mock_jwt_demo_token_creatoros', demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        switchRole,
        logout,
        updateUser,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
