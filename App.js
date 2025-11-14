import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { NewsletterProvider, useNewsletters } from './src/context/NewsletterContext';
import { SignInScreen } from './src/screens/SignInScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';
import { SettingsSheet } from './src/screens/SettingsSheet';

function RootNavigator() {
  const { isLoading, credentials } = useAuth();
  const { isLoading: settingsLoading } = useSettings();
  const { selectedNewsletter, selectNewsletter } = useNewsletters();
  const [settingsVisible, setSettingsVisible] = useState(false);

  if (isLoading || settingsLoading) {
    return (
      <View style={styles.loader}> 
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  const showSettings = () => setSettingsVisible(true);
  const hideSettings = () => setSettingsVisible(false);

  if (!credentials?.accessToken) {
    return (
      <>
        <SignInScreen onOpenSettings={showSettings} />
        <SettingsSheet visible={settingsVisible} onClose={hideSettings} />
      </>
    );
  }

  return (
    <>
      {selectedNewsletter ? (
        <ReaderScreen onClose={() => selectNewsletter(null)} />
      ) : (
        <FeedScreen onOpenSettings={showSettings} onSelectNewsletter={selectNewsletter} />
      )}
      <SettingsSheet visible={settingsVisible} onClose={hideSettings} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NewsletterProvider>
          <View style={styles.appContainer}>
            <StatusBar style="dark" />
            <RootNavigator />
          </View>
        </NewsletterProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#f6f6f9',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f6f9',
  },
});
