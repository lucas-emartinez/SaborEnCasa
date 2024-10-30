// hooks/useDataLoader.ts
import { useState, useEffect } from 'react';
import { Ingredient, Recipe, food_unit } from "@/types/types";

// Helper function to validate if a string is a valid food_unit
const isValidFoodUnit = (unit: string): unit is food_unit => {
    const validUnits: food_unit[] = [
        "kg", "l", "ml", "g", "taza", "unidad", "cucharada",
        "pizca", "tiras", "hojas", "ramas", "diente", "rebanada",
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

export const useDataLoader = () => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setIsLoading(true);
                setError(null);

                // Cargar los archivos JSON de forma estática
                const ingredientsData = require('../assets/data/ingredients.json');
                const recipesData = require('../assets/data/recipes.json');

                // Transform and validate ingredients
                const validIngredients = ingredientsData
                    .map(transformIngredient)
                    .filter((ingredient: any): ingredient is Ingredient => ingredient !== null);

                setIngredients(validIngredients);
                setRecipes(recipesData);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    return { ingredients, recipes, isLoading, error };
};