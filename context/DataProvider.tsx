import React, { createContext, useContext, useEffect, useState } from "react";
import { Ingredient, Recipe, User, food_unit } from "@/types/types";

interface DataContextType {
    ingredients: Ingredient[];
    recipes: Recipe[];
    user: User | null;
}

// Helper function to validate if a string is a valid food_unit
const isValidFoodUnit = (unit: string): unit is food_unit => {
    const validUnits: food_unit[] = [
        "kg", "l", "ml", "g", "taza", "unidad", "cucharada",
        "pizca", "tiras", "hojas", "ramas", "dientes"
    ];
    return validUnits.includes(unit as food_unit);
};

// Transform and validate raw ingredient data
const transformIngredient = (rawIngredient: any): Ingredient | null => {
    try {
        // Validate unit
        if (!isValidFoodUnit(rawIngredient.unit)) {
            console.warn(`Invalid unit "${rawIngredient.unit}" for ingredient "${rawIngredient.name}"`);
            // Map common units to valid ones
            const unitMapping: { [key: string]: food_unit } = {
                "rebanada": "unidad",
                "diente": "unidad"
            };
            rawIngredient.unit = unitMapping[rawIngredient.unit] || "unidad";
        }

        // Validate required fields
        if (
            typeof rawIngredient.id !== 'number' ||
            typeof rawIngredient.name !== 'string' ||
            !Array.isArray(rawIngredient.keywords)
        ) {
            console.error(`Invalid ingredient data structure for ${rawIngredient.name || 'unknown ingredient'}`);
            return null;
        }

        return {
            id: rawIngredient.id,
            name: rawIngredient.name,
            unit: rawIngredient.unit as food_unit,
            keywords: rawIngredient.keywords
        };
    } catch (error) {
        console.error(`Error transforming ingredient:`, error);
        return null;
    }
};

// Context creation
const DataContext = createContext<DataContextType | undefined>(undefined);

// Context provider
export const DataProvider: React.FC<{
    children: React.ReactNode,
    rawIngredientsData: any[],
    rawRecipesData: Recipe[],
    userData: User | null,
}> = ({ children, rawIngredientsData, rawRecipesData }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Transform and validate ingredients data
        const validIngredients = rawIngredientsData
            .map(transformIngredient)
            .filter((ingredient): ingredient is Ingredient => ingredient !== null);

        setIngredients(validIngredients);
        setRecipes(rawRecipesData);
        setUser(user)
    }, [rawIngredientsData, rawRecipesData]);

    return (
        <DataContext.Provider value={{ ingredients, recipes, user }}>
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