import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ingredient, Recipe, ShoppingListItem } from '@/types/types';
import { useData } from '@/context/DataProvider';
import { envConfig } from '@/configs/envConfig';
import FavoriteButton from '@/components/FavoriteButton';
import { translateFoodUnit } from '@/utils/enum-translations';
import Toast from '@/components/Toast';

const width = Dimensions.get('window').width;

const RecipeDetailScreen = () => {
  const { id, fromSearch, fromFilter } = useLocalSearchParams();
  const router = useRouter();
  const {
    currentRecommendations,
    currentRecipeIngredients,
    addToShoppingList,
    user,
    recipes
  } = useData();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [missingIngredients, setMissingIngredients] = useState<Ingredient[]>([]);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    let foundRecipe: Recipe | null = null;

    if (fromSearch) {
      foundRecipe = recipes.find(r => r.id === id) || null;
    } else {
      foundRecipe = currentRecommendations.find(
        (r) => r.id.toString() === id
      ) || null;
    }

    if (foundRecipe) {
      setRecipe(foundRecipe);

      // Calcular ingredientes faltantes considerando también los ingredientes del usuario
      const missing = foundRecipe.ingredients.filter((ingredient) => {
        const isInCurrentRecipe = currentRecipeIngredients.some(i => i.id === ingredient.id);
        const isInUserIngredients = user?.ingredients?.some(i => i.id === ingredient.id);
        return !isInCurrentRecipe && !isInUserIngredients;
      });
      setMissingIngredients(missing || []);
    }
  }, [id, fromSearch, currentRecommendations, currentRecipeIngredients, user?.ingredients, recipes]);

  const isIngredientMissing = (ingredient: Ingredient): boolean => {
    const isInCurrentRecipe = currentRecipeIngredients.some(i => i.id === ingredient.id);
    const isInUserIngredients = user?.ingredients?.some(i => i.id === ingredient.id);
    return !isInCurrentRecipe && !isInUserIngredients;
  };

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.loadingText}>Cargando receta...</Text>
      </SafeAreaView>
    );
  }

  const handleAddToShoppingList = async () => {
    if (!recipe || !missingIngredients.length) return;

    const shoppingItems: ShoppingListItem[] = missingIngredients.map(ingredient => ({
      ingredient,
      quantity: recipe.ingredients.find(i => i.id === ingredient.id)?.quantity || 0,
      recipeId: recipe.id,
      recipeName: recipe.name,
      addedAt: new Date() // Agregamos la fecha de creación
    }));

    await addToShoppingList(shoppingItems);
    setToastVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <FavoriteButton recipe={recipe} style={styles.favouriteButton} />
        <Image
          source={{ uri: `${envConfig.IMAGE_SERVER_URL}/recipes/${recipe.image}` }}
          style={styles.recipeImage}
        />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{recipe.name}</Text>

          <View style={styles.nutritionContainer}>
            <Text style={styles.sectionTitle}>Valor nutricional</Text>
            <Text style={styles.portionText}>100g</Text>

            <View style={styles.nutritionRow}>
              <View style={styles.nutritionLabelContainer}>
                <Ionicons name="leaf-outline" size={20} color="#4CAF50" />
                <Text style={styles.nutritionLabel}>Proteína</Text>
              </View>
              <Text style={styles.nutritionValue}>
                {recipe.nutrition_facts.protein}g
              </Text>
            </View>

            <View style={styles.nutritionRow}>
              <View style={styles.nutritionLabelContainer}>
                <Ionicons name="grid-outline" size={20} color="#FFC107" />
                <Text style={styles.nutritionLabel}>Carbohidratos</Text>
              </View>
              <Text style={styles.nutritionValue}>
                {recipe.nutrition_facts.carbohydrates}g
              </Text>
            </View>

            <View style={styles.nutritionRow}>
              <View style={styles.nutritionLabelContainer}>
                <Ionicons name="water-outline" size={20} color="#FF9800" />
                <Text style={styles.nutritionLabel}>Grasas</Text>
              </View>
              <Text style={styles.nutritionValue}>
                {recipe.nutrition_facts.fat}g
              </Text>
            </View>

            <View style={styles.nutritionRow}>
              <View style={styles.nutritionLabelContainer}>
                <Ionicons name="nutrition" size={20} color="#FF9800" />
                <Text style={styles.nutritionLabel}>Fibra</Text>
              </View>
              <Text style={styles.nutritionValue}>
                {recipe.nutrition_facts.fiber}g
              </Text>
            </View>
          </View>

          {missingIngredients.length > 0 && (
            <View style={styles.warningContainer}>
              <View style={styles.warningContent}>
                <Ionicons name="warning" size={24} color="#FFA000" />
                <Text style={styles.warningText}>
                  Te faltan {missingIngredients.length} ingredientes para esta receta
                </Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.ingredientsSection}>
              <Text style={styles.sectionTitle}>Ingredientes</Text>
              {missingIngredients.length > 0 && (
                <TouchableOpacity
                  style={styles.addToShoppingListButton}
                  onPress={handleAddToShoppingList}
                >
                  <Ionicons name="cart" size={20} color="#4CAF50" />
                  <Text style={styles.addToShoppingListText}>
                    Agregar faltantes a lista de compras
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.sectionContainer}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <Ionicons
                    name={isIngredientMissing(ingredient) ? "close-circle" : "checkmark-circle"}
                    size={20}
                    color={isIngredientMissing(ingredient) ? "#FF5252" : "#4CAF50"}
                  />
                  <Text
                    style={[
                      styles.ingredientText,
                      isIngredientMissing(ingredient) && styles.missingIngredient
                    ]}
                  >
                    {ingredient.name} - {ingredient.quantity} {translateFoodUnit(ingredient)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preparación</Text>
            <View style={styles.sectionContainer}>
              {recipe.steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepBullet}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        </ScrollView>
      <Toast
        visible={toastVisible}
        message="Ingredientes agregados a la lista de compras"
        type="success"
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 8,
  },
  favouriteButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
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
  addToShoppingListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  addToShoppingListText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  recipeImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  warningContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    marginLeft: 12,
    color: '#F57C00',
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  missingIngredient: {
    color: '#FF5252',
  },
  sectionContainer: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 16,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingRight: 16,
  },
  stepBullet: {
    width: 32,
    height: 32,
    backgroundColor: '#1d7dde',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
  },
  nutritionContainer: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  portionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nutritionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  ingredientsSection: {
    flexDirection: width > 400 ? 'row' : 'column',
    justifyContent: width > 400 ? 'space-between' : 'flex-start',
    alignItems: width > 400 ? 'center' : 'flex-start',
    marginBottom: 12,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 4,
  },
  clearButton: {
    padding: 4,
  },
  searchResults: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
  backButtonWithSearch: {
    top: 120,
  },
});

export default RecipeDetailScreen;