import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '@/types/types';

interface RecipeDetailProps {
  recipe: Recipe;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe }) => {
  const { slug } = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header con botón de retroceso */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Imagen de la receta */}
        <Image
          source={{ uri: recipe.image }}
          style={styles.recipeImage}
        />

        {/* Información principal */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{recipe.name}</Text>
          <Text style={styles.description}>
            {recipe.steps[0]} {/* Primer paso como descripción */}
          </Text>

          {/* Información nutricional */}
          <View style={styles.nutritionContainer}>
            <Text style={styles.sectionTitle}>Valor nutricional</Text>
            <Text style={styles.portionText}>100g</Text>

            {/* Proteínas */}
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionLabelContainer}>
                <Ionicons name="leaf-outline" size={20} color="#4CAF50" />
                <Text style={styles.nutritionLabel}>Proteína</Text>
              </View>
              <Text style={styles.nutritionValue}>
                {recipe.nutrition_facts.protein}g
              </Text>
            </View>

            {/* Carbohidratos */}
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionLabelContainer}>
                <Ionicons name="grid-outline" size={20} color="#FFC107" />
                <Text style={styles.nutritionLabel}>Carbohidratos</Text>
              </View>
              <Text style={styles.nutritionValue}>
                {recipe.nutrition_facts.carbohydrates}g
              </Text>
            </View>

            {/* Grasas */}
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionLabelContainer}>
                <Ionicons name="water-outline" size={20} color="#FF9800" />
                <Text style={styles.nutritionLabel}>Grasas</Text>
              </View>
              <Text style={styles.nutritionValue}>
                {recipe.nutrition_facts.fat}g
              </Text>
            </View>
          </View>

          {/* Barra de navegación inferior */}
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="restaurant-outline" size={24} color="#666" />
              <Text style={styles.navText}>Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="book-outline" size={24} color="#666" />
              <Text style={styles.navText}>Recetas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="cart-outline" size={24} color="#666" />
              <Text style={styles.navText}>Compras</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="person-outline" size={24} color="#666" />
              <Text style={styles.navText}>Perfil</Text>
            </TouchableOpacity>
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
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  nutritionContainer: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default RecipeDetail;