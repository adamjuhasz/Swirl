import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useNewsletters } from '../context/NewsletterContext';
import { useAuth } from '../context/AuthContext';
import { TopBar } from '../components/TopBar';
import { SearchBar } from '../components/SearchBar';
import { SyncIndicator } from '../components/SyncIndicator';
import { NewsletterList } from '../components/NewsletterList';

export function FeedScreen({ onOpenSettings, onSelectNewsletter }) {
  const { user } = useAuth();
  const { newsletters, isSyncing, refreshNewsletters, error, lastSyncedAt } = useNewsletters();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) {
      return newsletters;
    }
    const normalized = query.toLowerCase();
    return newsletters.filter((item) => {
      return (
        item.subject?.toLowerCase().includes(normalized) ||
        item.fromName?.toLowerCase().includes(normalized) ||
        item.fromEmail?.toLowerCase().includes(normalized)
      );
    });
  }, [newsletters, query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar
        title="Marble"
        subtitle={user?.email ? `Signed in as ${user.email}` : 'Connect Gmail to get started'}
        onRefreshPress={refreshNewsletters}
        onSettingsPress={onOpenSettings}
      />
      <SearchBar value={query} onChange={setQuery} />
      <SyncIndicator isSyncing={isSyncing} lastSyncedAt={lastSyncedAt} />
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <NewsletterList
        newsletters={filtered}
        isSyncing={isSyncing}
        onRefresh={refreshNewsletters}
        onSelect={(item) => onSelectNewsletter(item.id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f6f9',
  },
  errorBanner: {
    backgroundColor: '#fdecea',
    borderColor: '#f5c2c0',
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: '#b3261e',
    fontSize: 13,
  },
});
