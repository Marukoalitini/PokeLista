import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  clearActiveSession,
  loadActiveSession,
  loadRegisteredUsers,
  saveActiveSession,
  saveRegisteredUsers,
} from '../services/storage';
import { StoredUserRecord, User } from '../types/pokemon';
import { hashPassword } from '../utils/cryptoUtils';

interface AuthContextData {
  user: User | null;
  isLoadingAuth: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Hydrates persisted session on startup
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const savedSession = await loadActiveSession();
        if (isMounted && savedSession) {
          setUser(savedSession);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password.trim()) {
      throw new Error('Preencha seu e-mail e senha.');
    }

    const users = await loadRegisteredUsers();
    const inputHash = await hashPassword(password);

    const matchedUser = users.find(
      (record) =>
        record.email.toLowerCase() === normalizedEmail &&
        record.passwordHash === inputHash
    );

    if (!matchedUser) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const sessionUser: User = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
    };

    await saveActiveSession(sessionUser);
    setUser(sessionUser);
  };

  const signUp = async (name: string, email: string, password: string): Promise<void> => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail || !password.trim()) {
      throw new Error('Preencha nome, e-mail e senha.');
    }

    if (password.trim().length < 4) {
      throw new Error('A senha deve ter pelo menos 4 caracteres.');
    }

    const users = await loadRegisteredUsers();
    const emailExists = users.some(
      (record) => record.email.toLowerCase() === normalizedEmail
    );

    if (emailExists) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const passwordHash = await hashPassword(password);
    const newRecord: StoredUserRecord = {
      id: `user_${Date.now()}`,
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    };

    const updatedUsers = [...users, newRecord];
    await saveRegisteredUsers(updatedUsers);

    const sessionUser: User = {
      id: newRecord.id,
      name: newRecord.name,
      email: newRecord.email,
    };

    await saveActiveSession(sessionUser);
    setUser(sessionUser);
  };

  const signOut = async (): Promise<void> => {
    await clearActiveSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoadingAuth, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
