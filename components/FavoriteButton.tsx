// components/FavoriteButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '@/types/types';
import { useData } from '@/context/DataProvider';

interface FavoriteButtonProps {
    recipe: Recipe;
    size?: number;
    style?: object;
}

const FavoriteButton = ({ recipe, size = 24, style }: FavoriteButtonProps) => {
    const { favouriteRecipes, toggleFavourite } = useData();
    const isFavourite = favouriteRecipes.some(fav => fav.id === recipe.id);

    return (
        <TouchableOpacity
            style={[styles.favouriteButton, style]}
            onPress={() => toggleFavourite(recipe)}
        >
            <Ionicons
                name={isFavourite ? "heart" : "heart-outline"}
                size={size}
                color={isFavourite ? "#FF4081" : "#666666"}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    favouriteButton: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default FavoriteButton;