import { DietaryRestriction, FoodCategory, Goal } from "@/types/enums";
import {
    Recipe,
    User,
    Ingredient
} from "@/types/types";
import { useCallback, useMemo, useState } from "react";

export class RecipeRecommender {
    private static instance: RecipeRecommender | null = null;

    static getInstance(recipes: Recipe[], user: User | null, ingredients: Ingredient[]): RecipeRecommender {
        if (!this.instance) {
            this.instance = new RecipeRecommender(recipes, user, ingredients);
        }
        return this.instance;
    }

    private readonly WEIGHTS = {
        EXACT_INGREDIENT_MATCH: 0.25,
        INGREDIENT_NAME_MATCH: 0.15,
        KEYWORD_MATCH: 0.15,
        CATEGORY_MATCH: 0.15,
        PREFERENCES_MATCH: 0.10,
        RESTRICTIONS_MATCH: 0.10,
        GOALS_MATCH: 0.10
    };

    private readonly MINIMUM_SCORE_THRESHOLD = 0.30; // 40% umbral mínimo
    private readonly NO_MATCH_PENALTY = 0.15; // Penalización por ingredientes sin match

    private constructor(
        private recipes: Recipe[],
        private user: User | null,
        private userIngredients: Ingredient[],
    ) { }

    /**
     * Método para recomendar recetas basadas en un único ingrediente.
     * Busca recetas que contengan específicamente ese ingrediente y las ordena
     * por relevancia del ingrediente en la receta.
     */
    public getSingleIngredientRecommendations(limit: number = 5): Array<Recipe & { matchScore: number }> {
        if (!this.userIngredients.length || !this.recipes.length) {
            return [];
        }

        const targetIngredient = this.userIngredients[0];
        const recipesMap = new Map<string, Recipe & { matchScore: number }>();

        this.recipes.forEach(recipe => {
            const matchingIngredient = recipe.ingredients.find(
                ing => ing.id === targetIngredient.id
            );

            if (matchingIngredient) {
                let score = 1.0;
                if (recipe.name.toLowerCase().includes(targetIngredient.name.toLowerCase())) {
                    score += 0.5;
                }

                const existingRecipe = recipesMap.get(recipe.id);
                if (!existingRecipe || existingRecipe.matchScore < score) {
                    recipesMap.set(recipe.id, {
                        ...recipe,
                        matchScore: score
                    });
                }
            }
        });

        return Array.from(recipesMap.values())
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }

    public getRecommendations(limit: number = 5): Array<Recipe & { matchScore: number }> {
        const uniqueRecipesMap = new Map<string, Recipe & { matchScore: number }>();

        this.recipes.forEach(recipe => {
            const score = this.calculateTotalScore(recipe);
            const existingRecipe = uniqueRecipesMap.get(recipe.id);

            if (!existingRecipe || existingRecipe.matchScore < score) {
                uniqueRecipesMap.set(recipe.id, {
                    ...recipe,
                    matchScore: score
                });
            }
        });

        return Array.from(uniqueRecipesMap.values())
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }

    /**
     * Método para recomendar recetas basadas en múltiples ingredientes.
     * Usa un algoritmo más complejo de matching con múltiples criterios.
     */
    public getMultiIngredientRecommendations(limit: number = 5): Array<Recipe & { matchScore: number }> {
        if (!this.recipes.length) {
            return [];
        }

        const scoredRecipes = this.recipes.map(recipe => {
            const score = this.calculateTotalScore(recipe);
            const nonMatchingIngredientsCount = this.calculateNonMatchingIngredientsCount(recipe);
            const penaltyFactor = nonMatchingIngredientsCount * this.NO_MATCH_PENALTY;
            const finalScore = Math.max(0, score - penaltyFactor);

            return {
                ...recipe,
                matchScore: finalScore
            };
        });

        // Usar un Map para mantener solo la versión con mejor puntaje de cada receta
        const uniqueRecipesMap = new Map<string, Recipe & { matchScore: number }>();

        scoredRecipes.forEach(recipe => {
            const existingRecipe = uniqueRecipesMap.get(recipe.id);
            if (!existingRecipe || existingRecipe.matchScore < recipe.matchScore) {
                uniqueRecipesMap.set(recipe.id, recipe);
            }
        });

        return Array.from(uniqueRecipesMap.values())
            .filter(recipe => recipe.matchScore >= this.MINIMUM_SCORE_THRESHOLD)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }


