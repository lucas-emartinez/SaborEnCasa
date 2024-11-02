import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  Ingredient,
} from '@/types/types';
import { useIngredientMapper } from '@/hooks/useIngredientMapper';
import { useData } from '@/context/DataProvider';
import ScanLoader from '@/components/recipes/create/ScanLoader';
import BottomSheetComponent from '@/components/recipes/create/BottomSheet';
import { useFetch } from '@/hooks/useFetch';
import { envConfig } from '@/configs/envConfig';
import { RecipeRecommender, useRecipeRecommendations } from '@/hooks/useRecipeRecommender';
import { FoodUnit } from '@/types/enums';
import { router } from 'expo-router';

interface ScannedProduct {
  product_name: string;
  categories_tags?: string[];
  nutriments?: any;
  image_url?: string;
}

interface BarcodePoint {
  x: number;
  y: number;
}

interface BarcodeScanningResult {
  type: string;
  data: string;
  raw?: string;
  cornerPoints: BarcodePoint[];
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
}

interface DetectionArea {
  id: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  color: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export default function CreateRecipe() {
  // Estados
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [scanning, setScanning] = useState(false);
  const [isProcessingBarcode, setIsProcessingBarcode] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [mappedIngredient, setMappedIngredient] = useState<Ingredient | null>(null);
  const [detectionAreas, setDetectionAreas] = useState<DetectionArea[]>([
    { id: 'topLeft', color: 'white' },
    { id: 'topRight', color: 'white' },
    { id: 'bottomLeft', color: 'white' },
    { id: 'bottomRight', color: 'white' },
  ]);

  // Refs
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Hooks
  const { 
    ingredients: knownIngredients, 
    recipes, 
    user, 
    setCurrentRecommendations 
  } = useData();

  const { loading, error, fetchData } = useFetch();
  const { mapIngredientByName, findSimilarIngredients } = useIngredientMapper(knownIngredients);
  const recommender = useRecipeRecommendations(recipes, user, ingredients);

  // Handlers
  const handleScan = useCallback(() => {
    setScanning(true);
  }, []);

  const handleBarcodeScanned = useCallback(async (result: BarcodeScanningResult) => {
    if (isProcessingBarcode) return;

    const { cornerPoints, data: barcodeData } = result;

    const scanAreaLeft = (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2;
    const scanAreaTop = (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2;
    const scanAreaRight = scanAreaLeft + SCAN_AREA_SIZE;
    const scanAreaBottom = scanAreaTop + SCAN_AREA_SIZE;

    const isWithinScanArea = cornerPoints.every(point =>
      point.x >= scanAreaLeft &&
      point.x <= scanAreaRight &&
      point.y >= scanAreaTop &&
      point.y <= scanAreaBottom
    );

    if (isWithinScanArea) {
      setIsProcessingBarcode(true);
      setDetectionAreas(areas => areas.map(area => ({ ...area, color: '#15CF77' })));

      try {
        const fetchedData = await fetchData(
          `${envConfig.OPEN_FOOD_FACTS_API_URL}/${barcodeData}`,
          { method: 'GET', cache: 'force-cache' }
        );

        if (fetchedData?.status === 1 && fetchedData.product) {
          const scannedProduct: ScannedProduct = {
            product_name: fetchedData.product.product_name,
            categories_tags: fetchedData.product.categories_tags,
            nutriments: fetchedData.product.nutriments,
            image_url: fetchedData.product.image_url
          };

          setScannedProduct(scannedProduct);
          const mappedIngredient = mapIngredientByName({
            product: {
              product_name: scannedProduct.product_name,
              categories_tags: scannedProduct.categories_tags,
              nutriments: scannedProduct.nutriments
            }
          });

          if (mappedIngredient) {
            setMappedIngredient(mappedIngredient);
            setScanning(false);
          }
        }
      } catch (fetchError) {
        console.error('Error fetching product:', fetchError);
      } finally {
        bottomSheetRef.current?.expand();
        setIsProcessingBarcode(false);
        setTimeout(() => {
          setDetectionAreas(areas => areas.map(area => ({ ...area, color: 'white' })));
        }, 1000);
      }
    }
  }, [isProcessingBarcode, fetchData, mapIngredientByName]);

  const handleAddIngredient = useCallback((ingredient: any) => {
    if (!mappedIngredient) return;  // Evita el resto del código si `mappedIngredient` es undefined o null.
   
    setIngredients(prevIngredients => {
      // Verificar si el ingrediente ya existe
      const existingIndex = prevIngredients.findIndex(
        item => item.id === mappedIngredient.id
      );

      // Si existe, actualizar cantidad
      if (existingIndex >= 0) {
        const updatedIngredients = prevIngredients.map((item, index) => {
          if (index === existingIndex) {
            // Calcular nueva cantidad con límite máximo
            const newQuantity = Math.min(
              (item.quantity || 0) + 1,
              20 // Límite máximo
            );

            return {
              ...item,
              quantity: newQuantity
            };
          }
          return item;
        });

        return updatedIngredients;
      }

      // Crear el nuevo ingrediente con valores por defecto
      const newIngredient: Ingredient = {
        ...ingredient,
        id: mappedIngredient.id,
        name: mappedIngredient.name,
        category: mappedIngredient.category,
        keywords: [...(mappedIngredient.keywords || []), ...(ingredient._keywords || [])],
        image: ingredient.image_url ? ingredient.image_url : mappedIngredient.image,
        nutritionalProperties: ingredient?.nutriments || mappedIngredient.nutritionalProperties,
        calories: ingredient?.nutriments?.energy_value || 0,
        quantity: 1,
        unit: ingredient.product_quantity_unit ?? mappedIngredient.unit ?? FoodUnit.GRAM
      };

      return [...prevIngredients, newIngredient];
    });

    // Limpiar estados y cerrar bottom sheet
    setScannedProduct(null);
    bottomSheetRef.current?.close();
  }, [mappedIngredient]);

  const handleRecommendation = useCallback(() => {
    if (!mappedIngredient) {
      console.log("No hay ingrediente mapeado");
      return;
    }

    const recommender = new RecipeRecommender(recipes, user, [mappedIngredient]);
    const recommendations = recommender.getSingleIngredientRecommendations(3);
    setCurrentRecommendations(recommendations);
    router.push('./recommendations');
  }, [mappedIngredient, recipes, user]);

  const updateQuantity = useCallback((id: number, increment: number) => {
    setIngredients(prevIngredients =>
      prevIngredients.map(ing => {
        if (ing.id === id) {
          const newQuantity = Math.max(0, Math.min(20, (ing.quantity || 0) + increment));
          return newQuantity === 0
            ? null  // Remover si cantidad llega a 0
            : { ...ing, quantity: newQuantity };
        }
        return ing;
      }).filter(Boolean) as Ingredient[]
    );
  }, []);

  // Render del ítem de la lista
  const renderItem = useCallback(({ item }: { item: Ingredient }) => {
    const imageUrl = item.image.includes("http")
      ? item.image
      : `${envConfig.IMAGE_SERVER_URL}/ingredients/${item.image}`;
  
    return (
      <View style={styles.ingredientItem}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.ingredientImage}
        />
        <Text style={styles.ingredientName}>{item.name}</Text>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            onPress={() => updateQuantity(item.id!, -1)}
            style={styles.button}
          >
            <Ionicons name="remove" size={16} color="#5EEAD4" />
          </TouchableOpacity>
          <Text style={styles.buttonText}>
            {item.quantity}
          </Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item.id!, 1)}
            style={styles.button}
          >
            <Ionicons name="add" size={16} color="#5EEAD4" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [updateQuantity]);

  // Lista memorizada
  const memoizedList = useMemo(() => (
    <FlatList
      data={ingredients}
      renderItem={renderItem}
      keyExtractor={item => item.id?.toString() ?? ''}
      contentContainerStyle={styles.list}
    />
  ), [ingredients, renderItem]);

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
                {detectionAreas.map((area) => (
                  <View
                    key={area.id}
                    style={[
                      styles.scanAreaCorner,
                      styles[area.id],
                      { borderColor: area.color }
                    ]}
                  />
                ))}
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
          <View style={{ flex: 1, padding: 16 }}>
            <View style={styles.header}>
              <View style={styles.leftHeader}>
                <Text style={styles.title}>Ingredientes</Text>
              </View>
              <View style={styles.rightHeader}>
                <TouchableOpacity onPress={handleScan}>
                  <Ionicons name='barcode-outline' size={32} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name='add-outline' size={32} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.itemCount}>{ingredients?.length} Item</Text>
            {memoizedList}
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Buscar</Text>
            </TouchableOpacity>
          </View>
        )}
        <BottomSheetComponent
          addIngredient={handleAddIngredient}
          found={scannedProduct !== null}
          bottomSheetRef={bottomSheetRef}
          scannedProduct={scannedProduct}
          mappedIngredient={mappedIngredient}
          handleRecommendation={handleRecommendation}
          handleScanAgain={() => {
            setScanning(true);
            setIsProcessingBarcode(false);
            bottomSheetRef.current?.close();
          }}
        />
        <ScanLoader isVisible={loading} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // super light gray #
    paddingTop: 16,
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
  scanAreaCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e1e1e1',
    borderRadius: 2,
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
    marginHorizontal: 16,
    marginTop: 16,
  },
  leftHeader: {
    alignItems: 'flex-start',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto',
  },
  createRecipeText: {
    color: '#2196F3',
    fontSize: 16,
  },
  itemCount: {
    fontSize: 16,
    color: 'gray',
    marginHorizontal: 16,
  },
  list: {
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  ingredientItem: {
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.015,  // Reducido aún más
    shadowRadius: 1,
    elevation: 0.3,        // Reducido aún más
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  ingredientImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 16,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5EEAD4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#15CF77',
    borderRadius: 18,
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
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
    color: '#000000',
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
    color: '#000000',
  },
});