'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, UserProfileData, API_BASE_URL } from '@/lib/api';

interface UserContextType {
  user: UserProfileData | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfileData | null>>;
  getAvatarUrl: () => string | null;
  getDisplayName: () => string;
  getInitials: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pre-load user from localStorage cache for instant first render (avoids flash of "Loading...")
  const getCachedUser = (): UserProfileData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('user');
      return cached ? (JSON.parse(cached) as UserProfileData) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState<UserProfileData | null>(getCachedUser);
  // Start loading=false if no token exists (e.g. login page) — avoids blocking render
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem('auth_token'));
  });
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentUser();
      setUser(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only call the API when an auth token is present.
    // Without this guard, the login page triggered a pointless GET /api/users/me
    // that waited for the Supabase-backed backend to respond (5-10s cold start).
    if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
      fetchUser();
    }
  }, []);

  const getAvatarUrl = (): string | null => {
    if (!user || !user.avatar_url) return null;
    if (
      user.avatar_url.startsWith('http://') ||
      user.avatar_url.startsWith('https://') ||
      user.avatar_url.startsWith('data:')
    ) {
      return user.avatar_url;
    }
    return `${API_BASE_URL}${user.avatar_url.startsWith('/') ? '' : '/'}${user.avatar_url}`;
  };

  const getDisplayName = (): string => {
    if (!user) return 'Muthu Ram';
    if (user.full_name && user.full_name.trim()) return user.full_name;
    if (user.username && user.username.trim()) return user.username;
    return 'Muthu Ram';
  };

  const getInitials = (): string => {
    const name = getDisplayName();
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        refreshUser: fetchUser,
        setUser,
        getAvatarUrl,
        getDisplayName,
        getInitials,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
