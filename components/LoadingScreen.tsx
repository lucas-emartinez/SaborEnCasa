import LottieView from "lottie-react-native";
import { StyleSheet, View, Dimensions } from "react-native";

const { width } = Dimensions.get('window');
const LOTTIE_SIZE = width * 0.5; // 70% del ancho de la pantalla

export const LoadingScreen = () => (
  <View style={styles.container}>
    <LottieView
      source={require('@/assets/animations/loader.json')}
      autoPlay
      loop
      style={styles.lottie}
      onAnimationFailure={(error) => console.log('Lottie Error:', error)}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // o el color que prefieras
  },
  lottie: {
    width: LOTTIE_SIZE,
    height: LOTTIE_SIZE,
  },
});