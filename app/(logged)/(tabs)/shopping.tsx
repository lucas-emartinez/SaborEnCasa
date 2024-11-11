import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, StatusBar, Alert } from 'react-native';
import { useData } from '@/context/DataProvider';

interface Ingredient {
  id: number;
  name: string;
  quantity: string;
}

interface ShoppingItem {
  ingredient: Ingredient;
}

const Shopping = () => {
  const { shoppingList, removeFromShoppingList } = useData();

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
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const allIds = shoppingList.map(item => item.ingredient.id.toString());
              await removeFromShoppingList(allIds);
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar la lista');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Lista de Compras</Text>
          <Text style={styles.subtitle}>
            {shoppingList.length} {shoppingList.length === 1 ? 'ingrediente' : 'ingredientes'}
          </Text>
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
          shoppingList.map(({ingredient}: ShoppingItem, index: number) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.quantity}>Cantidad: {ingredient.quantity}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleRemoveItem(ingredient.id)}
                  style={styles.removeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              No hay ingredientes en la lista de compras
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Agregá ingredientes desde las recetas tocando "Agregar faltantes a lista de compras"
            </Text>
          </View>
        )}
      </ScrollView>

      {shoppingList.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearList}
          >
            <Text style={styles.clearButtonText}>Limpiar Lista</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBar: {
    backgroundColor: '#22C55E',
    height: StatusBar.currentHeight,
  },
  header: {
    backgroundColor: '#22C55E',
  },
  headerContent: {
    padding: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientInfo: {
    flex: 1,
    marginRight: 16,
  },
  ingredientName: {
    fontSize: 18,
    fontWeight: '500',
  },
  quantity: {
    color: '#666',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  removeText: {
    fontSize: 20,
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    marginTop: 8,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
  },
  clearButton: {
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Shopping;