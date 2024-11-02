import { Goal, NutritionalProperty } from "@/types/enums";
import { 
    Recipe, 
    User, 
    Ingredient,
} from "@/types/types";
import { useCallback, useMemo, useState } from "react";

export class RecipeRecommender {
    private readonly INGREDIENT_MATCH_WEIGHT = 0.6;
    private readonly PREFERENCE_WEIGHT = 0.2;
    private readonly RESTRICTIONS_WEIGHT = 0.15;
    private readonly GOALS_WEIGHT = 0.05;
    private readonly MINIMUM_SCORE_THRESHOLD = 0.30; // Umbral mínimo del 30%

    constructor(
        private recipes: Recipe[],
        private user: User | null,
        private userIngredients: Ingredient[],
    ) {}

    public getMultiIngredientRecommendations(limit: number): Array<Recipe & { matchScore: number }> {
        const scoredRecipes = this.recipes.map(recipe => {
            const ingredientsScore = this.calculateIngredientsScore(recipe);
            const preferencesScore = this.calculatePreferencesScore(recipe);
            const restrictionsScore = this.calculateRestrictionsScore(recipe);
            const goalsScore = this.calculateGoalsScore(recipe);
    
            const totalScore = 
                (ingredientsScore * this.INGREDIENT_MATCH_WEIGHT) +
                (preferencesScore * this.PREFERENCE_WEIGHT) +
                (restrictionsScore * this.RESTRICTIONS_WEIGHT) +
                (goalsScore * this.GOALS_WEIGHT);
    
            return {
                ...recipe,
                matchScore: totalScore
            };
        });
    
        // Filtrar recetas con score válido y por encima del umbral
        return scoredRecipes
            .filter(item => 
                !isNaN(item.matchScore) && 
                item.matchScore >= this.MINIMUM_SCORE_THRESHOLD
            )
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }

    private calculateIngredientsScore(recipe: Recipe): number {

        if (!this.userIngredients.length || !recipe.ingredients.length) {
            return 0;
        }

        let totalScore = 0;
        const userIngredientIds = new Set(this.userIngredients.map(ing => ing.id));
    
        // Calcular puntuación para ingredientes principales
        const mainIngredients = recipe.ingredients.filter(ing => 
            this.isMainIngredient(ing, recipe)
        );

    
        // Puntuación por coincidencia de ingredientes principales
        for (const ingredient of mainIngredients) {
            if (ingredient.id && userIngredientIds.has(ingredient.id)) {
                totalScore += 1.0;
            }
        }
    
        // Puntuación por coincidencia de ingredientes secundarios
        const secondaryIngredients = recipe.ingredients.filter(ing => 
            !mainIngredients.includes(ing)
        );
    
        for (const ingredient of secondaryIngredients) {
            if (ingredient.id && userIngredientIds.has(ingredient.id)) {
                totalScore += 0.3;
            }
        }
    
        // Calcular puntuación adicional por categoría
        const userCategories = new Set(this.userIngredients.map(ing => ing.category));
        for (const ingredient of recipe.ingredients) {
            if (ingredient.category && userCategories.has(ingredient.category)) {
                totalScore += 0.1;
            }
        }
    
        // Evitar división por cero
        const maxPossibleScore = Math.max(
            mainIngredients.length + (secondaryIngredients.length * 0.3),
            1
        );
    
        const normalizedScore = totalScore / maxPossibleScore;
    
        return normalizedScore;
    }
    
    private isMainIngredient(ingredient: Ingredient, recipe: Recipe): boolean {
        // 1. Está en el nombre de la receta
        const inName = recipe.name.toLowerCase().includes(ingredient.name.toLowerCase());
        
        // 2. Es una proteína principal o carbohidrato base
        const isMainProtein = ingredient.category === "MEAT" || 
                            ingredient.category === "FISH" ||
                            ingredient.category === "LEGUMES";
        
        const isMainCarb = ingredient.category === "GRAINS" && 
                          ["arroz", "pasta", "rice", "noodles"].some(term => 
                              ingredient.name.toLowerCase().includes(term));

        // 3. Tiene una cantidad significativa
        const hasSignificantQuantity = ingredient.quantity 
            ? ingredient.quantity > 100 
            : false;

        return inName || isMainProtein || isMainCarb || hasSignificantQuantity;
    }

