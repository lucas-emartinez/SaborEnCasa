import CheckboxItem from "@/components/onboarding/CheckboxItem";
import CategoryItem from "@/components/onboarding/SelectionGrid";
import StepsIndicator from "@/components/onboarding/StepsIndicator";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingFinished from "./onboardingFinished";

const OnboardingSteps: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [restrictionsChecked, setRestrictionsChecked] = useState<boolean[]>(Array(9).fill(false));
  const [goalsChecked, setGoalsChecked] = useState<boolean[]>(Array(8).fill(false));

  const steps = [
    {
      id: 1,
      title: "Contanos lo que te gusta",
      content: (
        <View style={styles.categoriesContainer}>
          {["Verduras", "Frutas", "Carnes rojas", "Mariscos", "Carnes blancas", "Pescados", "Cereales y granos", "Embutidos"].map((category, index) => (
            <CategoryItem
              key={index}
              category={category}
              isDarkMode={isDarkMode}
              onPress={() => {
              }}
            />
          ))}
        </View>
      ),
    },
    {
      id: 2,
      title: "Contanos tus comidas preferidas",
      content: (
        <View style={styles.categoriesContainer}>
          {["China", "Japonesa", "Mexicana", "Italiana", "Rápida", "Vegetariana", "Panadería", "Internacional"].map((food, index) => (
            <CategoryItem
              key={index}
              category={food}
              isDarkMode={isDarkMode}
              onPress={() => {
              }}
            />
          ))}
        </View>
      ),
    },
    {
      id: 3,
      title: "¿Tenés alguna restricción alimentaria?",
      content: (
        <View style={styles.checkboxContainer}>
          {["Celiaquía", "Intolerancia a la lactosa", "Diabetes", "Fenilcetonuria", "Dieta vegetariana", "Dieta vegana", "Dieta sin azúcar", "Dieta sin harina", "Ninguna de las anteriores"].map((restriction, index) => (
            <CheckboxItem
              key={index}
              label={restriction}
              isChecked={restrictionsChecked[index]}
              isDarkMode={isDarkMode}
              onToggle={() => {
                const updatedChecked = [...restrictionsChecked];
                updatedChecked[index] = !updatedChecked[index];
                setRestrictionsChecked(updatedChecked);
              }}
            />
          ))}
        </View>
      ),
    },
    {
      id: 4,
      title: "¿Cuál es tu meta con la alimentación?",
      content: (
        <View style={styles.checkboxContainer}>
          {["Mantener peso actual", "Aumentar masa muscular", "Reducir grasa corporal", "Mejorar la salud digestiva", "Controlar el azúcar en sangre", "Reducir el consumo de carbohidratos", "Reducir el colesterol", "Optimizar el rendimiento deportivo"].map((goal, index) => (
            <CheckboxItem
              key={index}
              label={goal}
              isChecked={goalsChecked[index]}
              isDarkMode={isDarkMode}
              onToggle={() => {
                const updatedChecked = [...goalsChecked];
                updatedChecked[index] = !updatedChecked[index];
                setGoalsChecked(updatedChecked);
              }}
            />
          ))}
        </View>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(steps.length); 
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDarkMode ? styles.darkBackground : styles.lightBackground,
      ]}
      edges={["top"]}
    >
      {currentStep < steps.length ? (
        <>
          <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
            {steps[currentStep].title}
          </Text>

          <StepsIndicator currentStep={currentStep} totalSteps={steps.length} />

          <View style={styles.contentContainer}>{steps[currentStep].content}</View>

          <View style={styles.buttonsContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                <Text style={styles.backButtonText}>Atrás</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.continueButton} onPress={nextStep}>
              <Text style={styles.continueButtonText}>
                {currentStep !== steps.length - 1 ? "Continuar" : "Finalizar"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <OnboardingFinished />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 60,
    textAlign: "center",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  checkboxContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "#a7d0fc",
    borderRadius: 25,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#007BFF",
    borderRadius: 25,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  lightBackground: { backgroundColor: "#FFFFFF" },
  darkBackground: { backgroundColor: "#121212" },
  lightText: { color: "#000000" },
  darkText: { color: "#FFFFFF" },
  finalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  finalText: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default OnboardingSteps;
