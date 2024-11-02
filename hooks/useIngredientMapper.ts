import { useState, useCallback } from 'react';
import { Ingredient  } from "@/types/types";
import { FoodCategory } from '@/types/enums';

interface MatchResult {
    ingredient: Ingredient;
    score: number;
    matchedTerms: string[];
    matchedKeywords: string[];
    matchedCategories: FoodCategory[];
}

export const useIngredientMapper = (ingredientsList: Ingredient[]) => {
    const [mappingCache, setMappingCache] = useState<Map<string, Ingredient>>(new Map());

    const normalizeText = (text: string): string => {
        return text?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    };

    const calculateMatchScore = (searchTerms: string[], ingredient: Ingredient): MatchResult => {
        let score = 0;
        const matchedTerms: string[] = [];
        const matchedKeywords: string[] = [];
        const matchedCategories: FoodCategory[] = [];

        const normalizedName = normalizeText(ingredient.name);
        const normalizedNameParts = normalizedName.split(/\s+/);
        const normalizedKeywords = new Set(ingredient.keywords.map(normalizeText));
        
        // Coincidencias en el nombre del producto
        searchTerms.forEach(term => {
            const nameMatch = normalizedNameParts.some(namePart => 
                namePart === term || 
                term.includes(namePart) || 
                namePart.includes(term)
            );
            
            if (nameMatch) {
                matchedTerms.push(term);
                score += 100;
            }
        });
        
        // Boost por especificidad del nombre
        score += normalizedNameParts.length * 20;
        
        // Coincidencias en keywords
        searchTerms.forEach(term => {
            const keywordMatch = Array.from(normalizedKeywords).some(keyword => 
                keyword === term || 
                term.includes(keyword) || 
                keyword.includes(term)
            );
            
            if (keywordMatch) {
                matchedKeywords.push(term);
                score += 30;
            }
        });

        // Coincidencias en categoría
        if (ingredient.category) {
            const categoryName = normalizeText(ingredient.category);
            if (searchTerms.some(term => categoryName.includes(term))) {
                matchedCategories.push(ingredient.category);
                score += 50;
            }
        }

        // Boost por propiedades nutricionales
        if (ingredient.nutritionalProperties?.length) {
            const nutritionalMatches = searchTerms.filter(term => 
                ingredient.nutritionalProperties?.some(prop => 
                    normalizeText(prop).includes(term)
                )
            ).length;
            score += nutritionalMatches * 40;
        }
        
        // Penalización para nombres de producto de una sola palabra
        if (normalizedNameParts.length === 1) {
            score -= 50;
        }
        
        return {
            ingredient,
            score,
            matchedTerms,
            matchedKeywords,
            matchedCategories
        };
    };

    const findIngredientByKeywords = (searchTerm: string): Ingredient | null => {
        if (!searchTerm) return null;

        const normalizedSearch = normalizeText(searchTerm);
        // Dividir términos de búsqueda y filtrar palabras muy cortas
        const searchTerms = normalizedSearch.split(/\s+/).filter(term => term.length > 2);
        
        if (searchTerms.length === 0) return null;

        // Calcular puntuaciones para todos los ingredientes
        const matchResults: MatchResult[] = ingredientsList.map(ingredient => 
            calculateMatchScore(searchTerms, ingredient)
        );
        
        // Ordenar por puntuación
        matchResults.sort((a, b) => b.score - a.score);

        
        return matchResults[0]?.score > 0 ? matchResults[0].ingredient : null;
    };

    const mapIngredientByName = useCallback((data: { 
        product?: { 
            product_name?: string;
            categories_tags?: string[];
            nutriments?: any;
        } 
    }): Ingredient | null => {
        const name = data.product?.product_name;
        if (!name) return null;

        const normalizedName = normalizeText(name);
        // Verificar cache
        const cachedResult = mappingCache.get(normalizedName);
        if (cachedResult) return cachedResult;

        // Buscar coincidencia incluyendo categorías del producto si están disponibles
        const searchTerms = [
            name,
            ...(data.product?.categories_tags || [])
        ].join(' ');

        const matchedIngredient = findIngredientByKeywords(searchTerms);
        if (matchedIngredient) {
            // Actualizar cache
            setMappingCache(prev =>
                new Map(prev.set(normalizedName, matchedIngredient))
            );
            return matchedIngredient;
        }

        return null;
    }, [ingredientsList, mappingCache]);

    const clearCache = useCallback(() => {
        setMappingCache(new Map());
    }, []);

    // Nuevo método para encontrar ingredientes similares
    const findSimilarIngredients = useCallback((ingredient: Ingredient): Ingredient[] => {
        return ingredientsList
            .filter(ing => 
                ing.id !== ingredient.id && (
                    ing.category === ingredient.category ||
                    ing.nutritionalProperties?.some(prop => 
                        ingredient.nutritionalProperties?.includes(prop)
                    )
                )
            )
            .slice(0, 5);
    }, [ingredientsList]);

    return {
        mapIngredientByName,
        findSimilarIngredients,
        clearCache
    };
};