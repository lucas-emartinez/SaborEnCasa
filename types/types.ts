type Ingredient = {
    id?: number;
    name: string;
    image?: string;
    calories?: number;
    unit?: food_unit;
    keywords?: string[];
};

type NutritionFacts = {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
};

type Recipe = {
    id: string;
    name: string;
    ingredients: Ingredient[];
    steps: string[];
    image: string;
    calories_per_serving: number;
    nutrition_facts: NutritionFacts;
    tags: string[];
};

type User = {
    id: number;
    name: string,
    email: string,
    image: string,
    preferences: UserPreferences;
}

type UserPreferences = {
    dietaryRestrictions: Restrictions;
    goals: Goals; 
    preferredIngredients: IngredientPreferences;
    preferredRecipes: RecipePreferences;
};

type Restrictions = ("celiac" | "diabetic" | "lactose_intolerant" | 
                    "vegan" | "vegetarian" | "fenilcetonuria" | 
                    "low_sodium" | "low_fat" | "no_flour" | "no_sugar" | "none")[];


type IngredientPreferences = ("red_meat" | "white_meat" | "fish" | "seafood" | "vegetables" | "fruits" | "cereals and grains" | "legumes" | "none")[];

type RecipePreferences = ("chinese" | "italian" | "mexican" | "japanese" | "fast_food" | "veggie" | "bakery" | "international" | "none")[];

type Goals = ("gain_muscle" | "lose_weight" | "reduce_carbs" | "reduce_fat" | "reduce_sugar" | "none")[];

type food_unit = "kg" | "l" | "ml" | "g" | "taza" | "unidad" | "cucharada" | "pizca" | "diente" | "tiras" | "hojas" | "ramas" | "dientes" | "rebanada";


export type { Ingredient, Recipe, UserPreferences, User, food_unit };