    private calculateNonMatchingIngredientsCount(recipe: Recipe): number {
        const userIngredientIds = new Set(this.userIngredients.map(ing => ing.id));
        const userIngredientNames = new Set(this.userIngredients.map(ing =>
            ing.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        ));
        const userCategories = new Set(this.userIngredients.map(ing => ing.category));

        let nonMatchingCount = 0;

        for (const recipeIngredient of recipe.ingredients) {
            const hasIdMatch = recipeIngredient.id && userIngredientIds.has(recipeIngredient.id);
            const hasNameMatch = userIngredientNames.has(
                recipeIngredient.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            );
            const hasCategoryMatch = userCategories.has(recipeIngredient.category);

            // Si no hay ningún tipo de match, incrementar el contador
            if (!hasIdMatch && !hasNameMatch && !hasCategoryMatch) {
                nonMatchingCount++;
            }
        }

        // Normalizar el contador basado en el total de ingredientes de la receta
        return nonMatchingCount / recipe.ingredients.length;
    }

    private calculateTotalScore(recipe: Recipe): number {
        const weightedScore = (
            (this.calculateExactIngredientMatch(recipe) * this.WEIGHTS.EXACT_INGREDIENT_MATCH) +
            (this.calculateNameMatch(recipe) * this.WEIGHTS.INGREDIENT_NAME_MATCH) +
            (this.calculateKeywordMatch(recipe) * this.WEIGHTS.KEYWORD_MATCH) +
            (this.calculateCategoryMatch(recipe) * this.WEIGHTS.CATEGORY_MATCH) +
            (this.calculatePreferencesMatch(recipe) * this.WEIGHTS.PREFERENCES_MATCH) +
            (this.calculateRestrictionsMatch(recipe) * this.WEIGHTS.RESTRICTIONS_MATCH) +
            (this.calculateGoalsMatch(recipe) * this.WEIGHTS.GOALS_MATCH)
        );

        return weightedScore;
    }

    private calculateExactIngredientMatch(recipe: Recipe): number {
        const userIngredientIds = new Set(
            this.userIngredients.map(ing => ing.id)
        );

        const matches = recipe.ingredients.filter(
            ing => ing.id && userIngredientIds.has(ing.id)
        ).length;

        return matches / recipe.ingredients.length;
    }

    private calculateNameMatch(recipe: Recipe): number {
        let matchScore = 0;

        const normalizeText = (text: string) =>
            text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        this.userIngredients.forEach(userIng => {
            const normalizedUserName = normalizeText(userIng.name);

            recipe.ingredients.forEach(recipeIng => {
                const normalizedRecipeName = normalizeText(recipeIng.name);

                if (normalizedRecipeName.includes(normalizedUserName) ||
                    normalizedUserName.includes(normalizedRecipeName)) {
                    matchScore += 1;
                }
            });

            if (normalizeText(recipe.name).includes(normalizedUserName)) {
                matchScore += 0.5;
            }
        });

        return Math.min(matchScore / recipe.ingredients.length, 1);
    }

    private calculateKeywordMatch(recipe: Recipe): number {
        let matchScore = 0;
        const userKeywords = this.userIngredients.flatMap(ing => ing.keywords);
        const recipeKeywords = [
            ...recipe.tags,
            ...recipe.ingredients.flatMap(ing => ing.keywords || [])
        ];

        const normalizeText = (text: string) =>
            text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        userKeywords.forEach(userKeyword => {
            const normalizedUserKeyword = normalizeText(userKeyword);

            recipeKeywords.forEach(recipeKeyword => {
                const normalizedRecipeKeyword = normalizeText(recipeKeyword);

                if (normalizedRecipeKeyword.includes(normalizedUserKeyword) ||
                    normalizedUserKeyword.includes(normalizedRecipeKeyword)) {
                    matchScore += 1;
                }
            });
        });

        return Math.min(matchScore / Math.max(recipeKeywords.length, 1), 1);
    }

