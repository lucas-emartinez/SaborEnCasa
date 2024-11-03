// components/onboarding/SuccessAnimation.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SuccessAnimation: React.FC = () => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [
          { scale: scaleAnim },
          { rotate }
        ]
      }
    ]}>
      <Ionicons name="hand-left" size={40} color="#007AFF" />
      <Ionicons name="hand-right" size={40} color="#007AFF" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SuccessAnimation;