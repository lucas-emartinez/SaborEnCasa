import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useData } from '@/context/DataProvider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ingredient, User, ShoppingListItem } from '@/types/types';

const Shopping = () => {

  const { 
    shoppingList, 
    removeFromShoppingList, 
    markIngredientAsOwned 
  } = useData();
  
  const handleMarkAsOwned = async (ingredient: Ingredient) => {
    try {
      await markIngredientAsOwned(ingredient);
    } catch (error) {
      Alert.alert('Error', 'No se pudo marcar el ingrediente como obtenido');
    }
  };

  const handleRemoveItem = async (ingredientId: number) => {
    try {
      const idArray = [ingredientId.toString()];
      await removeFromShoppingList(idArray);
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el ingrediente');
    }
  };

  const handleClearList = () => {
    Alert.alert(
      'Limpiar lista',
      '¿Estás seguro que querés eliminar todos los ingredientes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const allIds = shoppingList
                .map(item => item.ingredient.id)
                .filter(id => id !== undefined)
                .map(id => id!.toString());
              await removeFromShoppingList(allIds);
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar la lista');
            }
          },
        },
      ]
    );
  };

  const groupedItems = shoppingList.reduce((acc: { [key: string]: ShoppingListItem[] }, item) => {
    const date = new Date(item.ingredient.addedAt).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.titleContainer}>
                <Ionicons name="basket-outline" size={28} color="#fff" style={styles.headerIcon} />
                <Text style={styles.title}>Lista de Compras</Text>
              </View>
              {shoppingList.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearAllButton}
                  onPress={handleClearList}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{shoppingList.length}</Text>
                <Text style={styles.statLabel}>
                  {shoppingList.length === 1 ? 'Ingrediente' : 'Ingredientes'}
                </Text>
              </View>
            </View>
          </View>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.scrollContent,
          !shoppingList.length && styles.emptyStateContainer
        ]}
      >
        {shoppingList.length > 0 ? (
          Object.entries(groupedItems).map(([date, items]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {items.map(({ingredient, recipeName}) => (
                <View key={ingredient.id} style={styles.card}>
                  <View style={styles.cardContent}>
                    <View style={styles.ingredientInfo}>
                      <Text style={styles.ingredientName}>{ingredient.name}</Text>
                      <Text style={styles.quantity}>Cantidad: {ingredient.quantity}</Text>
                      <Text style={styles.recipeReference}>Para: {recipeName}</Text>
                    </View>
                    <View style={styles.buttonGroup}>
                      <TouchableOpacity 
                        onPress={() => handleMarkAsOwned(ingredient)}
                        style={styles.ownedButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="checkmark-circle" size={24} color="#2EBD59" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleRemoveItem(ingredient.id!)}
                        style={styles.removeButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="basket-outline" size={80} color="#2EBD59" style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>
              Lista de compras vacía
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Agregá ingredientes desde las recetas tocando "Agregar faltantes a lista de compras"
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#4CAF50'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  clearAllButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 24,
    paddingHorizontal: 4,
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientInfo: {
    flex: 1,
    marginRight: 16,
  },
  ingredientName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  quantity: {
    color: '#666',
    fontSize: 15,
    marginBottom: 4,
  },
  recipeReference: {
    color: '#1DB954',
    fontSize: 13,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ownedButton: {
    padding: 8,
    backgroundColor: 'rgba(46, 189, 89, 0.1)',
    borderRadius: 20,
  },
  removeButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.9,
  },
  emptyStateTitle: {
    fontSize: 20,
    color: '#2c3e50',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  emptyStateSubtitle: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});

export default Shopping;