type Ingredient = {
    id: number;
    name: string;
    unit: food_unit;
    keywords: string[];
}

type Recipe = {
    id: number;
    name: string;
    ingredients: Ingredient[];
    restrictions: string[];
    nutritional_facts: {
        kcal_100g: number;
        carbs: number;
        fiber: number;
        protein: number;
        fat: number;
    }
    steps: string[];
    tags: string[];
    image: string;
}

type food_unit = "kg" | "l" | "ml" | "g" | "taza" | "unidad" | "cucharada" | "pizca" | "diente" | "tiras" | "hojas" | "ramas" | "dientes" | "rebanada";

export { Ingredient, Recipe, food_unit };