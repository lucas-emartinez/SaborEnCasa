import { Cuisine, CulinaryCategory, DietaryRestriction, FoodCategory, FoodUnit, Goal, NutritionalProperty } from "./enums";

// Interfaces actualizadas
export interface Ingredient {
    id?: number;
    name: string;
    image: string;
    quantity?: number;
    calories?: number;
    unit?: FoodUnit;
    category: FoodCategory;
    nutritionalProperties?: NutritionalProperty[];
    keywords: string[];
}

export interface Recipe {
    id: string;
    name: string;
    ingredients: Ingredient[];
    steps: string[];
    image: string;
    restrictions: DietaryRestriction[];
    calories_per_serving: number;
    nutrition_facts: NutritionFacts;
    cuisine: Cuisine;
    category: CulinaryCategory;
    tags: string[];
}

export interface NutritionFacts {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
}

export interface UserPreferences {
    dietaryRestrictions: DietaryRestriction[];
    goals: Goal[];
    preferredCuisines: Cuisine[];
    preferredCategories: FoodCategory[];
}

export interface UserMeasurements {
    weight?: number;         // in kg
    height?: number;         // in cm
    age?: number;
    activityLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active";
    bmr?: number;           // Basal Metabolic Rate
    dailyCalories?: number;
}

export interface UserPreferences {
    dietaryRestrictions: DietaryRestriction[];
    goals: Goal[];
    preferredCategories: FoodCategory[];
    preferredCuisines: Cuisine[];
}

type Onboarding = {
    completed: boolean;
    step: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    image: string;
    Onboarding: Onboarding;
    preferences: UserPreferences;
    measurements?: UserMeasurements;
    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;
}