import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ingredient, Recipe } from '@/types/types';
import { useData } from '@/context/DataProvider';
import { envConfig } from '@/configs/envConfig';

const RecipeDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentRecommendations, currentRecipeIngredients } = useData();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [missingIngredients, setMissingIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    const foundRecipe = currentRecommendations.find(
      (r) => r.id.toString() === id
    );

    if (foundRecipe) {
      setRecipe(foundRecipe);
      // Calcular ingredientes faltantes
      const missing = foundRecipe.ingredients.filter(
        (ingredient) => !currentRecipeIngredients.find((i) => i.id === ingredient.id)
      );
      setMissingIngredients(missing);
    }
  }, [id, currentRecommendations, currentRecipeIngredients]);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Image
          source={{ uri: `${envConfig.IMAGE_SERVER_URL}/recipes/${recipe.image}` }}
          style={styles.recipeImage}
        />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{recipe.name}</Text>

          {missingIngredients.length > 0 && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={24} color="#FFA000" />
              <Text style={styles.warningText}>
                Te faltan {missingIngredients.length} ingredientes para esta receta
              </Text>
            </View>
          )}

          {/* Ingredientes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <Ionicons
                  name={missingIngredients.includes(ingredient) ? "close-circle" : "checkmark-circle"}
                  size={20}
                  color={missingIngredients.includes(ingredient) ? "#FF5252" : "#4CAF50"}
                />
                <Text
                  style={[
                    styles.ingredientText,
                    missingIngredients.includes(ingredient) && styles.missingIngredient
                  ]}
                >
                  {ingredient.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Pasos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preparación</Text>
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepBullet}>
                  <Ionicons name="radio-button-on" size={24} color="#2196F3" />
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Información nutricional */}
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
        </View>
      </ScrollView>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 8,
    color: '#F57C00',
    fontSize: 14,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  missingIngredient: {
    color: '#FF5252',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingRight: 16,
  },
  stepBullet: {
    marginRight: 12,
    paddingTop: 2,
  },
  stepText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    lineHeight: 24,
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
});

export default RecipeDetailScreen;