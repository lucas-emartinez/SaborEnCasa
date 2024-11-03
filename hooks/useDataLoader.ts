import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Ingredient,
    Recipe,
    User
} from "@/types/types";
import { Cuisine, DietaryRestriction, FoodCategory, Goal } from '@/types/enums';
import { validators } from '@/configs/validators';

// Keys para AsyncStorage
const STORAGE_KEYS = {
    INGREDIENTS: 'app_ingredients',
    RECIPES: 'app_recipes',
    USER: 'app_user',
} as const;

// Función auxiliar para validar enum
const isValidEnum = <T extends { [key: string]: string }>(
    value: string,
    enumObject: T
): value is T[keyof T] => {
    return Object.values(enumObject).includes(value);
};

// Transform and validate ingredient data
export const transformIngredient = (rawIngredient: any): Ingredient | null => {
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
export const transformRecipe = (
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
export const transformUser = (rawUser: any): User | null => {
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

// Funciones auxiliares para AsyncStorage
const saveToStorage = async (key: string, data: any): Promise<void> => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to AsyncStorage (${key}):`, error);
        throw error;
    }
};

const getFromStorage = async (key: string): Promise<any> => {
    try {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error reading from AsyncStorage (${key}):`, error);
        throw error;
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

                // Intentar cargar datos desde AsyncStorage primero
                const [storedIngredients, storedRecipes, storedUser] = await Promise.all([
                    getFromStorage(STORAGE_KEYS.INGREDIENTS),
                    getFromStorage(STORAGE_KEYS.RECIPES),
                    getFromStorage(STORAGE_KEYS.USER),
                ]);
                
                let validIngredients: Ingredient[] = [];
                let validRecipes: Recipe[] = [];
                let validUser: User | null = null;

                // Si no hay datos en AsyncStorage, cargar desde JSON
                if (!storedIngredients) {
                    const rawIngredientsData = require('../assets/data/ingredients.json');
                    validIngredients = rawIngredientsData
                        .map(transformIngredient)
                        .filter(Boolean) as Ingredient[];
                    
                    // Guardar en AsyncStorage
                    await saveToStorage(STORAGE_KEYS.INGREDIENTS, validIngredients);
                } else {
                    validIngredients = storedIngredients;
                }

                if (!storedRecipes) {
                    const rawRecipesData = require('../assets/data/recipes.json');
                    validRecipes = rawRecipesData
                        .map((recipe: any) => transformRecipe(recipe, validIngredients))
                        .filter(Boolean) as Recipe[];
                    
                    // Guardar en AsyncStorage
                    await saveToStorage(STORAGE_KEYS.RECIPES, validRecipes);
                } else {
                    validRecipes = storedRecipes;
                }

                if (!storedUser) {
                    const rawUserData = require('../assets/data/users.json');
                    validUser = transformUser(rawUserData);
                    if (validUser) {
                        // Guardar en AsyncStorage
                        await saveToStorage(STORAGE_KEYS.USER, validUser);
                    }
                } else {
                    validUser = storedUser;
                }

                setIngredients(validIngredients);
                setRecipes(validRecipes);
                setUser(validUser);
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

    // Funciones para actualizar datos
    const updateUser = async (newUserData: User) => {
        try {
            await saveToStorage(STORAGE_KEYS.USER, newUserData);
            setUser(newUserData);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    };

    const updateIngredients = async (newIngredients: Ingredient[]) => {
        try {
            await saveToStorage(STORAGE_KEYS.INGREDIENTS, newIngredients);
            setIngredients(newIngredients);
        } catch (error) {
            console.error('Error updating ingredients:', error);
            throw error;
        }
    };

    const updateRecipes = async (newRecipes: Recipe[]) => {
        try {
            await saveToStorage(STORAGE_KEYS.RECIPES, newRecipes);
            setRecipes(newRecipes);
        } catch (error) {
            console.error('Error updating recipes:', error);
            throw error;
        }
    };

    const clearAllData = async () => {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.INGREDIENTS,
                STORAGE_KEYS.RECIPES,
                STORAGE_KEYS.USER
            ]);
            setIngredients([]);
            setRecipes([]);
            setUser(null);
        } catch (error) {
            console.error('Error clearing data:', error);
            throw error;
        }
    };

    return {
        ingredients,
        recipes,
        user,
        isLoading,
        error,
        updateUser,
        updateIngredients,
        updateRecipes,
        clearAllData
    };
};