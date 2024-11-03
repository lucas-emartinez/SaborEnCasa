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
        
        // Coincidencia exacta del nombre principal
        if (searchTerms.some(term => normalizedName === term)) {
            score += 500; // Aumentamos significativamente el peso de coincidencias exactas
            matchedTerms.push(normalizedName);
        }
    
        // Coincidencia exacta en palabras clave
        searchTerms.forEach(term => {
            if (normalizedKeywords.has(term)) {
                score += 200;
                matchedKeywords.push(term);
            }
        });
    
        // Coincidencias parciales en el nombre del producto
        searchTerms.forEach(term => {
            // Coincidencia exacta de palabras individuales
            if (normalizedNameParts.includes(term)) {
                matchedTerms.push(term);
                score += 150;
            } else {
                // Coincidencias parciales con menor peso
                const nameMatch = normalizedNameParts.some(namePart => 
                    namePart.includes(term) || term.includes(namePart)
                );
                
                if (nameMatch) {
                    matchedTerms.push(term);
                    score += 50;
                }
            }
        });
        
        // Coincidencias en keywords con peso reducido
        searchTerms.forEach(term => {
            const keywordMatch = Array.from(normalizedKeywords).some(keyword => 
                keyword.includes(term) || term.includes(keyword)
            );
            
            if (keywordMatch && !matchedKeywords.includes(term)) {
                matchedKeywords.push(term);
                score += 20;
            }
        });
    
        // Coincidencias en categoría
        if (ingredient.category) {
            const categoryName = normalizeText(ingredient.category);
            const categoryMatch = searchTerms.some(term => categoryName === term);
            if (categoryMatch) {
                matchedCategories.push(ingredient.category);
                score += 100;
            }
        }
    
        // Penalizaciones
        // Penalizar ingredientes que no coinciden con la categoría esperada
        if (searchTerms.includes('arroz') && ingredient.category !== FoodCategory.GRAINS) {
            score -= 300;
        }
    
        // Penalizar ingredientes procesados cuando buscamos ingredientes básicos
        if (searchTerms.some(term => ['arroz', 'pan', 'carne'].includes(term)) && 
            normalizedName.includes('para')) {
            score -= 200;
        }
    
        return {
            ingredient,
            score,
            matchedTerms,
            matchedKeywords,
            matchedCategories
        };
    };

    const mapIngredientByName = useCallback((data: { 
        product?: { 
            product_name?: string;
            categories_tags?: string[];
            _keywords?: string[];
            nutriments?: any;
        } 
    }): Ingredient | null => {
        const name = data.product?.product_name;
        if (!name) return null;
    
        const normalizedName = normalizeText(name);
        // Verificar cache
        const cachedResult = mappingCache.get(normalizedName);
        if (cachedResult) return cachedResult;
    
        // Combinar términos de búsqueda dando prioridad a palabras clave específicas
        const searchTerms = [
            ...normalizeText(name).split(/\s+/),
            ...(data.product?._keywords || []).map(normalizeText),
            ...(data.product?.categories_tags || []).map(normalizeText)
        ].filter(term => term.length > 2);
    
        // Dar más peso a ciertas palabras clave importantes
        const importantKeywords = new Set(['arroz', 'pan', 'carne', 'pollo', 'pescado']);
        const weightedSearchTerms = searchTerms.filter(term => 
            importantKeywords.has(term) || term.length > 3
        );
    
        const matchResults = ingredientsList.map(ingredient => 
            calculateMatchScore(weightedSearchTerms, ingredient)
        );
    
        // Ordenar por puntuación y aplicar un umbral mínimo
        matchResults.sort((a, b) => b.score - a.score);
        
        // Solo devolver resultados con una puntuación mínima
        const bestMatch = matchResults[0];
        if (bestMatch?.score > 100) {
            // Debug log
            console.log('Best match:', {
                searchTerm: name,
                matchedIngredient: bestMatch.ingredient.name,
                score: bestMatch.score,
                matchedTerms: bestMatch.matchedTerms,
                matchedKeywords: bestMatch.matchedKeywords
            });
    
            setMappingCache(prev => new Map(prev.set(normalizedName, bestMatch.ingredient)));
            return bestMatch.ingredient;
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