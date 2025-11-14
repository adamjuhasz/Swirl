import React, { useEffect, useMemo, useRef } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { ReaderHeader } from '../components/ReaderHeader';
import { ReaderMeta } from '../components/ReaderMeta';
import { useNewsletters } from '../context/NewsletterContext';

function escapeHtml(text) {
  if (!text) {
    return '';
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br />');
}

export function ReaderScreen({ onClose }) {
  const { selectedNewsletter, archiveNewsletter, updateScrollPosition, markAsRead } = useNewsletters();
  const scrollRef = useRef(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (selectedNewsletter?.scrollOffset && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: selectedNewsletter.scrollOffset, animated: false });
      });
    }
  }, [selectedNewsletter?.scrollOffset]);

  useEffect(() => {
    if (selectedNewsletter) {
      markAsRead(selectedNewsletter.id);
    }
  }, [markAsRead, selectedNewsletter]);

  const htmlSource = useMemo(() => {
    if (!selectedNewsletter) {
      return { html: '<p>No content.</p>' };
    }
    if (selectedNewsletter.cachedHtml) {
      return { html: selectedNewsletter.cachedHtml };
    }
    if (selectedNewsletter.bodyHtml) {
      return { html: selectedNewsletter.bodyHtml };
    }
    return { html: `<p>${escapeHtml(selectedNewsletter.bodyText || '')}</p>` };
  }, [selectedNewsletter]);

  if (!selectedNewsletter) {
    return null;
  }

  const handleArchive = async () => {
    await archiveNewsletter(selectedNewsletter.id);
    onClose();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ReaderHeader
        subject={selectedNewsletter.subject}
        from={selectedNewsletter.fromName || selectedNewsletter.fromEmail}
        onBack={onClose}
        onArchive={handleArchive}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={(event) => updateScrollPosition(selectedNewsletter.id, event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={500}
      >
        <ReaderMeta newsletter={selectedNewsletter} />
        {selectedNewsletter.classification?.summary ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Summary</Text>
            <Text style={styles.summaryBody}>{selectedNewsletter.classification.summary}</Text>
          </View>
        ) : null}
        <View style={styles.htmlWrapper}>
          <RenderHtml contentWidth={width - 40} source={htmlSource} tagsStyles={tagsStyles} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const tagsStyles = {
  body: {
    color: '#1c1c1e',
    fontSize: 16,
    lineHeight: 24,
  },
  p: {
    marginBottom: 14,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 18,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  li: {
    marginBottom: 8,
  },
  a: {
    color: '#007aff',
  },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f6f9',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f2f2f7',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3a3a3c',
  },
  summaryBody: {
    fontSize: 15,
    color: '#1c1c1e',
    lineHeight: 22,
  },
  htmlWrapper: {
    marginTop: 16,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
