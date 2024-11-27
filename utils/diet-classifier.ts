import { Recipe } from '@/types/types';
import { DietType } from '@/types/enums';

export function classifyRecipeDiet(recipe: Recipe): DietType[] {
    const diets: DietType[] = [];

    // Hipocalórica (basado en calorías por porción)
    if (recipe.calories_per_serving < 500) {
        diets.push(DietType.HIPOCALORICA);
    }

    // Cetogénica (alta en grasas, baja en carbohidratos)
    if (recipe.ingredients.some(ing =>
        ['aceite', 'aguacate', 'nueces', 'salmon', 'queso'].some(keyword =>
            ing.name.toLowerCase().includes(keyword)
        )) &&
        !recipe.ingredients.some(ing =>
            ['pasta', 'arroz', 'pan', 'azucar'].some(keyword =>
                ing.name.toLowerCase().includes(keyword)
            )
        )) {
        diets.push(DietType.CETOGENICA);
    }

    // PALEO
    if (recipe.ingredients.some(ing =>
        ['fruta', 'vegetales', 'carne', 'nueces'].some(keyword =>
            ing.name.toLowerCase().includes(keyword)
        )) &&
        !recipe.ingredients.some(ing =>
            ['procesado', 'embutido', 'frito'].some(keyword =>
                ing.name.toLowerCase().includes(keyword)
            )
        )) {
        diets.push(DietType.PALEO);



        // Detox
        if (recipe.ingredients.some(ing =>
            ['verdura', 'fruta', 'vegetales', 'jugo'].some(keyword =>
                ing.name.toLowerCase().includes(keyword)
            )) &&
            !recipe.ingredients.some(ing =>
                ['procesado', 'embutido', 'frito'].some(keyword =>
                    ing.name.toLowerCase().includes(keyword)
                )
            )) {
            diets.push(DietType.DETOX);
        }

        // Balanceada (si tiene proteínas, carbohidratos y grasas)
        if (
            recipe.ingredients.some(ing => ['carne', 'pollo', 'pescado', 'huevo', 'legumbres'].some(k => ing.name.toLowerCase().includes(k))) && // proteínas
            recipe.ingredients.some(ing => ['arroz', 'papa', 'pasta', 'quinoa'].some(k => ing.name.toLowerCase().includes(k))) && // carbohidratos
            recipe.ingredients.some(ing => ['aceite', 'aguacate', 'nueces'].some(k => ing.name.toLowerCase().includes(k))) // grasas
        ) {
            diets.push(DietType.BALANCEADA);
        }
    }

    // Si no califica para ninguna, la consideramos balanceada
    if (diets.length === 0) {
        diets.push(DietType.BALANCEADA);
    }

    return diets;
}
