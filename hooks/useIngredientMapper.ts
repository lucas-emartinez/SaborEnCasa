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

    const calculateMatchScore = (searchTerms: string[], ingredient: Ingredient): number => {
        let score = 0;
        const normalizedName = normalizeText(ingredient.name);
        const normalizedNameParts = normalizedName.split(/\s+/);
        const normalizedKeywords = new Set(ingredient.keywords.map(normalizeText));
        
        // Count matching terms in the product name
        const matchingNameTerms = searchTerms.filter(term => 
            normalizedNameParts.some(namePart => 
                namePart === term || term.includes(namePart) || namePart.includes(term)
            )
        ).length;
        
        // Boost score based on how many words in the name match
        score += matchingNameTerms * 100;
        
        // Boost score for products with more specific names (more words)
        score += normalizedNameParts.length * 20;
        
        // Count matching keywords
        const matchingKeywords = searchTerms.filter(term => 
            Array.from(normalizedKeywords).some(keyword => 
                keyword === term || term.includes(keyword) || keyword.includes(term)
            )
        ).length;
        
        score += matchingKeywords * 30;
        
        // Penalize single-word product names that match
        if (normalizedNameParts.length === 1) {
            score -= 50;
        }
        
        return score;
    };

    const findIngredientByKeywords = (searchTerm: string): Ingredient | null => {
        const normalizedSearch = normalizeText(searchTerm);
        // Split search term into individual words and filter out very short words
        const searchTerms = normalizedSearch.split(/\s+/).filter(term => term.length > 2);
        
        // Calculate scores for all ingredients
        const scoredIngredients = ingredientsList.map(ingredient => ({
            ingredient,
            score: calculateMatchScore(searchTerms, ingredient)
        }));
        
        // Sort by score
        scoredIngredients.sort((a, b) => b.score - a.score);
        
        // Debug logging (remove in production)
        // console.log('Search terms:', searchTerms);
        // console.log('Scored matches:', scoredIngredients.map(({ingredient, score}) => ({
        //     name: ingredient.name,
        //     score,
        // })));
        
        // Return the highest scoring ingredient if it has a minimum score
        return scoredIngredients[0]?.score > 0 ? scoredIngredients[0].ingredient : null;
    };

    const mapIngredientByName = useCallback((data: any): Ingredient | null => {
        let name = data.product?.product_name;
        if (!name) return null;

        const normalizedName = normalizeText(name);
        // Check cache
        const cachedResult = mappingCache.get(normalizedName);
        if (cachedResult) return cachedResult;

        // Find match
        const matchedIngredient = findIngredientByKeywords(name);
        if (matchedIngredient) {
            // Update cache
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

    return {
        mapIngredientByName,
        clearCache
    };
};