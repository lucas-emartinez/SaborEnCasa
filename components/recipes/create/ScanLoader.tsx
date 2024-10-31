import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface ScanLoaderProps {
  isVisible: boolean;
}

export default function ScanLoader({ isVisible }: ScanLoaderProps) {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#15CF77" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loaderBox: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 10,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'light',
    fontFamily: 'Roboto',
    color: '#333',
  },
});