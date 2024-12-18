import { DietaryRestriction, FoodCategory, Goal } from "@/types/enums";
import {
    Recipe,
    User,
    Ingredient
} from "@/types/types";

export class RecipeRecommender {

    private readonly WEIGHTS = {
        EXACT_INGREDIENT_MATCH: 0.25,
        INGREDIENT_NAME_MATCH: 0.15,
        KEYWORD_MATCH: 0.15,
        CATEGORY_MATCH: 0.05,
        PREFERENCES_MATCH: 0.05,
        RESTRICTIONS_MATCH: 0.30,
        GOALS_MATCH: 0.10
    };

    private readonly MINIMUM_SCORE_THRESHOLD = 0.10; // 40% umbral mínimo

    public constructor(
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
        const recommendedRecipes = this.recipes
            .filter(recipe => recipe.ingredients.some(ing => ing.id === targetIngredient.id))
            .map(recipe => {
                let score = 1.0;
                if (recipe.name.toLowerCase().includes(targetIngredient.name.toLowerCase())) {
                    score += 0.5;
                }
                return { ...recipe, matchScore: score };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        return recommendedRecipes;
    }

    public getRecommendations(limit: number = 5, from_home = false): Array<Recipe & { matchScore: number }> {
        const uniqueRecipesMap = new Map<string, Recipe & { matchScore: number }>();

        this.recipes.forEach(recipe => {
            const score = this.calculateTotalScore(recipe, from_home = false);
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
        if (!this.userIngredients.length || !this.recipes.length) {
            return [];
        }

        const userIngredientIds = new Set(this.userIngredients.map(ing => ing.id));

        const recommendedRecipes = this.recipes
            .filter(recipe =>
                // Asegurar que al menos un ingrediente del usuario está en la receta
                recipe.ingredients.some(ing => ing.id && userIngredientIds.has(ing.id))
            )
            .map(recipe => ({
                ...recipe,
                matchScore: this.calculateTotalScore(recipe)
            }))
            .slice(0, limit);
        
        return recommendedRecipes;
    }

    private calculateTotalScore(recipe: Recipe, from_home = false): number {
        // Primero verificar restricciones - si no cumple, retornar 0
        if (this.calculateRestrictionsMatch(recipe) === 0) {
            return 0;
        }

        // Si pasa las restricciones, calcular el resto del score
        return from_home ?
            (this.calculateCategoryMatch(recipe) * this.WEIGHTS.CATEGORY_MATCH) +
            (this.calculatePreferencesMatch(recipe) * this.WEIGHTS.PREFERENCES_MATCH) +
            (this.calculateGoalsMatch(recipe) * this.WEIGHTS.GOALS_MATCH)
            :
            (this.calculateExactIngredientMatch(recipe) * this.WEIGHTS.EXACT_INGREDIENT_MATCH) +
            (this.calculateNameMatch(recipe) * this.WEIGHTS.INGREDIENT_NAME_MATCH) +
            (this.calculateKeywordMatch(recipe) * this.WEIGHTS.KEYWORD_MATCH) +
            (this.calculateCategoryMatch(recipe) * this.WEIGHTS.CATEGORY_MATCH) +
            (this.calculatePreferencesMatch(recipe) * this.WEIGHTS.PREFERENCES_MATCH) +
            (this.calculateGoalsMatch(recipe) * this.WEIGHTS.GOALS_MATCH);
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

        // Si el usuario tiene restricciones, la receta debe tenerlas también
        return this.user.preferences.dietaryRestrictions.every(
            restriction => recipe.restrictions.includes(restriction)
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
