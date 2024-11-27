import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DietaryRestriction, Cuisine } from '@/types/enums';
import { translateDietaryRestriction, translateCuisine } from '@/utils/enum-translations';

const INGREDIENT_RANGES = [
  '1 a 5 ingredientes',
  '6 a 10 ingredientes',
  '11 a 15 ingredientes',
  'Más de 15 ingredientes'
];

const PRICE_RANGES = [
  '$0 - $2500',
  '$2500 - $5000',
  'Más de $5000'
];

const recipes = () => {
  const [selectedRestrictions, setSelectedRestrictions] = useState<Set<DietaryRestriction>>(new Set());
  const [selectedCuisines, setSelectedCuisines] = useState<Set<Cuisine>>(new Set());
  const [ingredientsRange, setIngredientsRange] = useState('1 a 5 ingredientes');
  const [priceRange, setPriceRange] = useState('$0 - $100');
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);

  const handleToggleRestriction = (restriction: DietaryRestriction) => {
    setSelectedRestrictions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(restriction)) {
        newSet.delete(restriction);
      } else {
        newSet.add(restriction);
      }
      return newSet;
    });
  };

  const handleToggleCuisine = (cuisine: Cuisine) => {
    setSelectedCuisines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cuisine)) {
        newSet.delete(cuisine);
      } else {
        newSet.add(cuisine);
      }
      return newSet;
    });
  };

  const renderModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalOption,
                  selectedValue === option && styles.modalOptionSelected
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedValue === option && styles.modalOptionTextSelected
                  ]}
                >
                  {option}
                </Text>
                {selectedValue === option && (
                  <Ionicons name="checkmark" size={24} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 30 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Que estas buscando?</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rango de precios</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setShowPriceModal(true)}
          >
            <Text style={styles.selectButtonText}>{priceRange}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estilo de receta</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {Object.values(Cuisine).map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.chip,
                    selectedCuisines.has(cuisine) && styles.chipSelected
                  ]}
                  onPress={() => handleToggleCuisine(cuisine)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedCuisines.has(cuisine) && styles.chipTextSelected
                  ]}>
                    {translateCuisine(cuisine)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restricción alimentaria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {Object.values(DietaryRestriction).map((restriction) => (
                <TouchableOpacity
                  key={restriction}
                  style={[
                    styles.chip,
                    selectedRestrictions.has(restriction) && styles.chipSelected
                  ]}
                  onPress={() => handleToggleRestriction(restriction)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedRestrictions.has(restriction) && styles.chipTextSelected
                  ]}>
                    {translateDietaryRestriction(restriction)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cantidad de ingredientes</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setShowIngredientsModal(true)}
          >
            <Text style={styles.selectButtonText}>{ingredientsRange}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => router.push({
            pathname: '/recommendations',
            params: {
              fromFilter: 'true',
              restrictions: Array.from(selectedRestrictions),
              cuisines: Array.from(selectedCuisines),
              ingredientsRange,
              priceRange
            },
          })} 
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>

        {renderModal(
          showIngredientsModal,
          () => setShowIngredientsModal(false),
          'Cantidad de ingredientes',
          INGREDIENT_RANGES,
          ingredientsRange,
          setIngredientsRange
        )}

        {renderModal(
          showPriceModal,
          () => setShowPriceModal(false),
          'Rango de precios',
          PRICE_RANGES,
          priceRange,
          setPriceRange
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: '#00C853',
  },
  chipText: {
    color: '#333',
  },
  chipTextSelected: {
    color: 'white',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalOptionSelected: {
    backgroundColor: '#00C853',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});

export default recipes;