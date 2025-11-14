import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ReaderHeader({ subject, from, onBack, onArchive }) {
  return (
    <View style={styles.container}>
      <View style={styles.leading}>
        <TouchableOpacity accessibilityRole="button" onPress={onBack} style={styles.button}>
          <Text style={styles.buttonLabel}>Inbox</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.subject} numberOfLines={1}>
            {subject || '(No subject)'}
          </Text>
          <Text style={styles.from} numberOfLines={1}>
            {from}
          </Text>
        </View>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={onArchive} style={styles.button}>
        <Text style={styles.buttonLabel}>Archive</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  subject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  from: {
    fontSize: 14,
    color: '#6c6c70',
  },
  button: {
    backgroundColor: '#e8e8ed',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
  },
});
