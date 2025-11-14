import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export function SettingsSheet({ visible, onClose }) {
  const { openAiKey, updateOpenAiKey } = useSettings();
  const { user, signOut } = useAuth();
  const [draftKey, setDraftKey] = useState(openAiKey);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraftKey(openAiKey);
    }
  }, [openAiKey, visible]);

  const handleSave = async () => {
    setIsSaving(true);
    await updateOpenAiKey(draftKey.trim());
    setIsSaving(false);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              {user ? (
                <View style={styles.accountRow}>
                  <View>
                    <Text style={styles.accountName}>{user.name || user.email}</Text>
                    <Text style={styles.accountEmail}>{user.email}</Text>
                  </View>
                  <TouchableOpacity onPress={handleSignOut} style={styles.secondaryButton}>
                    <Text style={styles.secondaryLabel}>Sign out</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.empty}>Connect Gmail to begin.</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OpenAI API Key</Text>
              <Text style={styles.sectionDescription}>
                Marble uses your API key to classify newsletters with GPT-4o mini. Keys are encrypted on-device and never
                leave Marble.
              </Text>
              <TextInput
                style={styles.input}
                value={draftKey}
                onChangeText={setDraftKey}
                placeholder="sk-..."
                placeholderTextColor="#8e8e93"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <TouchableOpacity onPress={handleSave} style={styles.primaryButton} disabled={isSaving}>
                <Text style={styles.primaryLabel}>{isSaving ? 'Saving…' : 'Save key'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Marble</Text>
              <Text style={styles.sectionDescription}>
                Marble mirrors the simplicity of iOS Mail to focus on the newsletters you love. Newsletters stay on your
                device and assets are cached locally for offline reading.
              </Text>
              <Text style={styles.sectionDescription}>App version 1.0.0</Text>
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeLabel}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sheet: {
    backgroundColor: '#f2f2f7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d1d6',
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1c1e',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6c6c70',
    lineHeight: 20,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  accountEmail: {
    fontSize: 14,
    color: '#6c6c70',
    marginTop: 2,
  },
  secondaryButton: {
    backgroundColor: '#f2f2f7',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  secondaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  empty: {
    fontSize: 14,
    color: '#6c6c70',
  },
  input: {
    backgroundColor: '#f2f2f7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1c1c1e',
  },
  primaryButton: {
    backgroundColor: '#007aff',
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007aff',
  },
});
