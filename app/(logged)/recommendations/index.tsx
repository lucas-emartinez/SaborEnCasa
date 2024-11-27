import { envConfig } from '@/configs/envConfig';
import { useData } from '@/context/DataProvider';
import { Recipe } from '@/types/types';
import { Cuisine, DietaryRestriction, DietType } from '@/types/enums';
import { Ionicons } from '@expo/vector-icons';
import { translateCuisine, translateDietaryRestriction } from '@/utils/enum-translations';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, StatusBar, TextInput } from 'react-native';
import FavoriteButton from '@/components/FavoriteButton';
import { classifyRecipeDiet } from '@/utils/diet-classifier';

const RecommendationScreen = () => {
  const { currentRecommendations, recipes } = useData();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (params.fromFilter === 'true') {
      const restrictions = params.restrictions ?
        (Array.isArray(params.restrictions) ?
          params.restrictions : [params.restrictions]) as DietaryRestriction[] :
        [];

      const cuisines = params.cuisines ?
        (Array.isArray(params.cuisines) ?
          params.cuisines : [params.cuisines]) as Cuisine[] :
        [];

      const selectedDietType = params.dietType as DietType | undefined;

      let filtered = [...recipes];

      // Aplicar filtros de restricciones
      if (restrictions.length > 0) {
        filtered = filtered.filter(recipe =>
          restrictions.every(restriction =>
            recipe.restrictions.includes(restriction)
          )
        );
      }

      // Aplicar filtros de cocina
      if (cuisines.length > 0) {
        filtered = filtered.filter(recipe =>
          cuisines.includes(recipe.cuisine)
        );
      }

      // Aplicar filtro de tipo de dieta
      if (selectedDietType) {
        filtered = filtered.filter(recipe => {
          const recipeDiets = classifyRecipeDiet(recipe);
          return recipeDiets.includes(selectedDietType);
        });
      }

      if (params.ingredientsRange !== 'Cualquiera') {
        let minIngredients = 0;
        let maxIngredients = Infinity;

        if (params.ingredientsRange.includes('Más de')) {
          minIngredients = parseInt(params.ingredientsRange.replace('Más de', '').trim());
        } else {
          [minIngredients, maxIngredients] = params.ingredientsRange
            .replace('ingredientes', '')
            .split('a')
            .map(range => parseInt(range.trim()));
        }

        filtered = filtered.filter(recipe => recipe.ingredients.length >= minIngredients && recipe.ingredients.length <= maxIngredients);
      }

      // Aplicar filtro de precio
      if (params.priceRange !== 'Cualquiera') {
        let minPrice = 0;
        let maxPrice = Infinity;

        if (params.priceRange.includes('Más de')) {
          minPrice = parseInt(params.priceRange.replace('Más de $', '').trim());
        } else {
          [minPrice, maxPrice] = params.priceRange
            .replace(/\$/g, '')
            .split('-')
            .map(price => parseInt(price.trim().replace('$', '')));
        }

        filtered = filtered.filter(recipe => recipe.price >= minPrice && recipe.price <= maxPrice);
      }

      setFilteredRecipes(filtered);
    }
  }, []);

  // Filtrar por término de búsqueda
  const getDisplayedRecipes = () => {
    const baseRecipes = params.fromFilter === 'true' ?
      filteredRecipes :
      (currentRecommendations.length > 0 ? currentRecommendations : []);

    if (!searchTerm) return baseRecipes;

    return baseRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderTag = (text: string, type: 'cuisine' | 'restriction') => (
    <View style={[styles.tag, type === 'cuisine' ? styles.cuisineTag : styles.restrictionTag]}>
      <Text style={type === 'cuisine' ? styles.cuisineTagText : styles.tagText}>
        {text}
      </Text>
    </View>
  );

  const renderRecipeItem = ({ item }: { item: Recipe }) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => router.push({
          pathname: `/(logged)/recommendations/[id]`,
          params: { id: item.id, fromSearch: 'true' }
        })}
        style={styles.recipeItem}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${envConfig.IMAGE_SERVER_URL}/recipes/${item.image}` }}
            style={styles.recipeImage}
          />
          <FavoriteButton
            recipe={item}
            style={styles.favouriteButton}
          />
        </View>
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{item.name}</Text>

          <View style={styles.tagsContainer}>
            {renderTag(translateCuisine(item.cuisine), 'cuisine')}
            {item.restrictions.map((restriction, index) => (
              <React.Fragment key={`${item.id}-${restriction}-${index}`}>
                {renderTag(translateDietaryRestriction(restriction), 'restriction')}
              </React.Fragment>
            ))}
          </View>

          <Text numberOfLines={2} style={styles.recipeDescription}>
            {item.steps[0]}
          </Text>

          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              <Ionicons name="flame-outline" size={14} /> {item.calories_per_serving} kcal
            </Text>
            <Text style={styles.statsText}>
              <Ionicons name="time-outline" size={14} /> {item.steps.length * 5} min
            </Text>
            <Text style={styles.priceText}>
              <Ionicons name="pricetag-outline" size={14} /> ${item.price}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {params.fromFilter === 'true' ?
          'No se encontraron recetas' :
          'No hay recomendaciones disponibles'}
      </Text>
      <Text style={styles.emptyStateDescription}>
        {params.fromFilter === 'true' ?
          'Prueba ajustando los filtros de búsqueda' :
          'Vuelve más tarde para ver nuevas recomendaciones'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {params.fromFilter === 'true' ? 'Resultados' : 'Recetas Recomendadas'}
        </Text>
      </View>

      {params.fromFilter === 'true' && (
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar recetas..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#666"
          />
          {searchTerm !== '' && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchTerm('')}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={getDisplayedRecipes()}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.recipeList,
          getDisplayedRecipes().length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
  },
  recipeList: {
    padding: 16,
  },
  recipeItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  favouriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 24,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  cuisineTag: {
    backgroundColor: '#E3F2FD',
  },
  restrictionTag: {
    backgroundColor: '#1ab73f',
  },
  cuisineTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 14,
    color: '#1ab73f',
    fontWeight: '600',
  },
});

export default RecommendationScreen;