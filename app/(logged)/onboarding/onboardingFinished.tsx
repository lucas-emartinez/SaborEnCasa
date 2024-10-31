import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

const clappingHandsImage = require('@/assets/images/clapping-hands.png');

const OnboardingFinished: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.thankYouText}>¡Gracias por tus respuestas!</Text>
      <Image source={clappingHandsImage} style={styles.image} />
      <Text style={styles.infoText}>Guardaremos tus preferencias para brindarte la mejor experiencia posible</Text>
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueButtonText}>
          Continuar
        </Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  thankYouText: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoText: {
    fontSize: 20,
    fontWeight: "semibold",
    textAlign: "center", 
    marginVertical: 32
  },
  continueButton: {
    backgroundColor: "#007BFF",
    borderRadius: 25,
    padding: 16,
    alignItems: "center",
    width: "100%",
    marginTop: 20, 
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 200,
    height: 200, 
    marginVertical: 20
  }
});

export default OnboardingFinished;
