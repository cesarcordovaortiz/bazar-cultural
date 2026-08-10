import { useCallback, useSyncExternalStore } from 'react';
import type { UserProfile } from '../../types';

const TOKEN_KEY = 'bazar_auth_token';
const PROFILE_KEY = 'bazar_user_profile';
const AUTH_EVENT = 'bazar-auth-changed';
let cachedProfile: UserProfile | null = null;
let cachedProfileValue: string | null = null;

function getProfile(): UserProfile | null {
  const value = localStorage.getItem(PROFILE_KEY);
  if (value === cachedProfileValue) return cachedProfile;
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as UserProfile;
    cachedProfile = { ...parsed, roles: parsed.roles?.length ? parsed.roles : ['customer'] };
    cachedProfileValue = value;
    return cachedProfile;
  } catch {
    localStorage.removeItem(PROFILE_KEY);
    cachedProfile = null;
    cachedProfileValue = null;
    return null;
  }
}

function subscribe(callback: () => void): () => void {
  const listener = (): void => callback();
  window.addEventListener(AUTH_EVENT, listener);
  window.addEventListener('storage', listener);
  return (): void => {
    window.removeEventListener(AUTH_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

function snapshot(): UserProfile | null {
  return getProfile();
}

function notify(): void {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, snapshot, () => null);

  const login = useCallback((profile: UserProfile): void => {
    localStorage.setItem(TOKEN_KEY, 'mock-token');
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    notify();
  }, []);

  const updateProfile = useCallback((profile: UserProfile): void => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    notify();
  }, []);

  const logout = useCallback((): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    notify();
  }, []);

  return { isAuthenticated: Boolean(localStorage.getItem(TOKEN_KEY)), login, logout, updateProfile, user };
}