    public getSingleIngredientRecommendations(limit: number): Array<Recipe & { matchScore: number }> {
        const targetIngredient = this.userIngredients[0];
        console.log('Buscando recetas para:', targetIngredient.name);

        const matchingRecipes = this.recipes
            .map(recipe => {
                // Buscar coincidencia exacta por ID
                const hasExactMatch = recipe.ingredients.some(
                    ing => ing.id === targetIngredient.id
                );

                if (!hasExactMatch) {
                    return null;
                }

                // Para recetas que contienen el ingrediente, calcular un score basado en:
                // 1. Si el ingrediente está en el nombre de la receta (+0.3)
                // 2. Si es un ingrediente principal (+0.2)
                // 3. La cantidad relativa del ingrediente en la receta (+0.5 max)
                let score = 1.0; // Base score por tener el ingrediente

                // Bonus por nombre
                if (recipe.name.toLowerCase().includes(targetIngredient.name.toLowerCase())) {
                    score += 0.3;
                }

                // Bonus por ser ingrediente principal
                const matchingIngredient = recipe.ingredients.find(ing => ing.id === targetIngredient.id);
                if (matchingIngredient && this.isMainIngredient(matchingIngredient, recipe)) {
                    score += 0.2;
                }

                console.debug('Match found:', {
                    recipeName: recipe.name,
                    score,
                    hasIngredient: true
                });

                return {
                    ...recipe,
                    matchScore: score
                };
            })
            .filter((recipe): recipe is Recipe & { matchScore: number } => 
                recipe !== null
            )
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        return matchingRecipes;
    }

    private calculatePreferencesScore(recipe: Recipe): number {
        if (!this.user?.preferences) return 0;
        
        let score = 0;
        const totalChecks = 2; // Cuisine y Categories
        
        // Verificar cuisine
        if (this.user.preferences.preferredCuisines.includes(recipe.cuisine)) {
            score += 1;
        }

        // Verificar categorías de ingredientes preferidas
        const preferredCategories = this.user.preferences.preferredCategories;
        const recipeCategories = new Set(
            recipe.ingredients
                .map(ing => ing.category)
                .filter(Boolean)
        );

        const categoryMatchCount = [...recipeCategories].filter(category => 
            preferredCategories.includes(category)
        ).length;

        if (categoryMatchCount > 0) {
            score += categoryMatchCount / recipeCategories.size;
        }

        return score / totalChecks;
    }

    private calculateRestrictionsScore(recipe: Recipe): number {
        if (!this.user?.preferences?.dietaryRestrictions.length) return 1;
        
        // Verificar si la receta cumple con todas las restricciones del usuario
        const userRestrictions = new Set(this.user.preferences.dietaryRestrictions);
        return recipe.restrictions.every(restriction => 
            userRestrictions.has(restriction)
        ) ? 1 : 0;
    }

    private calculateGoalsScore(recipe: Recipe): number {
        if (!this.user?.preferences?.goals) return 1;
        
        const goals = this.user.preferences.goals;
        if (goals.includes(Goal.NONE)) return 1;

        let score = 0;
        const totalChecks = goals.length;

        const goalChecks: Record<Goal, (recipe: Recipe) => boolean> = {
            [Goal.GAIN_MUSCLE]: (r) => r.nutrition_facts.protein > 20,
            [Goal.LOSE_WEIGHT]: (r) => r.calories_per_serving < 500,
            [Goal.REDUCE_CARBS]: (r) => r.nutrition_facts.carbohydrates < 30,
            [Goal.REDUCE_FAT]: (r) => r.nutrition_facts.fat < 10,
            [Goal.REDUCE_SUGAR]: (r) => !recipe.ingredients.some(i => 
                i.nutritionalProperties?.includes(NutritionalProperty.HIGH_SUGAR)
            ),
            [Goal.NONE]: () => true,
            [Goal.MAINTAIN_WEIGHT]: (r) => r.calories_per_serving < 800
        };

        goals.forEach(goal => {
            if (goalChecks[goal](recipe)) {
                score += 1;
            }
        });

        return score / totalChecks;
    }
}

// Hook actualizado
export const useRecipeRecommendations = (
    recipes: Recipe[], 
    user: User | null,
    initialIngredients: Ingredient[] = []
) => {
    const [ingredients] = useState<Ingredient[]>(initialIngredients);
    
    const recommender = useMemo(() => {
        return new RecipeRecommender(recipes, user, ingredients);
    }, [recipes, user, ingredients]);

    const getRecommendations = useCallback((limit: number = 5) => {
        return recommender.getMultiIngredientRecommendations(limit);
    }, [recommender]);

    const getSimpleRecommendation = useCallback((limit: number = 5) => {
        return recommender.getSingleIngredientRecommendations(limit);
    }, [recommender]);

    return {
        getRecommendations,
        getSimpleRecommendation,
        ingredients
    };
};