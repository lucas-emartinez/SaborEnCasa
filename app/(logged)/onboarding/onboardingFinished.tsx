import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const LOTTIE_CONFETTI_SIZE = width;
const LOTTIE_CLAPPING_SIZE = width * 0.5; // Reducido para mejor proporción

const OnboardingFinished: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(logged)');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Confetti en capa superior */}
      <View style={styles.confettiContainer}>
        <LottieView
          source={require('@/assets/animations/confetti.json')}
          autoPlay
          loop
          style={styles.lottieConfetti}
        />
      </View>

      {/* Contenido principal */}
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.thankYouText}>¡Gracias por tus respuestas!</Text>
          <Text style={styles.infoText}>
            Guardaremos tus preferencias para brindarte la mejor experiencia posible
          </Text>
        </View>

        <View style={styles.clappingContainer}>
          <LottieView
            source={require('@/assets/animations/clapping.json')}
            autoPlay
            loop
            style={styles.lottieClapping}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2, // Asegura que el confetti esté encima
  },
  lottieConfetti: {
    width: LOTTIE_CONFETTI_SIZE,
    height: height, // Usar altura completa de la pantalla
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: height * 0.15, // 15% desde arriba
    paddingBottom: height * 0.1, // 10% desde abajo
    paddingHorizontal: 20,
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  clappingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  lottieClapping: {
    width: LOTTIE_CLAPPING_SIZE,
    height: LOTTIE_CLAPPING_SIZE,
  },
  thankYouText: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    color: '#4a4a4a',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
});

export default OnboardingFinished;