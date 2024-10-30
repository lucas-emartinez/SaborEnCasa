import { useState, useCallback } from 'react';
import { Ingredient } from "@/types/types";

export const useIngredientMapper = (ingredientsList: Ingredient[]) => {
    const [mappingCache, setMappingCache] = useState<Map<string, Ingredient>>(new Map());

    const normalizeText = (text: any): string => {
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    };

    const findIngredientByKeywords = (searchTerm: string): Ingredient | null => {
        const normalizedSearch = normalizeText(searchTerm);

        // Primero buscar coincidencia exacta en nombres
        const exactNameMatch = ingredientsList.find(
            ing => normalizeText(ing.name) === normalizedSearch
        );
        if (exactNameMatch) return exactNameMatch;

        // Luego buscar coincidencia parcial en nombres
        const partialNameMatch = ingredientsList.find(
            ing => normalizeText(ing.name).includes(normalizedSearch) ||
                normalizedSearch.includes(normalizeText(ing.name))
        );
        if (partialNameMatch) return partialNameMatch;

        // Finalmente buscar en keywords
        return ingredientsList.find(ing =>
            ing.keywords.some(keyword =>
                normalizeText(keyword).includes(normalizedSearch) ||
                normalizedSearch.includes(normalizeText(keyword))
            )
        ) || null;
    };

    const mapIngredientByName = useCallback((data: any): Ingredient | null => {
        let name = data.product?.product_name
        if (!name) return null;
        // Verificar cache
        const cachedResult = mappingCache.get(normalizeText(name));
        if (cachedResult) return cachedResult;

        // Buscar coincidencia
        const matchedIngredient = findIngredientByKeywords(name);
        if (matchedIngredient) {
            // Actualizar cache
            setMappingCache(prev =>
                new Map(prev.set(normalizeText(name), matchedIngredient))
            );
            return matchedIngredient;
        }

        return null;
    }, [ingredientsList, mappingCache]);

    const clearCache = useCallback(() => {
        setMappingCache(new Map());
    }, []);

    return {
        mapIngredientByName,
        clearCache
    };
};