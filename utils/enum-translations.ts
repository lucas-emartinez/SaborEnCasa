// utils/enumTranslations.ts
import { DietaryRestriction, FoodCategory, Cuisine, Goal } from '@/types/enums';

export const translateFood = (category: FoodCategory): string => {
  const translations: Record<FoodCategory, string> = {
    [FoodCategory.FISH]: "Pescados",
    [FoodCategory.MEAT]: "Carnes",
    [FoodCategory.VEGETABLES]: "Verduras",
    [FoodCategory.FRUITS]: "Frutas",
    [FoodCategory.DAIRY]: "Lácteos",
    [FoodCategory.GRAINS]: "Cereales",
    [FoodCategory.LEGUMES]: "Legumbres",
    [FoodCategory.SWEETS]: "Dulces",
    [FoodCategory.BEVERAGES]: "Bebidas",
    [FoodCategory.FATS]: "Grasas",
    [FoodCategory.BAKERY]: "Panadería",
    [FoodCategory.SNACKS]: "Snacks",
    [FoodCategory.CONDIMENTS]: "Condimentos",
    [FoodCategory.OTHERS]: "Otros",
  };
  return translations[category];
};
  

export const translateDietaryRestriction = (restriction: DietaryRestriction): string => {
  const translations: Record<DietaryRestriction, string> = {
    [DietaryRestriction.NONE]: "Ninguna",
    [DietaryRestriction.CELIAC]: "Celíaco",
    [DietaryRestriction.DIABETIC]: "Diabético",
    [DietaryRestriction.LACTOSE_INTOLERANT]: "Intolerante a la lactosa",
    [DietaryRestriction.VEGAN]: "Vegano",
    [DietaryRestriction.VEGETARIAN]: "Vegetariano",
    [DietaryRestriction.FENILCETONURIA]: "Fenilcetonuria",
    [DietaryRestriction.LOW_SODIUM]: "Bajo en sodio",
    [DietaryRestriction.LOW_FAT]: "Bajo en grasas",
    [DietaryRestriction.NO_FLOUR]: "Sin harina",
    [DietaryRestriction.NO_SUGAR]: "Sin azúcar"
  };
  return translations[restriction];
};

export const translateGoal = (goal: Goal): string => {
  const translations: Record<Goal, string> = {
    [Goal.NONE]: "Sin objetivo específico",
    [Goal.GAIN_MUSCLE]: "Ganar masa muscular",
    [Goal.LOSE_WEIGHT]: "Bajar de peso",
    [Goal.MAINTAIN_WEIGHT]: "Mantener peso",
    [Goal.REDUCE_FAT]: "Reducir grasa",
    [Goal.REDUCE_SUGAR]: "Reducir azúcar",
    [Goal.REDUCE_CARBS]: "Reducir carbohidratos"
  };
  return translations[goal];
};

export const translateCuisine = (cuisine: Cuisine): string => {
  const translations: Record<Cuisine, string> = {
    [Cuisine.ITALIAN]: "Italiana",
    [Cuisine.MEXICAN]: "Mexicana",
    [Cuisine.CHINESE]: "China",
    [Cuisine.JAPANESE]: "Japonesa",
    [Cuisine.MEDITERRANEAN]: "Mediterránea",
    [Cuisine.AMERICAN]: "Americana",
    [Cuisine.LATIN]: "Latina",
    [Cuisine.BAKERY]: "Panadería",
    [Cuisine.FASTFOOD]: "Comida rápida",
    [Cuisine.VEGGIE]: "Vegetariana",
    [Cuisine.INDIAN]: "India",
    [Cuisine.FRENCH]: "Francesa",
    [Cuisine.INTERNATIONAL]: "Internacional"
  };
  return translations[cuisine];
};