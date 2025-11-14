import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function SyncIndicator({ isSyncing, lastSyncedAt }) {
  return (
    <View style={styles.container}>
      {isSyncing ? <ActivityIndicator size="small" color="#007aff" /> : null}
      <Text style={styles.label}>
        {isSyncing
          ? 'Syncing your newsletters…'
          : lastSyncedAt
            ? `Updated ${lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Tap sync to fetch newsletters'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f6f6f9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 13,
    color: '#6c6c70',
  },
});
