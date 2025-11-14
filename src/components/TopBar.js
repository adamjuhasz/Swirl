import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function TopBar({ title, subtitle, onSettingsPress, onRefreshPress }) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity accessibilityRole="button" onPress={onRefreshPress} style={styles.actionButton}>
          <Text style={styles.actionLabel}>Sync</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={onSettingsPress} style={styles.actionButton}>
          <Text style={styles.actionLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#f6f6f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c6c70',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#e8e8ed',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
  },
});
