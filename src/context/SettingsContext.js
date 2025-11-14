import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const OPENAI_KEY = 'MARBLE_OPENAI_KEY';

const SettingsContext = createContext(null);

async function readSecret(key) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn('Failed to read secure item', key, error);
    return null;
  }
}

async function writeSecret(key, value) {
  try {
    if (!value) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.warn('Failed to write secure item', key, error);
  }
}

export const SettingsProvider = ({ children }) => {
  const [openAiKey, setOpenAiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      const storedKey = await readSecret(OPENAI_KEY);
      if (mounted && storedKey) {
        setOpenAiKey(storedKey);
      }
      if (mounted) {
        setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const updateOpenAiKey = useCallback(async (key) => {
    setOpenAiKey(key);
    await writeSecret(OPENAI_KEY, key);
  }, []);

  const value = useMemo(
    () => ({
      openAiKey,
      isLoading,
      updateOpenAiKey,
    }),
    [openAiKey, isLoading, updateOpenAiKey],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider.');
  }
  return context;
};
