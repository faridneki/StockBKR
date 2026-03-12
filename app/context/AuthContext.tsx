"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, logoutUser, logoutAllDevices, getSessionCount } from '@/lib/auth';
import { loginUser } from '@/lib/auth';
import { toast } from 'react-toastify';

interface User {
  id: number;
  email: string;
  nom: string | null;
  prenom: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sessionCount: number;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshSessionCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await getSession();
      setUser(session);
      if (session) {
        const count = await getSessionCount();
        setSessionCount(count);
      }
    } catch (error) {
      setUser(null);
      setSessionCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSessionCount = async () => {
    if (user) {
      const count = await getSessionCount();
      setSessionCount(count);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      let ipAddress = 'unknown';
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ipAddress = data.ip;
      } catch (e) {
        console.error('Impossible de récupérer IP:', e);
      }

      const result = await loginUser(email, password, ipAddress);
      
      if (result.success && result.user) {
        setUser(result.user);
        const count = await getSessionCount();
        setSessionCount(count);
        toast.success('Connexion réussie');
      } else {
        toast.error(result.error || 'Erreur de connexion');
      }
      
      return result;
    } catch (error) {
      console.error('Erreur login:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setSessionCount(0);
    toast.info('Déconnexion réussie');
    router.push('/login');
  };

  const logoutAll = async () => {
    await logoutAllDevices();
    setUser(null);
    setSessionCount(0);
    toast.info('Déconnecté de tous les appareils');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      sessionCount,
      login, 
      logout, 
      logoutAllDevices: logoutAll, 
      checkAuth,
      refreshSessionCount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}