import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  FirebaseUser,
} from '../config/firebase';
import { authApi } from '../api';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  coins: number;
  reservedCoins: number;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  devLogin: (email: string, name?: string, role?: 'user' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync with MongoDB backend
  const syncWithBackend = useCallback(async (uid: string, email: string, name?: string, avatar?: string) => {
    try {
      const syncRes = await authApi.syncUser({ uid, email, name, avatar });
      if (syncRes.success && syncRes.data.user) {
        setUserProfile(syncRes.data.user);
      }
    } catch (err) {
      console.warn('[Auth Sync Warning]', err);
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    try {
      const meRes = await authApi.getMe();
      if (meRes.success && meRes.data.user) {
        setUserProfile(meRes.data.user);
      }
    } catch (err) {
      console.warn('[Refresh Profile Error]', err);
    }
  }, []);

  // Firebase auth state observer
  useEffect(() => {
    // Check if dev or admin token exists first
    const devToken = localStorage.getItem('sub4you_dev_token');
    const devUserJson = localStorage.getItem('sub4you_dev_user');
    const adminKey = localStorage.getItem('sub4you_admin_key');

    if (devToken && devUserJson) {
      try {
        const parsed = JSON.parse(devUserJson);
        setUserProfile(parsed);
        // Also refresh from backend
        authApi.getMe().then((res) => {
          if (res.success && res.data.user) setUserProfile(res.data.user);
        }).catch(() => {});
        setIsLoading(false);
      } catch (e) {
        localStorage.removeItem('sub4you_dev_token');
        localStorage.removeItem('sub4you_dev_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // If an active admin session key is active, do not override with non-admin Google user
        if (adminKey && (!user.email || user.email.toLowerCase() !== 'ravinder.explore@gmail.com')) {
          setIsLoading(false);
          return;
        }

        if (!adminKey) {
          localStorage.removeItem('sub4you_dev_token');
          localStorage.removeItem('sub4you_dev_user');
        }

        await syncWithBackend(
          user.uid,
          user.email || '',
          user.displayName || user.email?.split('@')[0] || 'Creator',
          user.photoURL || undefined
        );
      } else if (!localStorage.getItem('sub4you_dev_token') && !adminKey) {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [syncWithBackend]);

  // Signup
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await syncWithBackend(cred.user.uid, email, name);
    } catch (error: any) {
      // If Firebase credentials are demo, fall back to devLogin automatically
      if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key' || error.message?.includes('API key')) {
        console.warn('Firebase API key invalid. Falling back to local development authentication...');
        await devLogin(email, name, email.includes('admin') ? 'admin' : 'user');
        return;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await syncWithBackend(cred.user.uid, email);
    } catch (error: any) {
      if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key' || error.message?.includes('API key')) {
        console.warn('Firebase API key invalid. Falling back to local development authentication...');
        await devLogin(email, email.split('@')[0], email.includes('admin') ? 'admin' : 'user');
        return;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await syncWithBackend(
        cred.user.uid,
        cred.user.email || '',
        cred.user.displayName || 'Google Creator',
        cred.user.photoURL || undefined
      );
    } catch (error: any) {
      if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key' || error.message?.includes('API key')) {
        await devLogin('google_creator@sub4you.com', 'Google Creator', 'user');
        return;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Dev Instant Login (Zero config testing)
  const devLogin = async (email: string, name?: string, role: 'user' | 'admin' = 'user') => {
    setIsLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const mockUid = `uid_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const mockToken = `dev_token.${btoa(JSON.stringify({ uid: mockUid, email: cleanEmail, name: name || cleanEmail.split('@')[0], role }))}.signature`;
      
      localStorage.setItem('sub4you_dev_token', mockToken);
      
      const syncRes = await authApi.syncUser({
        uid: mockUid,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
      });

      if (syncRes.success && syncRes.data.user) {
        setUserProfile(syncRes.data.user);
        localStorage.setItem('sub4you_dev_user', JSON.stringify(syncRes.data.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    localStorage.removeItem('sub4you_dev_token');
    localStorage.removeItem('sub4you_dev_user');
    localStorage.removeItem('sub4you_admin_key');
    setUserProfile(null);
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch (err) {
      // ignore
    }
  };

  // Password reset
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
        // Simulated success for demo
        return;
      }
      throw error;
    }
  };

  const isAdmin =
    userProfile?.role === 'admin' ||
    userProfile?.email?.toLowerCase() === 'ravinder.explore@gmail.com' ||
    localStorage.getItem('sub4you_admin_key') === '9991141758';
  const coins = userProfile?.coins ?? 0;
  const reservedCoins = userProfile?.reservedCoins ?? 0;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isLoading,
        isAdmin,
        coins,
        reservedCoins,
        signup,
        login,
        loginWithGoogle,
        devLogin,
        logout,
        resetPassword,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
