import { 
    Recipe, 
    User, 
    Ingredient, 
    Restrictions, 
    Goals,
    IngredientPreferences,
    RecipePreferences 
} from "@/types/types";

export class RecipeRecommender {
    private readonly PREFERENCE_WEIGHT = 0.3;
    private readonly RESTRICTIONS_WEIGHT = 0.4;
    private readonly INGREDIENTS_WEIGHT = 0.2;
    private readonly GOALS_WEIGHT = 0.1;

    constructor(
        private recipes: Recipe[],
        private user: User | null,
        private userIngredients: Ingredient[],
    ) {}

    public getIngredients(): Ingredient[] {
        return this.userIngredients;
    }

    public getRecommendations(limit: number = 10): Array<Recipe & { matchScore: number }> {
        // Si no hay usuario o las preferencias están vacías, usar solo ingredientes
        if (!this.user || this.hasEmptyPreferences(this.user)) {
            const scoredRecipes = this.recipes.map(recipe => ({
                ...recipe,
                matchScore: this.calculateIngredientsScore(recipe)
            }));
    
            return scoredRecipes
                .filter(item => item.matchScore > 0)
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, limit);
        }
    
        // Si hay preferencias, usar el sistema completo de scoring
        const scoredRecipes = this.recipes.map(recipe => {
            const preferencesScore = this.calculatePreferencesScore(recipe);
            const restrictionsScore = this.calculateRestrictionsScore(recipe);
            const ingredientsScore = this.calculateIngredientsScore(recipe);
            const goalsScore = this.calculateGoalsScore(recipe);
    
            const totalScore = 
                preferencesScore * this.PREFERENCE_WEIGHT +
                restrictionsScore * this.RESTRICTIONS_WEIGHT +
                ingredientsScore * this.INGREDIENTS_WEIGHT +
                goalsScore * this.GOALS_WEIGHT;
    
            return {
                ...recipe,
                matchScore: totalScore,
                scores: {
                    preferences: preferencesScore,
                    restrictions: restrictionsScore,
                    ingredients: ingredientsScore,
                    goals: goalsScore
                }
            };
        });
    
        return scoredRecipes
            .filter(item => item.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }

    private hasEmptyPreferences(user: User): boolean {
        return (
            !user.preferences ||
            ((!user.preferences.goals || user.preferences.goals.includes("none")) &&
            (!user.preferences.preferredRecipes || user.preferences.preferredRecipes.includes("none")) &&
            (!user.preferences.dietaryRestrictions || user.preferences.dietaryRestrictions.includes("none")))
        );
    }

