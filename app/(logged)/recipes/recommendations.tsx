import { envConfig } from '@/configs/envConfig';
import { useData } from '@/context/DataProvider';
import { Recipe } from '@/types/types';
import React, { useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const RecommendationScreen = () => {
  const { currentRecommendations } = useData()
  

  const renderRecipeItem = ({ item }: {item: Recipe}) => (
    
    <TouchableOpacity style={styles.recipeItem}>
      <Image source={{uri: `${envConfig.IMAGE_SERVER_URL}/recipes/${item.image}`}} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeDescription}>{item.steps.join(' ')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recetas con tus ingredientes</Text>
      </View>
      <FlatList
        data={currentRecommendations}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.recipeList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto',
  },
  recipeList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#888888',
  },
});

export default RecommendationScreen;