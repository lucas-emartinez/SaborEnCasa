// storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ingredient, Recipe, ShoppingListItem, User } from "@/types/types";
import { useEffect, useState } from 'react';
import { transformIngredient, transformRecipe, transformUser } from '@/utils/data-transformations';

// Keys para AsyncStorage
const STORAGE_KEYS = {
  INGREDIENTS: 'app_ingredients',
  RECIPES: 'app_recipes',
  USER: 'app_user',
  RECOMMENDATIONS: 'app_recommendations',
  FAVORITE_RECIPES: 'app_favorite_recipes',
  SHOPPING_LIST: 'app_shopping_list',
} as const;

class StorageService {
  static async saveData<T>(key: string, data: T): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      throw error;
    }
  }

  static async getData<T>(key: string): Promise<T | null> {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      return jsonData ? JSON.parse(jsonData) : null;
    } catch (error) {
      console.error(`Error reading data for key ${key}:`, error);
      throw error;
    }
  }

  static async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw error;
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

// Hook para cargar datos
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

        // Intentar cargar desde AsyncStorage primero
        let validIngredients = await StorageService.getData<Ingredient[]>(STORAGE_KEYS.INGREDIENTS);
        let validRecipes = await StorageService.getData<Recipe[]>(STORAGE_KEYS.RECIPES);
        let userData = await StorageService.getData<User>(STORAGE_KEYS.USER);

        // Si no hay datos en storage, cargar desde archivos JSON
        if (!validIngredients) {
          const rawIngredientsData = require('../assets/data/ingredients.json');
          validIngredients = rawIngredientsData
            .map(transformIngredient)
            .filter(Boolean) as Ingredient[];
          await StorageService.saveData(STORAGE_KEYS.INGREDIENTS, validIngredients);
        }

        if (!validRecipes) {
          const rawRecipesData = require('../assets/data/recipes.json');
          validRecipes = rawRecipesData
            .map((recipe: any) => transformRecipe(recipe, validIngredients))
            .filter(Boolean) as Recipe[];
          await StorageService.saveData(STORAGE_KEYS.RECIPES, validRecipes);
        }

        if (!userData) {
          const rawUserData = require('../assets/data/users.json');
          userData = transformUser(rawUserData);
          if (userData) {
            await StorageService.saveData(STORAGE_KEYS.USER, userData);
          }
        }

        setIngredients(validIngredients || []);
        setRecipes(validRecipes || []);
        setUser(userData);
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

// Hook para persistir datos
export const useDataPersistence = () => {
  const saveIngredients = async (ingredients: Ingredient[]): Promise<void> => {
    await StorageService.saveData(STORAGE_KEYS.INGREDIENTS, ingredients);
  };

  const saveRecipes = async (recipes: Recipe[]): Promise<void> => {
    await StorageService.saveData(STORAGE_KEYS.RECIPES, recipes);
  };

  const saveUser = async (user: User | null): Promise<void> => {
    await StorageService.saveData(STORAGE_KEYS.USER, user);
  };

  const saveFavoritesRecipes = async (recipes: Recipe[]): Promise<void> => {
    await StorageService.saveData(STORAGE_KEYS.FAVORITE_RECIPES, recipes);
  }

  const getFavoritesRecipes = async (): Promise<Recipe[]> => {
    const recipes = await StorageService.getData<Recipe[]>(STORAGE_KEYS.FAVORITE_RECIPES);
    return recipes || []
  }

  const saveRecommendations = async (recommendations: Recipe[]): Promise<void> => {
    await StorageService.saveData(STORAGE_KEYS.RECOMMENDATIONS, recommendations);
  };

  const getShoppingList = async (): Promise<ShoppingListItem[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading shopping list:', error);
      return [];
    }
  }

  const saveShoppingList = async (items: ShoppingListItem[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving shopping list:', error);
      throw error;
    }
  }

  return {
    saveIngredients,
    saveRecipes,
    saveUser,
    saveRecommendations,
    saveFavoritesRecipes,
    getFavoritesRecipes,
    getShoppingList,
    saveShoppingList
  };
};

export { STORAGE_KEYS, StorageService };