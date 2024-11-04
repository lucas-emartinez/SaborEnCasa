import React, { createContext, useContext, useEffect, useState } from "react";
import { Ingredient, Recipe, User } from "@/types/types";
import { useDataPersistence } from "@/service/storage";

interface DataContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  user: User | null;
  currentRecommendations: Recipe[];
  currentRecipeIngredients: Ingredient[];
  loading?: boolean;
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
}> = ({ children, ingredientsData, recipesData, userData, loading }) => {
  const [ingredients, setIngredientsState] = useState<Ingredient[]>([]);
  const [recipes, setRecipesState] = useState<Recipe[]>([]);
  const [user, setUserState] = useState<User | null>(null);
  const [currentRecipeIngredients, setCurrentRecipeIngredientsState] = useState<Ingredient[]>([]);
  const [currentRecommendations, setCurrentRecommendationsState] = useState<Recipe[]>([]);


  const {
    saveIngredients,
    saveRecipes,
    saveUser,
    saveRecommendations,
  } = useDataPersistence();

  // Wrappers para actualizar estado y persistir
  const setIngredients = async (newIngredients: Ingredient[]) => {
    try {
      await saveIngredients(newIngredients);
      setIngredientsState(newIngredients);
    } catch (error) {
      console.error('Error saving ingredients:', error);
    }
  };

  const setRecipes = async (newRecipes: Recipe[]) => {
    try {
      await saveRecipes(newRecipes);
      setRecipesState(newRecipes);
    } catch (error) {
      console.error('Error saving recipes:', error);
    }
  };

  const updateUser = async (newUserData: User) => {
    try {
      await saveUser(newUserData);
      setUserState(newUserData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const setCurrentRecommendations = async (newRecommendations: Recipe[]) => {
    try {
      await saveRecommendations(newRecommendations);
      setCurrentRecommendationsState(newRecommendations);
    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  };


  // Cargar datos iniciales
  useEffect(() => {
    setIngredients(ingredientsData);
    setRecipes(recipesData);
    setUserState(userData);
  }, [ingredientsData, recipesData, userData]);

  const contextValue = {
    ingredients,
    recipes,
    user,
    currentRecommendations,
    loading,
    currentRecipeIngredients,
    setCurrentRecipeIngredientsState,
    setCurrentRecommendations,
    updateUser,
    setIngredients,
    setRecipes,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export type { DataContextType };