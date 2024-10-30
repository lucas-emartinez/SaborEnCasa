import React, { useRef, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Dimensions, Button, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Ingredient } from '@/types/types';
import { useIngredientMapper } from '@/hooks/useIngredientMapper';
import { useData } from '@/context/DataProvider';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export default function CreateRecipe() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [scanning, setScanning] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [sheetVisible, setSheetVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [scannedProduct, setScannedProduct] = useState(null);
  const { ingredients: knownIngredients } = useData();

  const { mapIngredientByName } = useIngredientMapper(knownIngredients);

  const handleScan = () => {
    setScanning(true);
  };

  const handleBarcodeScanned = async (data: { data: string }) => {
    const fetchOpenFoodFactsAPI = async (barcode: string) => {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data.data}.json`);
      return response.json();
    }

    const ingredient = await fetchOpenFoodFactsAPI(data.data);
    const mappedIngredient = mapIngredientByName(ingredient);
    if (ingredient.status === 0) {
      console.error('Product not found');
      return;
    }
    if (mappedIngredient) {
      setIngredients(prevIngredients => [...prevIngredients, mappedIngredient]);
    }
    setScanning(false);
    bottomSheetRef.current?.expand();
  };

  const updateQuantity = (id: number, increment: number) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, quantity: Math.min(Math.max(0, (ing.quantity ?? 0) + increment), 20) } : ing
      )
    );
  };


  const renderItem = ({ item }: { item: Ingredient }) => (
    <View style={styles.ingredientItem}>
      <Image source={{ uri: item.image }} style={styles.ingredientImage} />
      <Text style={styles.ingredientName}>{item.name}</Text>
      <View style={styles.quantityControl}>
        <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.quantityButton}>
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>
          {item.quantity && item.quantity < 10 ? `0${item.quantity}` : item.quantity}
        </Text>
        <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.quantityButton}>
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {scanning ? (
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8"] }}
              active={scanning}
              facing={facing}
              onBarcodeScanned={handleBarcodeScanned}
            >
              <View style={styles.scanArea}>
                <View style={styles.scanAreaTopLeft} />
                <View style={styles.scanAreaTopRight} />
                <View style={styles.scanAreaBottomLeft} />
                <View style={styles.scanAreaBottomRight} />
              </View>
              <View style={styles.iconContainer}>
                <Ionicons name="barcode-outline" size={24} color="white" style={styles.icon} />
                <Ionicons name="qr-code-outline" size={24} color="white" style={styles.icon} />
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setScanning(false)}>
                <Ionicons name="close-circle" size={32} color="white" />
              </TouchableOpacity>
            </CameraView>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Ingredientes</Text>
              <TouchableOpacity>
                <Text style={styles.createRecipeText}>Crear Receta</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.itemCount}>{ingredients.length} Item</Text>
            <FlatList
              data={ingredients}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.list}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleScan}>
              <Text style={styles.addButtonText}>Ingresa ingrediente</Text>
            </TouchableOpacity>
          </>
        )}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={['45%']}
          enablePanDownToClose={true}
        >
          <BottomSheetView style={{ flex: 1, padding: 30 }}>
            <Text>Awesome 🎉</Text>
            <Pressable onPress={() => { }}>
              <Text>Agregar a la receta</Text>
            </Pressable>
            <Pressable onPress={() => { }}>
              <Text>Ver recetas con este producto</Text>
            </Pressable>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Changed to white background
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scanArea: {
    position: 'absolute',
    top: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2,
    left: (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2,
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  scanAreaTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#2196F3',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e1e1e1',
    borderRadius: 2,
  },
  scanAreaTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2196F3',
  },
  scanAreaBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#2196F3',
  },
  scanAreaBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2196F3',
  },
  iconContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    marginHorizontal: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000', // Changed to black text
  },
  createRecipeText: {
    color: '#2196F3',
    fontSize: 16,
  },
  itemCount: {
    fontSize: 16,
    color: 'gray',
    padding: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  ingredientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    color: '#000000', // Changed to black text
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 100,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#2196F3',
  },
  quantityText: {
    width: 30,
    textAlign: 'center',
    fontSize: 16,
    color: '#000000', // Changed to black text
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 25,
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000', // Changed to black text
  },
  scannedProductInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scannedProductImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  scannedProductName: {
    fontSize: 18,
    color: '#000000', // Changed to black text
  },
});