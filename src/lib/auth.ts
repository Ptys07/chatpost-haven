
import { create } from 'zustand';
import { User } from './storage';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  isAuthenticated: false,
}));

// Set up session persistence
const SESSION_KEY = 'user_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const initializeAuth = () => {
  const session = localStorage.getItem(SESSION_KEY);
  if (session) {
    const { user, expiresAt } = JSON.parse(session);
    if (new Date().getTime() < expiresAt) {
      useAuth.getState().setUser(user);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }
};

export const persistSession = (user: User) => {
  const session = {
    user,
    expiresAt: new Date().getTime() + SESSION_DURATION,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  useAuth.getState().setUser(null);
};
