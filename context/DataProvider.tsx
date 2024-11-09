import React, { createContext, useContext, useEffect, useState } from "react";
import { Ingredient, Recipe, ShoppingListItem, User } from "@/types/types";
import { useDataPersistence } from '@/service/storage';
import { LoadingScreen } from "@/components/LoadingScreen";

interface DataContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  user: User | null;
  currentRecommendations: Recipe[];
  currentRecipeIngredients: Ingredient[];
  loading?: boolean;
  favouriteRecipes: Recipe[];
  shoppingList: ShoppingListItem[];
  addToShoppingList: (items: ShoppingListItem[]) => Promise<void>;
  removeFromShoppingList: (ingredientIds: string[]) => Promise<void>;
  toggleFavourite: (recipe: Recipe) => Promise<void>;
  setCurrentRecipeIngredientsState: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  setCurrentRecommendations: (recipes: Recipe[]) => void;
  updateUser: (userData: User) => Promise<void>;
  setIngredients: (ingredients: Ingredient[]) => void;
  setRecipes: (recipes: Recipe[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{
  children: React.ReactNode;
  ingredientsData: Ingredient[];
  recipesData: Recipe[];
  userData: User | null;
  loading?: boolean;
}> = ({ children, ingredientsData, recipesData, userData, loading: externalLoading }) => {
  const [ingredients, setIngredientsState] = useState<Ingredient[]>(ingredientsData);
  const [recipes, setRecipesState] = useState<Recipe[]>(recipesData);
  const [user, setUserState] = useState<User | null>(userData);
  const [favouriteRecipes, setFavouriteRecipes] = useState<Recipe[]>([]);
  const [currentRecipeIngredients, setCurrentRecipeIngredientsState] = useState<Ingredient[]>([]);
  const [currentRecommendations, setCurrentRecommendationsState] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  const storage = useDataPersistence();

  const setIngredients = async (newIngredients: Ingredient[]) => {
    try {
      await storage.saveIngredients(newIngredients);
      setIngredientsState(newIngredients);
    } catch (error) {
      console.error('Error saving ingredients:', error);
    }
  };

  const setRecipes = async (newRecipes: Recipe[]) => {
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
        const completeFavourites = storedFavouriteIds
          .map(favouriteRecipe => {
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
      await storage.saveShoppingList(updatedList);
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
      await storage.saveShoppingList(updatedList);
      setShoppingList(updatedList);
    } catch (error) {
      console.error('Error removing from shopping list:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        await getFavoritesRecipes();
        await getShoppingList();
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Agregar recipes como dependencia para asegurarnos de que tenemos las recetas antes de cargar favoritos
    if (recipes.length > 0) {
      initializeData();
    }
  }, [recipes]); // Añadir recipes como dependencia

  const contextValue = {
    ingredients,
    recipes,
    user,
    favouriteRecipes,
    currentRecommendations,
    loading: isLoading || externalLoading,
    shoppingList,
    addToShoppingList,
    removeFromShoppingList,
    currentRecipeIngredients,
    setCurrentRecipeIngredientsState,
    setCurrentRecommendations: setCurrentRecommendationsState,
    updateUser: async (userData: User) => {
      try {
        await storage.saveUser(userData);
        setUserState(userData);
      } catch (error) {
        console.error('Error updating user:', error);
      }
    },
    setCurrentRecommendationsState,
    toggleFavourite,
    setIngredients,
    setRecipes,
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