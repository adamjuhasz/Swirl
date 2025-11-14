import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function ReaderMeta({ newsletter }) {
  if (!newsletter) {
    return null;
  }
  const sentDate = newsletter.internalDate ? new Date(Number(newsletter.internalDate)) : null;
  return (
    <View style={styles.container}>
      <Text style={styles.from}>{newsletter.fromName || newsletter.fromEmail}</Text>
      <Text style={styles.email}>{newsletter.fromEmail}</Text>
      {sentDate ? (
        <Text style={styles.timestamp}>{sentDate.toLocaleString()}</Text>
      ) : null}
      {newsletter.classification?.reasoning ? (
        <View style={styles.note}>
          <Text style={styles.noteLabel}>Why you see this</Text>
          <Text style={styles.noteBody}>{newsletter.classification.reasoning}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  from: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  email: {
    fontSize: 15,
    color: '#6c6c70',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 6,
  },
  note: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#f2f2f7',
    padding: 12,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3a3a3c',
    marginBottom: 4,
  },
  noteBody: {
    fontSize: 13,
    color: '#3a3a3c',
    lineHeight: 18,
  },
});