    private calculateCategoryMatch(recipe: Recipe): number {
        const userCategories = new Set(
            this.userIngredients.map(ing => ing.category)
        );

        const matches = recipe.ingredients.filter(
            ing => userCategories.has(ing.category)
        ).length;

        return matches / recipe.ingredients.length;
    }

    private calculatePreferencesMatch(recipe: Recipe): number {
        if (!this.user?.preferences) return 1;

        let score = 0;
        const { preferredCuisines, preferredCategories } = this.user.preferences;

        if (preferredCuisines.includes(recipe.cuisine)) {
            score += 0.5;
        }

        const recipeCategories = new Set(
            recipe.ingredients.map(ing => ing.category)
        );

        const categoryMatches = [...recipeCategories].filter(
            category => preferredCategories.includes(category)
        ).length;

        score += 0.5 * (categoryMatches / recipeCategories.size);

        return score;
    }

    private calculateRestrictionsMatch(recipe: Recipe): number {
        if (!this.user?.preferences?.dietaryRestrictions?.length) return 1;
        if (this.user.preferences.dietaryRestrictions.includes(DietaryRestriction.NONE)) return 1;

        const userRestrictions = new Set(this.user.preferences.dietaryRestrictions);
        return recipe.restrictions.every(
            restriction => userRestrictions.has(restriction)
        ) ? 1 : 0;
    }

    private calculateGoalsMatch(recipe: Recipe): number {
        if (!this.user?.preferences?.goals?.length) return 1;
        if (this.user.preferences.goals.includes(Goal.NONE)) return 1;

        const goals = this.user.preferences.goals;
        let matchedGoals = 0;

        goals.forEach(goal => {
            switch (goal) {
                case Goal.GAIN_MUSCLE:
                    if (recipe.nutrition_facts.protein > 20) matchedGoals++;
                    break;
                case Goal.LOSE_WEIGHT:
                    if (recipe.calories_per_serving < 500) matchedGoals++;
                    break;
                case Goal.MAINTAIN_WEIGHT:
                    if (recipe.calories_per_serving < 800) matchedGoals++;
                    break;
                case Goal.REDUCE_FAT:
                    if (recipe.nutrition_facts.fat < 15) matchedGoals++;
                    break;
                case Goal.REDUCE_SUGAR:
                    if (!recipe.restrictions.includes(DietaryRestriction.NO_SUGAR)) matchedGoals++;
                    break;
                case Goal.REDUCE_CARBS:
                    if (recipe.nutrition_facts.carbohydrates < 30) matchedGoals++;
                    break;
            }
        });

        return matchedGoals / goals.length;
    }
}

// Hook para usar el recomendador
export const useRecipeRecommendations = (
    recipes: Recipe[],
    user: User | null,
    initialIngredients: Ingredient[] = []
) => {
    const [ingredients] = useState<Ingredient[]>(initialIngredients);
    const [isCalculating, setIsCalculating] = useState(true);


    // Use useMemo to maintain recommender instance
    const recommender = useMemo(() => {
        setIsCalculating(false);
        return RecipeRecommender.getInstance(recipes, user, ingredients);
    }, [recipes.length, user?.id, ingredients.length]);

    const getRecommendations = useCallback((limit: number = 5) => {
        setIsCalculating(false);
        return recommender.getRecommendations(limit);
    }, [recommender]);

    const getMultiIngredientRecommendations = useCallback((limit: number = 5) => {
        setIsCalculating(false);
        return recommender.getMultiIngredientRecommendations(limit);
    }, [recommender]);

    const getSingleIngredientRecommendations = useCallback((limit: number = 5) => {
        setIsCalculating(false);
        return recommender.getSingleIngredientRecommendations(limit);
    }, [recommender]);


    return {
        getMultiIngredientRecommendations,
        getSingleIngredientRecommendations,
        getRecommendations,
        ingredients,
        isCalculating
    };
};