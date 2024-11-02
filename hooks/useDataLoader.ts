import { useState, useEffect } from 'react';
import {
    Ingredient,
    Recipe,
    User
} from "@/types/types";
import { Cuisine, CulinaryCategory, DietaryRestriction, FoodCategory, FoodUnit, Goal, NutritionalProperty } from '@/types/enums';
import { validators } from '@/configs/validators';

// Función auxiliar para validar enum
const isValidEnum = <T extends { [key: string]: string }>(
    value: string,
    enumObject: T
): value is T[keyof T] => {
    return Object.values(enumObject).includes(value);
};

// Transform and validate ingredient data
const transformIngredient = (rawIngredient: any): Ingredient | null => {
    try {
        if (!rawIngredient?.id || !rawIngredient?.name) return null;

        return {
            id: rawIngredient.id,
            name: rawIngredient.name,
            image: rawIngredient.image || '',
            unit: validators.validateUnit(rawIngredient.unit),
            category: validators.validateCategory(rawIngredient.category),
            nutritionalProperties: validators.validateNutritionalProperties(rawIngredient.nutritionalProperties),
            keywords: Array.isArray(rawIngredient.keywords) ? rawIngredient.keywords : []
        };
    } catch (error) {
        console.error(`Error transforming ingredient:`, error);
        return null;
    }
};

// En tu DataLoader
const transformRecipe = (
    rawRecipe: any,
    availableIngredients: Ingredient[]
): Recipe | null => {
    try {
        if (!rawRecipe?.id || !rawRecipe?.name) {
            console.error('Missing required fields for recipe:', rawRecipe?.name);
            return null;
        }

        // Transformar los ingredientes de la receta
        const transformedIngredients = rawRecipe.ingredients.map((ing: any) => {
            // Si el ingrediente tiene un ingredientId, buscamos el ingrediente completo
            if (ing.ingredientId) {
                const baseIngredient = availableIngredients.find(i => i.id === ing.ingredientId);
                if (!baseIngredient) {
                    console.warn(`Ingredient with id ${ing.ingredientId} not found for recipe ${rawRecipe.name}`);
                    return null;
                }

                return {
                    ...baseIngredient,
                    quantity: ing.quantity,
                    unit: validators.validateUnit(ing.unit)
                };
            }
            return null;
        }).filter(Boolean);

        const recipe: Recipe = {
            id: rawRecipe.id.toString(),
            name: rawRecipe.name,
            ingredients: transformedIngredients,
            steps: Array.isArray(rawRecipe.steps) ? rawRecipe.steps : [],
            image: rawRecipe.image || '',
            restrictions: validators.validateRestrictions(rawRecipe.restrictions),
            calories_per_serving: Number(rawRecipe.calories_per_serving) || 0,
            nutrition_facts: {
                protein: Number(rawRecipe.nutrition_facts?.protein) || 0,
                carbohydrates: Number(rawRecipe.nutrition_facts?.carbohydrates) || 0,
                fat: Number(rawRecipe.nutrition_facts?.fat) || 0,
                fiber: Number(rawRecipe.nutrition_facts?.fiber) || 0
            },
            cuisine: validators.validateCuisine(rawRecipe.cuisine),
            category: validators.validateCulinaryCategory(rawRecipe.category),
            tags: Array.isArray(rawRecipe.tags) ? rawRecipe.tags : []
        };

        return recipe;
    } catch (error) {
        console.error(`Error transforming recipe ${rawRecipe?.name}:`, error);
        return null;
    }
};


// Transform and validate user data
const transformUser = (rawUser: any): User | null => {
    try {
        if (!rawUser || !rawUser.id || !rawUser.name || !rawUser.email) {
            console.error('Missing required user fields');
            return null;
        }

        return {
            id: rawUser.id,
            name: rawUser.name,
            email: rawUser.email,
            image: rawUser.image || '',
            Onboarding: {
                completed: Boolean(rawUser.Onboarding?.completed),
                step: Number(rawUser.Onboarding?.step) || 1
            },
            preferences: {
                dietaryRestrictions: (rawUser.preferences?.dietaryRestrictions || [])
                    .map((r: string) => r.toUpperCase())
                    .filter((r: string) => isValidEnum(r, DietaryRestriction)) as DietaryRestriction[],
                goals: (rawUser.preferences?.goals || [])
                    .filter((g: string) => isValidEnum(g, Goal)) as Goal[],
                preferredCategories: (rawUser.preferences?.preferredCategories || [])
                    .filter((c: string) => isValidEnum(c, FoodCategory)) as FoodCategory[],
                preferredCuisines: (rawUser.preferences?.preferredCuisines || [])
                    .filter((c: string) => isValidEnum(c, Cuisine)) as Cuisine[]
            },
            measurements: rawUser.measurements ? {
                weight: Number(rawUser.measurements.weight),
                height: Number(rawUser.measurements.height),
                age: Number(rawUser.measurements.age),
                activityLevel: rawUser.measurements.activityLevel,
                bmr: Number(rawUser.measurements.bmr),
                dailyCalories: Number(rawUser.measurements.dailyCalories)
            } : undefined,
            createdAt: rawUser.createdAt ? new Date(rawUser.createdAt) : undefined,
            updatedAt: rawUser.updatedAt ? new Date(rawUser.updatedAt) : undefined,
            lastLogin: rawUser.lastLogin ? new Date(rawUser.lastLogin) : undefined
        };
    } catch (error) {
        console.error('Error transforming user:', error);
        return null;
    }
};

export const useDataLoader = () => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setIsLoading(true);
                setError(null);

                // Cargar datos
                const rawIngredientsData = require('../assets/data/ingredients.json');
                const rawRecipesData = require('../assets/data/recipes.json');
                const rawUserData = require('../assets/data/users.json');

                // Primero transformar ingredientes
                const validIngredients = rawIngredientsData
                    .map(transformIngredient)
                    .filter(Boolean) as Ingredient[];

                // Luego transformar recetas usando los ingredientes transformados
                const validRecipes = rawRecipesData
                    .map((recipe: any) => transformRecipe(recipe, validIngredients))
                    .filter(Boolean) as Recipe[];

                setIngredients(validIngredients);
                setRecipes(validRecipes);
                setUser(transformUser(rawUserData));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                setError(errorMessage);
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    return { ingredients, recipes, user, isLoading, error };
};