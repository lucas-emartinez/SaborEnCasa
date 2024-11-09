import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Ingredient,
    Recipe,
    User
} from "@/types/types";
import { STORAGE_KEYS } from '@/service/storage';
import { transformIngredient, transformRecipe, transformUser } from '@/utils/data-transformations';

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
                const [storedIngredients, storedRecipes, storedUser, storedFavoritesRecipes] = await Promise.all([
                    getFromStorage(STORAGE_KEYS.INGREDIENTS),
                    getFromStorage(STORAGE_KEYS.RECIPES),
                    getFromStorage(STORAGE_KEYS.USER),
                    getFromStorage(STORAGE_KEYS.FAVORITE_RECIPES)
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