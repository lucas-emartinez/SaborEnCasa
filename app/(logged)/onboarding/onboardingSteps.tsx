import CheckboxItem from "@/components/onboarding/CheckboxItem";
import { CategoryItem } from "@/components/onboarding/SelectionGrid";
import StepsIndicator from "@/components/onboarding/StepsIndicator";
import { useData } from "@/context/DataProvider";
import { Cuisine, DietaryRestriction, FoodCategory, Goal } from "@/types/enums";
import { UserPreferences } from "@/types/types";
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingFinished from "./onboardingFinished";
import { translateCuisine, translateDietaryRestriction, translateFood, translateGoal } from "@/utils/enum-translations";
import { CUISINE_IMAGES, FOOD_CATEGORY_IMAGES } from "@/constants/categoryImages";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";


// Definir tipo para un paso genérico
type StepOption = FoodCategory | Cuisine | DietaryRestriction | Goal;

interface OnboardingStep {
  title: string;
  options: StepOption[];
  current: StepOption[];
  onSelect: (option: StepOption) => void;
}

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

  const { width } = Dimensions.get('window');

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

  const steps: OnboardingStep[] = useMemo(() => [
    {
      title: "Contanos lo que te gusta",
      options: SELECTED_CATEGORIES,
      current: preferences.preferredCategories,
      onSelect: (category) => {
        if (category in FoodCategory) {
          setPreferences(prev => ({
            ...prev,
            preferredCategories: prev.preferredCategories.includes(category as FoodCategory)
              ? prev.preferredCategories.filter(c => c !== category)
              : [...prev.preferredCategories, category as FoodCategory]
          }));
        }
      }
    },
    {
      title: "Contanos tus comidas preferidas",
      options: SELECTED_CUISINES,
      current: preferences.preferredCuisines,
      onSelect: (cuisine) => {
        if (cuisine in Cuisine) {
          setPreferences(prev => ({
            ...prev,
            preferredCuisines: prev.preferredCuisines.includes(cuisine as Cuisine)
              ? prev.preferredCuisines.filter(c => c !== cuisine)
              : [...prev.preferredCuisines, cuisine as Cuisine]
          }));
        }
      }
    },
    {
      title: "¿Tenés alguna restricción alimentaria?",
      options: Object.values(DietaryRestriction),
      current: preferences.dietaryRestrictions,
      onSelect: (restriction) => {
        if (restriction in DietaryRestriction) {
          setPreferences(prev => ({
            ...prev,
            dietaryRestrictions: prev.dietaryRestrictions.includes(restriction as DietaryRestriction)
              ? prev.dietaryRestrictions.filter(r => r !== restriction)
              : [...prev.dietaryRestrictions, restriction as DietaryRestriction]
          }));
        }
      }
    },
    {
      title: "¿Cuál es tu meta con la alimentación?",
      options: Object.values(Goal),
      current: preferences.goals,
      onSelect: (goal) => {
        if (goal in Goal) {
          setPreferences(prev => ({
            ...prev,
            goals: prev.goals.includes(goal as Goal)
              ? prev.goals.filter(g => g !== goal)
              : [...prev.goals, goal as Goal]
          }));
        }
      }
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

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (user) {
      await updateUser({
        ...user,
        preferences,
        Onboarding: {
          completed: true,
          step: steps.length
        }
      });
      setCurrentStep(steps.length);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  if (currentStep >= steps.length) {
    return <OnboardingFinished />;
  }

  

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>{step.title}</Text>

      <StepsIndicator currentStep={currentStep} totalSteps={steps.length} />

      <GestureHandlerRootView style={styles.contentContainer}>
        {currentStep < 2 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.categoriesContainer}>
              {step.options.map((option, index) => (
                <CategoryItem
                  key={index}
                  category={getTranslation(option, currentStep)}
                  imageSource={
                    currentStep === 0
                      ? FOOD_CATEGORY_IMAGES[option as FoodCategory]
                      : CUISINE_IMAGES[option as Cuisine]
                  }
                  isSelected={step.current.includes(option)}
                  onPress={() => step.onSelect(option)}
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.checkboxContainer}>
            {step.options.map((option, index) => (
              <CheckboxItem
                key={index}
                label={getTranslation(option, currentStep)}
                isDarkMode={colorScheme === 'dark'}
                isChecked={step.current.includes(option)}
                onToggle={() => step.onSelect(option)}
              />
            ))}
          </View>
        )}
      </GestureHandlerRootView>

      <View style={styles.buttonsContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Text style={styles.backButtonText}>Atrás</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.continueButton} onPress={nextStep}>
          <Text style={styles.continueButtonText}>
            {isLastStep ? "Finalizar" : "Continuar"}
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 80, // Para dar espacio al botón de continuar
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
  }
});

export default OnboardingSteps;