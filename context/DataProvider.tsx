import React, { createContext, useContext, useEffect, useState } from "react";
import { Ingredient, Recipe, ShoppingListItem, User } from "@/types/types";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, useDataPersistence } from '@/service/storage';
import { transformIngredient, transformRecipe, transformUser } from '@/utils/data-transformations';

interface DataContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  user: User | null;
  currentRecommendations: Recipe[];
  currentRecipeIngredients: Ingredient[];
  favouriteRecipes: Recipe[];
  shoppingList: ShoppingListItem[];
  isInitialized: boolean;
  isLoading: boolean;
  addToShoppingList: (items: ShoppingListItem[]) => Promise<void>;
  removeFromShoppingList: (ingredientIds: string[]) => Promise<void>;
  toggleFavourite: (recipe: Recipe) => Promise<void>;
  setCurrentRecipeIngredientsState: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  setCurrentRecommendations: (recipes: Recipe[]) => void;
  updateUser: (userData: User) => Promise<void>;
  reloadAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipesState] = useState<Recipe[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [favouriteRecipes, setFavouriteRecipes] = useState<Recipe[]>([]);
  const [currentRecipeIngredients, setCurrentRecipeIngredients] = useState<Ingredient[]>([]);
  const [currentRecommendations, setCurrentRecommendations] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const storage = useDataPersistence();

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // Cargar datos desde AsyncStorage
      const [
        storedIngredients,
        storedRecipes,
        storedUser,
        storedFavorites,
        storedShoppingList
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.INGREDIENTS),
        AsyncStorage.getItem(STORAGE_KEYS.RECIPES),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_RECIPES),
        AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LIST)
      ]);

      let validIngredients: Ingredient[] = [];
      let validRecipes: Recipe[] = [];
      let validUser: User | null = null;
      let validFavorites: Recipe[] = [];
      let validShoppingList: ShoppingListItem[] = [];

      // Procesar ingredientes
      if (storedIngredients) {
        validIngredients = JSON.parse(storedIngredients);
      } else {
        const rawIngredientsData = require('../assets/data/ingredients.json');
        validIngredients = rawIngredientsData
          .map(transformIngredient)
          .filter(Boolean) as Ingredient[];
        await AsyncStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(validIngredients));
      }

      // Procesar recetas
      if (storedRecipes) {
        validRecipes = JSON.parse(storedRecipes);
      } else {
        const rawRecipesData = require('../assets/data/recipes.json');
        validRecipes = rawRecipesData
          .map((recipe: any) => transformRecipe(recipe, validIngredients))
          .filter(Boolean) as Recipe[];
        await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(validRecipes));
      }

      // Procesar usuario
      if (storedUser) {
        validUser = JSON.parse(storedUser);
      } else {
        const rawUserData = require('../assets/data/users.json');
        validUser = transformUser(rawUserData);
        if (validUser) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(validUser));
        }
      }

      // Procesar favoritos
      if (storedFavorites) {
        const favoriteIds = JSON.parse(storedFavorites);
        validFavorites = validRecipes.filter(recipe =>
          favoriteIds.some((fav: any) => fav.id === recipe.id)
        );
      }

      // Procesar lista de compras
      if (storedShoppingList) {
        validShoppingList = JSON.parse(storedShoppingList);
      }

      setIngredients(validIngredients);
      setRecipesState(validRecipes);
      setUser(validUser);
      setFavouriteRecipes(validFavorites);
      setShoppingList(validShoppingList);
      setIsInitialized(true);

    } catch (error) {
      console.error('Error loading initial data:', error);
      setError(error instanceof Error ? error.message : 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  };


  const saveIngredients = async (newIngredients: Ingredient[]) => {
    try {
      await storage.saveIngredients(newIngredients);
      setIngredients(newIngredients);
    } catch (error) {
      console.error('Error saving ingredients:', error);
    }
  };

  const saveRecipes = async (newRecipes: Recipe[]) => {
    try {
      await storage.saveRecipes(newRecipes);
      setRecipesState(newRecipes);
    } catch (error) {
      console.error('Error saving recipes:', error);
    }
  };

  const toggleFavourite = async (recipe: Recipe) => {
    try {
      const isCurrentlyFavourite = favouriteRecipes.some(fav => fav.id === recipe.id);
      const newFavourites = isCurrentlyFavourite
        ? favouriteRecipes.filter(fav => fav.id !== recipe.id)
        : [...favouriteRecipes, recipe];

      await storage.saveFavoritesRecipes(newFavourites);
      setFavouriteRecipes(newFavourites);
    } catch (error) {
      console.error('Error toggling favourite:', error);
    }
  };

  const getFavoritesRecipes = async () => {
    try {
      const storedFavouriteIds = await storage.getFavoritesRecipes();
      if (storedFavouriteIds && storedFavouriteIds.length > 0) {
        // Mapear los IDs a las recetas completas desde recipes
        interface FavouriteRecipe {
          id: string;
        }

        const completeFavourites: Recipe[] = (storedFavouriteIds as FavouriteRecipe[])
          .map((favouriteRecipe: FavouriteRecipe) => {
            const completeRecipe = recipes.find(r => r.id === favouriteRecipe.id);
            return completeRecipe || null;
          })
          .filter((recipe): recipe is Recipe => recipe !== null);

        setFavouriteRecipes(completeFavourites);
      }
    } catch (error) {
      console.error('Error getting favourites:', error);
    }
  };

  const getShoppingList = async () => {
    try {
      const storedList = await storage.getShoppingList();
      setShoppingList(storedList);
    } catch (error) {
      console.error('Error getting shopping list:', error);
    }
  };

  const addToShoppingList = async (items: ShoppingListItem[]) => {
    try {
      const currentIds = new Set(shoppingList.map(item => item.ingredient.id));
      const newItems = items.filter(item => !currentIds.has(item.ingredient.id));
      const updatedList = [...shoppingList, ...newItems];

      // Guardar en AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(updatedList));
      setShoppingList(updatedList);
    } catch (error) {
      console.error('Error adding to shopping list:', error);
    }
  };

  const removeFromShoppingList = async (ingredientIds: string[]) => {
    try {
      const updatedList = shoppingList.filter(
        item => item.ingredient.id !== undefined && !ingredientIds.includes(item.ingredient.id.toString())
      );

      // Guardar en AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(updatedList));
      setShoppingList(updatedList);
    } catch (error) {
      console.error('Error removing from shopping list:', error);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const updateUser = async (userData: User) => {
    try {
      await storage.saveUser(userData);
      setUser(userData);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const markIngredientAsOwned = async (ingredient: Ingredient) => {
    try {
      if (!user) return;

      const updatedUser: User = {
        ...user,
        ingredients: [
          ...(user.ingredients || []),
          {
            id: ingredient.id!,
            name: ingredient.name,
            quantity: ingredient.quantity!.toString(),
            addedAt: new Date()
          }
        ]
      };

      await storage.saveUser(updatedUser);
      setUser(updatedUser);

      // No modificamos currentRecipeIngredients aquí

      if (ingredient.id !== undefined) {
        await removeFromShoppingList([ingredient.id.toString()]);
      }

    } catch (error) {
      throw new Error('Error marking ingredient as owned');
    }
  };

  const reloadAllData = async () => {
    await loadInitialData();
  };

  const contextValue = {
    ingredients,
    recipes,
    user,
    favouriteRecipes,
    currentRecommendations,
    currentRecipeIngredients,
    isInitialized,
    isLoading,
    shoppingList,
    markIngredientAsOwned,
    saveIngredients,
    removeFromShoppingList,
    setCurrentRecipeIngredientsState: setCurrentRecipeIngredients,
    setCurrentRecommendations,
    addToShoppingList,
    saveRecipes,
    getShoppingList,
    getFavoritesRecipes,
    updateUser,
    toggleFavourite,
    reloadAllData,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};


const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export { useData };