    private getIngredientBasedRecommendations(limit: number): Recipe[] {
        const scoredRecipes = this.recipes.map(recipe => ({
            recipe,
            score: this.calculateIngredientsScore(recipe)
        }));
    
        // Filtrar recetas que no tienen coincidencias antes de ordenar
        return scoredRecipes
            .filter(item => item.score > 0) // Solo recetas con coincidencias
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.recipe);
    }

    private calculateRecipeScore(recipe: Recipe): number {
        const preferencesScore = this.calculatePreferencesScore(recipe);
        const restrictionsScore = this.calculateRestrictionsScore(recipe);
        const ingredientsScore = this.calculateIngredientsScore(recipe);
        const goalsScore = this.calculateGoalsScore(recipe);

        return (
            preferencesScore * this.PREFERENCE_WEIGHT +
            restrictionsScore * this.RESTRICTIONS_WEIGHT +
            ingredientsScore * this.INGREDIENTS_WEIGHT +
            goalsScore * this.GOALS_WEIGHT
        );
    }

    private calculateIngredientsScore(recipe: Recipe): number {
        if (!this.userIngredients.length) return 0;
    
        const userIngredientsMap = new Map(
            this.userIngredients.map(ing => [ing?.name.toLowerCase(), ing])
        );

    
        let primaryMatches = 0;    // Coincidencias con el ingrediente principal
        let secondaryMatches = 0;  // Coincidencias con otros ingredientes

        recipe.ingredients.forEach(recipeIng => {
            if (!recipeIng?.name) return;
            const normalizedRecipeName = recipeIng?.name.toLowerCase();
            
            // Verificar si este ingrediente coincide con nuestro ingrediente principal
            const primaryMatch = this.userIngredients.find(userIng => 
                userIng?.name.toLowerCase() === normalizedRecipeName
            );
    
            if (primaryMatch) {
                primaryMatches++;
            } else {
                // Buscar coincidencias secundarias (por keywords)
                const secondaryMatch = this.userIngredients.some(userIng => {
                    const userKeywords = userIng?.keywords || [];
                    const recipeKeywords = recipeIng?.keywords || [];
                    return userKeywords.some(uk => 
                        recipeKeywords.some(rk => rk.toLowerCase() === uk.toLowerCase())
                    );
                });
    
                if (secondaryMatch) {
                    secondaryMatches++;
                }
            }
        });
    
        const score = (primaryMatches * 2.0 + secondaryMatches * 0.3);
        const normalizedScore = Math.min(1, score / recipe.ingredients?.length);
        
        console.log('Score breakdown:', {
            recipeName: recipe.name,
            primaryMatches,
            secondaryMatches,
            totalIngredients: recipe.ingredients?.length,
            rawScore: score,
            normalizedScore
        });
    
        return normalizedScore;
    }

    private calculatePreferencesScore(recipe: Recipe): number {
        if (!this.user?.preferences?.preferredRecipes) return 0;
        
        let score = 0;
        const prefs = this.user.preferences.preferredRecipes;
        
        recipe?.tags?.forEach(tag => {
            if (prefs.includes(tag as RecipePreferences)) {
                score += 1;
            }
        });

        return score / Math.max(1, recipe?.tags?.length);
    }

    private calculateRestrictionsScore(recipe: Recipe): number {
        if (!this.user?.preferences?.dietaryRestrictions) return 1;
        
        const restrictions = this.user.preferences.dietaryRestrictions;
        if (restrictions.includes("none")) return 1;

        let compatible = true;
        const restrictionChecks: Record<Restrictions[number], (recipe: Recipe) => boolean> = {
            "celiac": (r) => !r.ingredients.some(i => 
                i?.keywords.some(k => ["gluten", "trigo", "cebada", "centeno"].includes(k.toLowerCase()))),
            "diabetic": (r) => r.nutrition_facts.carbohydrates < 30,
            "lactose_intolerant": (r) => !r.ingredients.some(i => 
                i?.keywords.some(k => ["leche", "queso", "yogurt", "crema", "dairy", "milk"].includes(k.toLowerCase()))),
            "vegan": (r) => !r.ingredients.some(i => 
                i?.keywords.some(k => ["carne", "pescado", "leche", "miel", "milk", "seafood", "fish", "meat", "chicken", "pork"].includes(k.toLowerCase()))),
            "vegetarian": (r) => !r.ingredients.some(i => 
                i?.keywords.some(k => ["carne", "pescado", "pollo", "meat", "shrip", "seafood", "chicken", "pork"].includes(k.toLowerCase()))),
            "low_sodium": (r) => !r.ingredients.some(i => 
                i?.keywords.includes("salt")),
            "low_fat": (r) => r.nutrition_facts.fat < 10,
            "no_flour": (r) => !r.ingredients.some(i => 
                i?.keywords.includes("flour")),
            "no_sugar": (r) => !r.ingredients.some(i => 
                i?.keywords.includes("sugar")),
            "fenilcetonuria": (r) => !r.ingredients.some(i => 
                i?.keywords.some(k => ["aspartame", "fenilalanine"].includes(k.toLowerCase()))),
            "none": () => true
        };

        restrictions.forEach(restriction => {
            if (restrictionChecks[restriction] && !restrictionChecks[restriction](recipe)) {
                compatible = false;
            }
        });

        return compatible ? 1 : 0;
    }

    private calculateGoalsScore(recipe: Recipe): number {
        if (!this.user?.preferences?.goals) return 1;
        
        const goals = this.user.preferences.goals;
        if (goals.includes("none")) return 1;

        let score = 0;
        const totalChecks = goals.length;

        const goalChecks: Record<Goals[number], (recipe: Recipe) => boolean> = {
            "gain_muscle": (r) => r.nutrition_facts.protein > 20,
            "lose_weight": (r) => r.calories_per_serving < 500,
            "reduce_carbs": (r) => r.nutrition_facts.carbohydrates < 30,
            "reduce_fat": (r) => r.nutrition_facts.fat < 10,
            "reduce_sugar": (r) => !r.ingredients.some(i => 
                i?.keywords.includes("sugar")),
            "none": () => true
        };

        goals.forEach(goal => {
            if (goalChecks[goal] && goalChecks[goal](recipe)) {
                score += 1;
            }
        });

        return score / totalChecks;
    }
}

// Hook para usar el recomendador
export const useRecipeRecommendations = (
    recipes: Recipe[], 
    user: User | null,
    userIngredients: Ingredient[]
) => {
    const recommender = new RecipeRecommender(recipes, user, userIngredients);
    
    const getRecommendations = (limit: number = 10) => {
        return recommender.getRecommendations(limit);
    };

    const getIngredients = () => {
        return recommender.getIngredients();
    }

    return {
        getRecommendations,
        getIngredients
    };
};