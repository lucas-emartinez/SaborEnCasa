// components/TipContainer.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Tip } from './Tip';
import { router } from 'expo-router';
import { tipsData } from '@/assets/data/tips';

export const TipContainer = () => {
  const handleTipPress = (tipId: string) => {
    router.push({
        pathname: '/(logged)/tips/[id]',
        params: { id: tipId },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tips Nutricionales</Text>
        <Text style={styles.subtitle}>Consejos para una alimentación saludable</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {tipsData.map((tip) => (
          <Tip
            key={tip.id}
            title={tip.title}
            description={tip.description}
            iconName={tip.iconName}
            onPress={() => handleTipPress(tip.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginVertical: 10,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});