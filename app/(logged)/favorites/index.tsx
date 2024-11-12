// import CheckboxItem from "@/components/onboarding/CheckboxItem";
// import { CategoryItem } from "@/components/onboarding/SelectionGrid";
// import StepsIndicator from "@/components/onboarding/StepsIndicator";
// import { useData } from "@/context/DataProvider";
// import { Cuisine, DietaryRestriction, FoodCategory, Goal } from "@/types/enums";
// import { UserPreferences } from "@/types/types";
// import React, { useMemo, useState } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Dimensions } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import OnboardingFinished from "./onboardingFinished";
// import { translateCuisine, translateDietaryRestriction, translateFood, translateGoal } from "@/utils/enum-translations";
// import { CUISINE_IMAGES, FOOD_CATEGORY_IMAGES } from "@/constants/categoryImages";
// import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";


// // Definir tipo para un paso genérico
// type StepOption = FoodCategory | Cuisine | DietaryRestriction | Goal;

// interface OnboardingStep {
//   title: string;
//   options: StepOption[];
//   current: StepOption[];
//   onSelect: (option: StepOption) => void;
// }

// const Favorites: React.FC = () => {
//   const colorScheme = useColorScheme();
//   const { user, updateUser } = useData();

//   const { favouriteRecipes } = useData();

//   const { width } = Dimensions.get('window');

//   const getTranslation = (option: any, currentStep: number): string => {
//     switch (currentStep) {
//       case 0:
//         return translateFood(option as FoodCategory);
//       case 1:
//         return translateCuisine(option as Cuisine);
//       case 2:
//         return translateDietaryRestriction(option as DietaryRestriction);
//       case 3:
//         return translateGoal(option as Goal);
//       default:
//         return option.toString();
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container} edges={["top"]}>
//       <Text style={styles.title}>{step.title}</Text>

//       <StepsIndicator currentStep={currentStep} totalSteps={steps.length} />

//       <GestureHandlerRootView style={styles.contentContainer}>
//         {currentStep < 2 ? (
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.scrollContent}
//           >
//             <View style={styles.categoriesContainer}>
//               {step.options.map((option, index) => (
//                 <CategoryItem
//                   key={index}
//                   category={getTranslation(option, currentStep)}
//                   imageSource={
//                     currentStep === 0
//                       ? FOOD_CATEGORY_IMAGES[option as FoodCategory]
//                       : CUISINE_IMAGES[option as Cuisine]
//                   }
//                   isSelected={step.current.includes(option)}
//                   onPress={() => step.onSelect(option)}
//                 />
//               ))}
//             </View>
//           </ScrollView>
//         ) : (
//           <View style={styles.checkboxContainer}>
//             {step.options.map((option, index) => (
//               <CheckboxItem
//                 key={index}
//                 label={getTranslation(option, currentStep)}
//                 isDarkMode={colorScheme === 'dark'}
//                 isChecked={step.current.includes(option)}
//                 onToggle={() => step.onSelect(option)}
//               />
//             ))}
//           </View>
//         )}
//       </GestureHandlerRootView>

//       <View style={styles.buttonsContainer}>
//         {currentStep > 0 && (
//           <TouchableOpacity style={styles.backButton} onPress={prevStep}>
//             <Text style={styles.backButtonText}>Atrás</Text>
//           </TouchableOpacity>
//         )}
//         <TouchableOpacity style={styles.continueButton} onPress={nextStep}>
//           <Text style={styles.continueButtonText}>
//             {isLastStep ? "Finalizar" : "Continuar"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#FFFFFF'
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingHorizontal: 16,
//     paddingBottom: 80, // Para dar espacio al botón de continuar
//     paddingTop: 8,
//   },
//   categoriesContainer: {
//     paddingVertical: 8,
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-around",
//   },
//   checkboxContainer: {
//     width: "100%",
//     marginTop: 20,
//     paddingHorizontal: 20,
//   },
//   contentContainer: {
//     flex: 1,
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },
//   buttonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//   },
//   backButton: {
//     backgroundColor: "#007BFF",
//     borderRadius: 25,
//     padding: 16,
//     alignItems: "center",
//     flex: 1,
//     marginRight: 8,
//   },
//   backButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   continueButton: {
//     backgroundColor: "#007BFF",
//     borderRadius: 25,
//     padding: 16,
//     alignItems: "center",
//     flex: 1,
//     marginLeft: 8,
//   },
//   continueButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   }
// });

// export default OnboardingSteps;