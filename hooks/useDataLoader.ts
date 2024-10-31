// hooks/useDataLoader.ts
import { useState, useEffect } from 'react';
import { Ingredient, Recipe, food_unit, User } from "@/types/types";

// Transform and validate raw ingredient data
const transformIngredient = (rawIngredient: any): Ingredient | null => {
    try {

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
            image: rawIngredient.image,
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
    const [user, setUser] = useState<User | null>(null);
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
                const userData = require('../assets/data/users.json');

                setUser(userData);
                setIngredients(ingredientsData);
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

    return { ingredients, recipes, user, isLoading, error };
};
