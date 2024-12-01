import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DietaryRestriction, Cuisine, DietType } from '@/types/enums';
import { translateDietaryRestriction, translateCuisine } from '@/utils/enum-translations';

const INGREDIENT_RANGES = [
  'Cualquiera',
  '1 a 5 ingredientes',
  '6 a 10 ingredientes',
  '11 a 15 ingredientes',
  'Más de 15 ingredientes'
];

const PRICE_RANGES = [
  'Cualquiera',
  '$0 - $2500',
  '$2500 - $5000',
  'Más de $5000'
];

const recipes = () => {
  const [selectedRestrictions, setSelectedRestrictions] = useState<Set<DietaryRestriction>>(new Set());
  const [selectedCuisines, setSelectedCuisines] = useState<Set<Cuisine>>(new Set());
  const [selectedDietTypes, setSelectedDietTypes] = useState<Set<DietType>>(new Set());
  const [ingredientsRange, setIngredientsRange] = useState('Cualquiera');
  const [priceRange, setPriceRange] = useState('Cualquiera');
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showDietTypeModal, setShowDietTypeModal] = useState(false);

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

  const handleToggleDietType = (dietType: DietType) => {
    setSelectedDietTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dietType)) {
        newSet.delete(dietType);
      } else {
        newSet.add(dietType);
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
      <View style={styles.mainContainer}>
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
            <Text style={styles.sectionTitle}>Tipo de dieta</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowDietTypeModal(true)}
            >
              <Text style={styles.selectButtonText}>
                {selectedDietTypes.size > 0 
                  ? Array.from(selectedDietTypes).map(dt => dt).join(', ')
                  : 'Selecciona un tipo de dieta'}
              </Text>
            </TouchableOpacity>
            {selectedDietTypes.size > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                <View style={styles.chipContainer}>
                  {Array.from(selectedDietTypes).map((dietType) => (
                    <TouchableOpacity
                      key={dietType}
                      style={[styles.chip, styles.chipSelected]}
                      onPress={() => handleToggleDietType(dietType)}
                    >
                      <Text style={[styles.chipText, styles.chipTextSelected]}>
                        {dietType}
                        <Ionicons name="close" size={16} color="white" />
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
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
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/recommendations',
              params: {
                fromFilter: 'true',
                restrictions: Array.from(selectedRestrictions),
                cuisines: Array.from(selectedCuisines),
                dietTypes: Array.from(selectedDietTypes),
                ingredientsRange,
                priceRange
              },
            })}
            style={styles.searchButton}
          >
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

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

        <Modal
          animationType="slide"
          transparent={true}
          visible={showDietTypeModal}
          onRequestClose={() => setShowDietTypeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tipo de dieta</Text>
                <TouchableOpacity onPress={() => setShowDietTypeModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {Object.values(DietType)
                  .filter(dt => dt !== DietType.NINGUNA)
                  .map((dietType) => (
                  <TouchableOpacity
                    key={dietType}
                    style={[
                      styles.modalOption,
                      selectedDietTypes.has(dietType) && styles.modalOptionSelected
                    ]}
                    onPress={() => handleToggleDietType(dietType)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedDietTypes.has(dietType) && styles.modalOptionTextSelected
                      ]}
                    >
                      {dietType}
                    </Text>
                    {selectedDietTypes.has(dietType) && (
                      <Ionicons name="checkmark" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
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
  buttonContainer: {
    padding: 16,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});

export default recipes;