import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { NewsletterCard } from './NewsletterCard';
import { EmptyState } from './EmptyState';

export function NewsletterList({ newsletters, isSyncing, onRefresh, onSelect }) {
  if (!newsletters || newsletters.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          title="No newsletters yet"
          message="Connect your Gmail account and sync to pull newsletters into Marble."
        />
      </View>
    );
  }

  return (
    <FlatList
      data={newsletters}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NewsletterCard item={item} onPress={() => onSelect(item)} />}
      refreshControl={<RefreshControl refreshing={isSyncing} onRefresh={onRefresh} tintColor="#007aff" />}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    backgroundColor: '#fff',
  },
});
