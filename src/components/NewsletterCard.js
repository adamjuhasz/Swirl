import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function formatRelativeDate(timestamp) {
  if (!timestamp) {
    return '';
  }
  const date = new Date(Number(timestamp));
  const now = new Date();
  const diff = now - date;
  const oneDay = 24 * 60 * 60 * 1000;
  if (diff < oneDay) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  }
  if (diff < 7 * oneDay) {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

export function NewsletterCard({ item, onPress }) {
  const read = Boolean(item.readAt);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.headerRow}>
        <Text style={[styles.sender, read && styles.senderRead]} numberOfLines={1}>
          {item.fromName || item.fromEmail}
        </Text>
        <Text style={styles.date}>{formatRelativeDate(item.internalDate)}</Text>
      </View>
      <Text style={[styles.subject, read && styles.subjectRead]} numberOfLines={2}>
        {item.subject || '(No subject)'}
      </Text>
      <Text style={styles.summary} numberOfLines={2}>
        {item.classification?.summary || item.snippet}
      </Text>
      {Array.isArray(item.classification?.topics) && item.classification.topics.length > 0 ? (
        <View style={styles.tagsRow}>
          {item.classification.topics.map((topic) => (
            <View key={topic} style={styles.tag}>
              <Text style={styles.tagLabel}>{topic}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomColor: '#e5e5ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    backgroundColor: '#f2f2f7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sender: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1c1e',
    flex: 1,
    marginRight: 12,
  },
  senderRead: {
    color: '#3a3a3c',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#8e8e93',
  },
  subject: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1c1c1e',
    marginTop: 4,
  },
  subjectRead: {
    fontWeight: '600',
  },
  summary: {
    fontSize: 15,
    color: '#6c6c70',
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagLabel: {
    fontSize: 12,
    color: '#3a3a3c',
    fontWeight: '600',
  },
});
