import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CREDENTIALS_KEY = 'MARBLE_GOOGLE_CREDENTIALS';
const USER_KEY = 'MARBLE_PROFILE';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';

const AuthContext = createContext(null);

async function readSecureItemAsync(key) {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn('Unable to read secure item', key, error);
    return null;
  }
}

async function writeSecureItemAsync(key, value) {
  try {
    if (value === null || value === undefined) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
    }
  } catch (error) {
    console.warn('Unable to write secure item', key, error);
  }
}

export const AuthProvider = ({ children }) => {
  const [credentials, setCredentials] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const storedCredentials = await readSecureItemAsync(CREDENTIALS_KEY);
        const storedUser = await readSecureItemAsync(USER_KEY);
        if (mounted) {
          setCredentials(storedCredentials);
          setUser(storedUser);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const persistCredentials = useCallback(
    async (nextCredentials) => {
      const merged = nextCredentials ? { ...(credentials || {}), ...nextCredentials } : null;
      setCredentials(merged);
      await writeSecureItemAsync(CREDENTIALS_KEY, merged);
    },
    [credentials],
  );

  const persistUser = useCallback(async (nextUser) => {
    setUser(nextUser);
    await writeSecureItemAsync(USER_KEY, nextUser);
  }, []);

  const signOut = useCallback(async () => {
    const token = credentials?.accessToken;
    setCredentials(null);
    setUser(null);
    await Promise.all([
      writeSecureItemAsync(CREDENTIALS_KEY, null),
      writeSecureItemAsync(USER_KEY, null),
    ]);

    if (token) {
      try {
        await fetch(`${GOOGLE_REVOKE_ENDPOINT}?token=${token}`, { method: 'POST' });
      } catch (error) {
        console.warn('Failed to revoke Google token', error);
      }
    }
  }, [credentials]);

  const ensureValidToken = useCallback(async () => {
    if (!credentials?.accessToken) {
      return null;
    }

    const buffer = 60 * 1000;
    const now = Date.now();
    if (credentials.expiresAt && credentials.expiresAt - buffer > now) {
      return credentials.accessToken;
    }

    if (!credentials.refreshToken) {
      await signOut();
      return null;
    }

    if (!clientId) {
      throw new Error('Missing Google OAuth client id.');
    }

    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: credentials.refreshToken,
    });

    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      await signOut();
      throw new Error('Unable to refresh Google credentials.');
    }

    const refreshed = await response.json();
    const expiresAt = Date.now() + (refreshed.expires_in ? refreshed.expires_in * 1000 : 0);
    const nextCredentials = {
      ...credentials,
      accessToken: refreshed.access_token,
      expiresAt,
    };
    await persistCredentials(nextCredentials);
    return nextCredentials.accessToken;
  }, [clientId, credentials, persistCredentials, signOut]);

  const value = useMemo(
    () => ({
      clientId,
      credentials,
      user,
      isLoading,
      ensureValidToken,
      persistCredentials,
      persistUser,
      signOut,
    }),
    [clientId, credentials, ensureValidToken, isLoading, persistCredentials, persistUser, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
};

export function buildRedirectUri() {
  if (Platform.OS === 'web') {
    return `${window.location.origin}/`; // expo web fallback
  }
  return `marble://auth`;
}
