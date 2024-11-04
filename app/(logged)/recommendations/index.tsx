import { envConfig } from '@/configs/envConfig';
import { useData } from '@/context/DataProvider';
import { Recipe } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, StatusBar } from 'react-native';

const RecommendationScreen = () => {
  const { currentRecommendations } = useData();
  const router = useRouter();

  const renderTag = (text: string, type: 'cuisine' | 'restriction') => (
    <View style={[styles.tag, type === 'cuisine' ? styles.cuisineTag : styles.restrictionTag]}>
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity onPress={() => router.push({pathname: `/(logged)/(tabs)/recipes/[id]`, params: { id: item.id }})} style={styles.recipeItem}>
      <Image 
        source={{ uri: `${envConfig.IMAGE_SERVER_URL}/recipes/${item.image}` }}
        style={styles.recipeImage}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        
        <View style={styles.tagsContainer}>
          {renderTag(item.cuisine, 'cuisine')}
          {item.restrictions.map((restriction, index) => (
            renderTag(restriction, 'restriction')
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
        </View>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.title}>Recetas Recomendadas</Text>
      </View>

      <FlatList
        data={currentRecommendations}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.recipeList}
        showsVerticalScrollIndicator={false}
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
    shadowOpacity: 0.1,
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
    backgroundColor: '#FFF3E0',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
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
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
});

export default RecommendationScreen;