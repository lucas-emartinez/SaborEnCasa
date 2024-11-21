import CheckboxItem from "@/components/onboarding/CheckboxItem";
import { CategoryItem } from "@/components/onboarding/SelectionGrid";
import StepsIndicator from "@/components/onboarding/StepsIndicator";
import { useData } from "@/context/DataProvider";
import { ActivityLevel, Cuisine, DietaryRestriction, FoodCategory, Goal } from "@/types/enums";
import { User, UserMeasurements, UserPreferences } from "@/types/types";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingFinished from "./onboardingFinished";
import { translateCuisine, translateDietaryRestriction, translateFood, translateGoal } from "@/utils/enum-translations";
import { CUISINE_IMAGES, FOOD_CATEGORY_IMAGES } from "@/constants/categoryImages";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import MeasurementsForm from "@/components/onboarding/MeasurementsForm";

const OnboardingSteps: React.FC = () => {
  const colorScheme = useColorScheme();
  const { user, updateUser } = useData();
 
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredCategories: [],
    preferredCuisines: [],
    dietaryRestrictions: [],
    goals: [],
  });
  const [measurements, setMeasurements] = useState<UserMeasurements>({
    weight: 0,
    height: 0,
    age: 0,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    bmr: 0,
    dailyCalories: 0,
  });

  const SELECTED_CATEGORIES = [
    FoodCategory.VEGETABLES,
    FoodCategory.FRUITS,
    FoodCategory.MEAT,
    FoodCategory.FISH,
    FoodCategory.GRAINS,
    FoodCategory.DAIRY,
    FoodCategory.LEGUMES,
    FoodCategory.SNACKS
  ];

  const SELECTED_CUISINES = [
    Cuisine.ITALIAN,
    Cuisine.MEXICAN,
    Cuisine.CHINESE,
    Cuisine.JAPANESE,
    Cuisine.MEDITERRANEAN,
    Cuisine.FASTFOOD,
    Cuisine.VEGGIE,
    Cuisine.INTERNATIONAL
  ];

  const renderStepContent = () => {
    if (currentStep === 4) {
      return <MeasurementsForm
        measurements={measurements}
        setMeasurements={setMeasurements}
      />;
    }

    if (currentStep < 2) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.categoriesContainer}>
            {steps[currentStep].options.map((option, index): any => (
              <CategoryItem
                key={index}
                category={getTranslation(option, currentStep)}
                imageSource={
                  currentStep === 0
                    ? FOOD_CATEGORY_IMAGES[option as FoodCategory]
                    : CUISINE_IMAGES[option as Cuisine]
                }
                isSelected={steps[currentStep].current.includes(option)}
                onPress={() => steps[currentStep].onSelect(option)}
              />
            ))}
          </View>
        </ScrollView>
      );
    }

    return (
      <View style={styles.checkboxContainer}>
        {steps[currentStep].options.map((option, index) => (
          <CheckboxItem
            key={index}
            label={getTranslation(option, currentStep)}
            isDarkMode={colorScheme === 'dark'}
            isChecked={steps[currentStep].current.includes(option)}
            onToggle={() => steps[currentStep].onSelect(option)}
          />
        ))}
      </View>
    );
  };

  const steps: {
    title: string;
    options: (FoodCategory | Cuisine | DietaryRestriction | Goal)[];
    current: (FoodCategory | Cuisine | DietaryRestriction | Goal)[];
    onSelect: (option: FoodCategory | Cuisine | DietaryRestriction | Goal) => void;
  }[] = useMemo(() => [
    {
      title: "Contanos lo que te gusta",
      options: SELECTED_CATEGORIES,
      current: preferences.preferredCategories,
      onSelect: (option: FoodCategory | Cuisine | DietaryRestriction | Goal) => {
        if (option in FoodCategory) {
          setPreferences(prev => ({
            ...prev,
            preferredCategories: prev.preferredCategories.includes(option as FoodCategory)
              ? prev.preferredCategories.filter(c => c !== option)
              : [...prev.preferredCategories, option as FoodCategory]
          }));
        }
      }
    },
    {
      title: "Contanos tus comidas preferidas",
      options: SELECTED_CUISINES,
      current: preferences.preferredCuisines,
      onSelect: (option: FoodCategory | Cuisine | DietaryRestriction | Goal) => {
        if (option in Cuisine) {
          setPreferences(prev => ({
            ...prev,
            preferredCuisines: prev.preferredCuisines.includes(option as Cuisine)
              ? prev.preferredCuisines.filter(c => c !== option)
              : [...prev.preferredCuisines, option as Cuisine]
          }));
        }
      }
    },
    {
      title: "¿Tenés alguna restricción alimentaria?",
      options: Object.values(DietaryRestriction),
      current: preferences.dietaryRestrictions,
      onSelect: (option: FoodCategory | Cuisine | DietaryRestriction | Goal) => {
        if (option in DietaryRestriction) {
          setPreferences(prev => ({
            ...prev,
            dietaryRestrictions: prev.dietaryRestrictions.includes(option as DietaryRestriction)
              ? prev.dietaryRestrictions.filter(r => r !== option)
              : [...prev.dietaryRestrictions, option as DietaryRestriction]
          }));
        }
      }
    },
    {
      title: "¿Cuál es tu meta con la alimentación?",
      options: Object.values(Goal),
      current: preferences.goals,
      onSelect: (option: FoodCategory | Cuisine | DietaryRestriction | Goal) => {
        if (option in Goal) {
          setPreferences(prev => ({
            ...prev,
            goals: prev.goals.includes(option as Goal)
              ? prev.goals.filter(g => g !== option)
              : [...prev.goals, option as Goal]
          }));
        }
      }
    },
    {
      title: "Tus medidas físicas",
      options: [],
      current: [],
      onSelect: () => { }
    }
  ], [preferences]);

  const getTranslation = (option: any, currentStep: number): string => {
    switch (currentStep) {
      case 0:
        return translateFood(option as FoodCategory);
      case 1:
        return translateCuisine(option as Cuisine);
      case 2:
        return translateDietaryRestriction(option as DietaryRestriction);
      case 3:
        return translateGoal(option as Goal);
      default:
        return option.toString();
    }
  };
  const validateMeasurements = (measurements: UserMeasurements): boolean => {
    return (
      (measurements.weight ?? 0) > 0 &&
      (measurements.height ?? 0) > 0 &&
      (measurements.age ?? 0) > 0 &&
      measurements.activityLevel !== undefined
    );
  };
  // Modificar el manejo del último paso y la finalización
  const nextStep = async () => {
    if (currentStep === steps.length - 1) {
      // Si estamos en el último paso (measurements)
      if (validateMeasurements(measurements)) {
        if (user) {
          updateUser({
            ...user,
            preferences,
            measurements,
            Onboarding: {
              completed: true,
              step: steps.length
            }
          });
        }
        setCurrentStep(currentStep + 1); // Esto llevará al OnboardingFinished
      } else {
        // Mostrar algún tipo de error o mensaje al usuario
        Alert.alert(
          "Datos incompletos",
          "Por favor completa todos los campos antes de continuar",
          [{ text: "OK" }]
        );
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Modificar la parte del rendering
  if (currentStep >= steps.length) {
    return <OnboardingFinished />;
  }


  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>{steps[currentStep].title}</Text>
      <StepsIndicator currentStep={currentStep} totalSteps={steps.length} />

      <GestureHandlerRootView style={styles.contentContainer}>
        {renderStepContent()}
      </GestureHandlerRootView>

      <View style={styles.buttonsContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Text style={styles.backButtonText}>Atrás</Text>
          </TouchableOpacity>
        )}
        {currentStep < steps.length && (
          <TouchableOpacity
            style={[
              styles.continueButton,
              currentStep === steps.length - 1 && !validateMeasurements(measurements) &&
              styles.continueButtonDisabled
            ]}
            onPress={nextStep}
          >
            <Text style={styles.continueButtonText}>
              {currentStep === steps.length - 1 ? "Finalizar" : "Continuar"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
    paddingTop: 8,
  },
  categoriesContainer: {
    paddingVertical: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  checkboxContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "#007BFF",
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
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default OnboardingSteps;