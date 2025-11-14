import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGoogleAuthRequest } from '../hooks/useGoogleAuthRequest';

export function SignInScreen({ onOpenSettings }) {
  const { initiate, isProcessing } = useGoogleAuthRequest();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Image source={require('../../assets/icon.png')} style={styles.icon} />
          <Text style={styles.title}>Welcome to Marble</Text>
          <Text style={styles.subtitle}>
            Marble connects to Gmail, detects newsletters with GPT-4o mini, and keeps your reading list in sync across
            devices.
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.bullet}>• Only newsletters appear in your feed.</Text>
          <Text style={styles.bullet}>• Scroll position and assets are cached for offline reading.</Text>
          <Text style={styles.bullet}>• Archive in Marble archives the email in Gmail.</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={initiate} disabled={isProcessing}>
          <Text style={styles.buttonLabel}>{isProcessing ? 'Connecting…' : 'Sign in with Google'}</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          Use a Google OAuth Client ID configured for iOS and Android. Marble never sends your data to external servers.
        </Text>
        <TouchableOpacity style={styles.settingsLink} onPress={onOpenSettings}>
          <Text style={styles.settingsLabel}>Configure OpenAI key</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f6f9',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c6c70',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    gap: 8,
  },
  bullet: {
    fontSize: 15,
    color: '#3a3a3c',
  },
  button: {
    backgroundColor: '#007aff',
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  disclaimer: {
    fontSize: 13,
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 24,
  },
  settingsLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007aff',
  },
});
