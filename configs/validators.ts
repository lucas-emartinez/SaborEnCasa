import { 
    FoodUnit, 
    FoodCategory, 
    DietaryRestriction, 
    Cuisine, 
    CulinaryCategory, 
    NutritionalProperty 
} from '@/types/enums';

// Helper function para validar enums
const isValidEnum = <T extends { [key: string]: string }>(
    value: string | undefined,
    enumObject: T
): boolean => {
    if (!value) return false;
    return Object.values(enumObject).includes(value);
};

// Validador para unit
const validateUnit = (unit: string | undefined): FoodUnit => {
    if (!unit || !isValidEnum(unit, FoodUnit)) {
        return FoodUnit.UNIT;
    }
    return unit as FoodUnit;
};

// Validador para category
const validateCategory = (category: string | undefined): FoodCategory => {
    if (!category || !isValidEnum(category, FoodCategory)) {
        return FoodCategory.OTHERS;
    }
    return category as FoodCategory;
};

// Validador para nutritional properties
const validateNutritionalProperties = (props: string[] | undefined): NutritionalProperty[] => {
    if (!props || !Array.isArray(props)) return [];
    return props.filter(prop => isValidEnum(prop, NutritionalProperty)) as NutritionalProperty[];
};

// Validador para restrictions
const validateRestrictions = (restrictions: string[] | undefined): DietaryRestriction[] => {
    if (!restrictions || !Array.isArray(restrictions)) return [DietaryRestriction.NONE];
    return restrictions.filter(r => isValidEnum(r, DietaryRestriction)) as DietaryRestriction[];
};

// Validador para cuisine
const validateCuisine = (cuisine: string | undefined): Cuisine => {
    if (!cuisine || !isValidEnum(cuisine, Cuisine)) {
        return Cuisine.INTERNATIONAL;
    }
    return cuisine as Cuisine;
};

// Validador para culinary category
const validateCulinaryCategory = (category: string | undefined): CulinaryCategory => {
    if (!category || !isValidEnum(category, CulinaryCategory)) {
        return CulinaryCategory.DINNER;
    }
    return category as CulinaryCategory;
};

export const validators = {
    validateUnit,
    validateCategory,
    validateNutritionalProperties,
    validateRestrictions,
    validateCuisine,
    validateCulinaryCategory
};