import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { 
    Ingredient, 
    Recipe, 
    User
} from "@/types/types";

interface DataContextType {
    ingredients: Ingredient[];
    recipes: Recipe[];
    user: User | null;
    currentRecommendations: Recipe[];
    setCurrentRecommendations: (recipes: Recipe[]) => void;
    updateUser: (userData: User) => void;
}

// Context creation
const DataContext = createContext<DataContextType | undefined>(undefined);

// Context provider
export const DataProvider: React.FC<{
    children: React.ReactNode;
    ingredientsData: Ingredient[];
    recipesData: Recipe[];
    userData: User | null;
}> = ({ children, ingredientsData, recipesData, userData }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [currentRecommendations, setCurrentRecommendations] = useState<Recipe[]>([]);

    useEffect(() => {
        setIngredients(ingredientsData);
        setRecipes(recipesData);
        setUser(userData);
    }, [ingredientsData, recipesData, userData]);

    const updateUser = (newUserData: User) => {
        setUser(newUserData);
    };

    const contextValue = {
        ingredients,
        recipes,
        user,
        currentRecommendations,
        setCurrentRecommendations,
        updateUser
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

// Custom hook for accessing the context
export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};

// Export types
export type { DataContextType };
