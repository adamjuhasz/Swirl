import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export function SearchBar({ value, onChange }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search newsletters"
        placeholderTextColor="#8e8e93"
        value={value}
        onChangeText={onChange}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#f6f6f9',
  },
  input: {
    backgroundColor: '#e5e5ea',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1c1c1e',
  },
});
