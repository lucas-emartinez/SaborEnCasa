// context/DataContext.tsx
import React, { createContext, useContext } from "react";
import { Ingredient, Recipe } from "@/types/types";

interface DataContextType {
    ingredients: Ingredient[];
    recipes: Recipe[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{
    children: React.ReactNode;
    ingredients: Ingredient[];
    recipes: Recipe[];
}> = ({ children, ingredients, recipes }) => {
    return (
        <DataContext.Provider value={{ ingredients, recipes }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};