import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  StyleSheet 
} from 'react-native';
import { Ingredient } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';

interface SearchIngredientModalProps {
  visible: boolean;
  onClose: () => void;
  knownIngredients: Ingredient[];
  onSelectIngredient: (ingredient: Ingredient) => void;
}

const SearchIngredientModal: React.FC<SearchIngredientModalProps> = ({
  visible,
  onClose,
  knownIngredients,
  onSelectIngredient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredIngredients = knownIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectIngredient = useCallback((ingredient: Ingredient) => {
    onSelectIngredient(ingredient);
    onClose();
  }, [onSelectIngredient, onClose]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Buscar Ingrediente</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ingrediente..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <FlatList
            data={filteredIngredients}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.ingredientItem}
                onPress={() => handleSelectIngredient(item)}
              >
                <Text style={styles.ingredientName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  ingredientItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ingredientName: {
    fontSize: 16,
  },
});

export default SearchIngredientModal;