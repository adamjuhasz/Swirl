import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import { archiveMessage, fetchMessage, listInboxMessages, parseMessage } from '../utils/gmail';
import { cacheNewsletterAssets, clearNewsletterAssets } from '../utils/cache';
import { classifyWithOpenAI } from '../utils/openai';
import { deleteFileAsync, listFilesAsync, readFileAsync, writeFileAsync } from '../utils/storage';

const NewsletterContext = createContext(null);

const MAX_CACHE_AGE = 1000 * 60 * 60 * 12; // 12 hours

async function loadCachedNewsletter(messageId) {
  const raw = await readFileAsync('messages', `${messageId}.json`);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to parse cached newsletter', messageId, error);
    return null;
  }
}

async function persistNewsletter(record) {
  await writeFileAsync('messages', `${record.id}.json`, JSON.stringify(record));
}

async function bootstrapCache() {
  const files = await listFilesAsync('messages');
  const items = [];
  for (const file of files) {
    if (!file.endsWith('.json')) {
      continue;
    }
    const raw = await readFileAsync('messages', file);
    if (!raw) {
      continue;
    }
    try {
      const record = JSON.parse(raw);
      items.push(record);
    } catch (error) {
      console.warn('Failed to parse cached message file', file, error);
    }
  }
  return items;
}

export const NewsletterProvider = ({ children }) => {
  const { ensureValidToken, user } = useAuth();
  const { openAiKey } = useSettings();
  const [newsletters, setNewsletters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const cached = await bootstrapCache();
      if (!mounted) {
        return;
      }
      const newslettersOnly = cached.filter((item) => item?.classification?.isNewsletter && !item.archived);
      newslettersOnly.sort((a, b) => (b.internalDate || 0) - (a.internalDate || 0));
      setNewsletters(newslettersOnly);
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSelectedId(null);
  }, [user?.email]);

  const refreshNewsletters = useCallback(async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const accessToken = await ensureValidToken();
      if (!accessToken) {
        throw new Error('Sign in with Google to sync newsletters.');
      }
      if (!openAiKey) {
        throw new Error('Add your OpenAI API key in Settings to classify newsletters.');
      }

      const messageIds = await listInboxMessages(accessToken, 40);
      const now = Date.now();
      const nextItems = [];
      for (const messageId of messageIds) {
        let cachedRecord = await loadCachedNewsletter(messageId);
        const isFresh = cachedRecord && now - (cachedRecord.classification?.classifiedAt ?? 0) < MAX_CACHE_AGE;

        if (!cachedRecord || !isFresh) {
          const message = await fetchMessage(accessToken, messageId);
          const parsed = parseMessage(message);
          let classification = cachedRecord?.classification;

          if (!classification || !isFresh) {
            const result = await classifyWithOpenAI({
              apiKey: openAiKey,
              subject: parsed.subject,
              preview: parsed.snippet,
              body: parsed.bodyText || parsed.bodyHtml,
            });
            classification = { ...result, classifiedAt: Date.now() };
          }

          const htmlSource = parsed.bodyHtml || parsed.bodyText;
          let cachedHtml = cachedRecord?.cachedHtml ?? null;
          let cachedAssets = cachedRecord?.cachedAssets ?? [];
          if (htmlSource) {
            const cacheResult = await cacheNewsletterAssets(htmlSource, messageId);
            cachedHtml = cacheResult.html;
            cachedAssets = cacheResult.assets;
          }

          cachedRecord = {
            ...cachedRecord,
            ...parsed,
            cachedHtml,
            cachedAssets,
            classification,
            archived: false,
            updatedAt: Date.now(),
          };
          await persistNewsletter(cachedRecord);
        }

        if (cachedRecord?.classification?.isNewsletter && !cachedRecord.archived) {
          nextItems.push(cachedRecord);
        }
      }

      nextItems.sort((a, b) => (b.internalDate || 0) - (a.internalDate || 0));
      setNewsletters(nextItems);
      setSelectedId((current) => (nextItems.some((item) => item.id === current) ? current : null));
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('Failed to refresh newsletters', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [ensureValidToken, openAiKey]);

  const selectNewsletter = useCallback((messageId) => {
    setSelectedId(messageId);
  }, []);

  const selectedNewsletter = useMemo(
    () => newsletters.find((item) => item.id === selectedId) ?? null,
    [newsletters, selectedId],
  );

  const updateScrollPosition = useCallback(async (messageId, offsetY) => {
    if (!messageId) {
      return;
    }
    let updatedRecord = null;
    setNewsletters((current) =>
      current.map((item) => {
        if (item.id !== messageId) {
          return item;
        }
        const previousOffset = item.scrollOffset ?? 0;
        if (Math.abs(previousOffset - offsetY) < 16) {
          return item;
        }
        const next = { ...item, scrollOffset: offsetY, lastViewedAt: Date.now() };
        updatedRecord = next;
        return next;
      }),
    );
    if (updatedRecord) {
      await persistNewsletter(updatedRecord);
    }
  }, []);

  const markAsRead = useCallback(async (messageId) => {
    setNewsletters((current) =>
      current.map((item) => (item.id === messageId ? { ...item, readAt: Date.now() } : item)),
    );
    const cached = await loadCachedNewsletter(messageId);
    if (cached) {
      cached.readAt = Date.now();
      await persistNewsletter(cached);
    }
  }, []);

  const archiveNewsletter = useCallback(
    async (messageId) => {
      try {
        const accessToken = await ensureValidToken();
        if (!accessToken) {
          throw new Error('Sign in to archive.');
        }
        await archiveMessage(accessToken, messageId);
        setNewsletters((current) => current.filter((item) => item.id !== messageId));
        setSelectedId((current) => (current === messageId ? null : current));
        const cached = await loadCachedNewsletter(messageId);
        if (cached) {
          cached.archived = true;
          await persistNewsletter(cached);
          await clearNewsletterAssets(messageId);
        }
      } catch (err) {
        console.warn('Failed to archive message', err);
        Alert.alert('Unable to archive', err.message);
      }
    },
    [ensureValidToken],
  );

  const removeNewsletter = useCallback(async (messageId) => {
    setNewsletters((current) => current.filter((item) => item.id !== messageId));
    setSelectedId((current) => (current === messageId ? null : current));
    await deleteFileAsync('messages', `${messageId}.json`);
    await clearNewsletterAssets(messageId);
  }, []);

  const value = useMemo(
    () => ({
      newsletters,
      isSyncing,
      error,
      lastSyncedAt,
      selectedNewsletter,
      selectedId,
      refreshNewsletters,
      selectNewsletter,
      updateScrollPosition,
      markAsRead,
      archiveNewsletter,
      removeNewsletter,
    }),
    [archiveNewsletter, error, isSyncing, lastSyncedAt, markAsRead, newsletters, refreshNewsletters, removeNewsletter, selectedId, selectedNewsletter, updateScrollPosition],
  );

  return <NewsletterContext.Provider value={value}>{children}</NewsletterContext.Provider>;
};

export const useNewsletters = () => {
  const context = useContext(NewsletterContext);
  if (!context) {
    throw new Error('useNewsletters must be used within a NewsletterProvider.');
  }
  return context;
};
