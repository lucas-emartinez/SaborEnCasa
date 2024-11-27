import { ActivityLevel, Cuisine, CulinaryCategory, DietaryRestriction, DietType, FoodCategory, FoodUnit, Goal, NutritionalProperty } from "./enums";

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

export interface ShoppingListItem {
    ingredient: Ingredient;
    quantity: number;
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
    dietType: DietType[]
    tags: string[];
    price: number;
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
    activityLevel: ActivityLevel;
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

export interface UserIngredient {
    id: number;
    name: string;
    quantity: string;
    addedAt: Date;
}

export interface User {
    id: number;
    name: string;
    email: string;
    image: string;
    Onboarding: Onboarding;
    preferences: UserPreferences;
    measurements: UserMeasurements;
    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;
    ingredients: UserIngredient[];
}

export interface BarcodePoint {
    x: number;
    y: number;
}

export interface BarcodeScanningResult {
    type: string;
    data: string;
    raw?: string;
    cornerPoints: BarcodePoint[];
    bounds: {
        origin: { x: number; y: number };
        size: { width: number; height: number };
    };
}

export interface ScannedProduct {
    product_name: string;
    categories_tags?: string[];
    nutriments?: any;
    image_url?: string;
}

export type Tip = {
    id: string;
    title: string;
    description: string;
    iconName: string;
    relatedTips: string[];
    content: TipContent[];
}

export type TipContent = {
    type: 'paragraph' | 'subtitle' | 'image' | 'bullets' | 'tips';
    content: string | string[] | any;
}