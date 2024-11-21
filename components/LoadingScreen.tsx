import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export const LoadingScreen = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Creamos una animación infinita
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    // Iniciamos la animación
    spin.start();

    // Limpieza al desmontar
    return () => {
      spin.stop();
      spinValue.setValue(0);
    };
  }, []);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.loaderContainer}>
        <Animated.View
          style={[
            styles.spinner,
            {
              transform: [{ rotate }],
            },
          ]}
        />
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loaderContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    position: 'absolute',
    zIndex: 2,
  },
  spinner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    position: 'absolute',
    borderTopColor: '#006943',
    borderRightColor: 'rgba(52, 211, 153, 0.1)',
    borderBottomColor: 'rgba(52, 211, 153, 0.1)',
    borderLeftColor: 'rgba(52, 211, 153, 0.1)',
  },
});