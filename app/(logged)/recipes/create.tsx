import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Dimensions, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import { debounce } from '@/utils/debounce';
import { Ingredient } from '@/types/types';
import { useIngredientMapper } from '@/hooks/useIngredientMapper';
import { useData } from '@/context/DataProvider';
import ScanLoader from '@/components/recipes/create/ScanLoader';
import BottomSheetComponent from '@/components/recipes/create/BottomSheet';
import { useFetch } from '@/hooks/useFetch';
import { envConfig } from '@/configs/envConfig';
import { FoodUnit } from '@/types/enums';
import { router } from 'expo-router';
import CameraComponent from '@/components/recipes/create/CameraComponent';
import { checkScanArea, processProductData } from '@/utils/scannerUtils';
import SearchIngredientSheet from './searchIngredient';
import { RecipeRecommender } from '@/hooks/useRecipeRecommender';
import SearchIngredientModal from '@/components/SearchIngredientSheet';

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
  const [scanning, setScanning] = useState(false);
  const [isProcessingBarcode, setIsProcessingBarcode] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [mappedIngredient, setMappedIngredient] = useState<Ingredient | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const {
    ingredients: knownIngredients,
    recipes,
    user,
    ingredients,
    currentRecipeIngredients,
    setCurrentRecipeIngredientsState,
    setCurrentRecommendations
  } = useData();

  const [detectionAreas, setDetectionAreas] = useState<DetectionArea[]>([
    { id: 'topLeft', color: 'white' },
    { id: 'topRight', color: 'white' },
    { id: 'bottomLeft', color: 'white' },
    { id: 'bottomRight', color: 'white' },
  ]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const searchSheetRef = useRef<BottomSheetModal>(null);

  const { loading, error, fetchData } = useFetch();
  const { mapIngredientByName } = useIngredientMapper(knownIngredients);

  useEffect(() => {
    let isMounted = true;
    return () => {
      isMounted = false;
      if (scanning) {
        setScanning(false);
      }
      setIsProcessingBarcode(false);
      setScannedProduct(null);
      setMappedIngredient(null);
    };
  }, [scanning]);

  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const handleOpenSearch = () => {
    setIsSearchModalVisible(true);
  };

  const handleCloseSearch = () => {
    setIsSearchModalVisible(false);
  };

  const handleScan = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        return;
      }
    }
    setIsProcessingBarcode(false);
    setScanning(true);
  }, [permission, requestPermission]);

  const debouncedBarcodeHandler = useCallback((result: BarcodeScanningResult) => {
    if (!scanning || isProcessingBarcode) return;

    debounce(async () => {
      try {
        const isWithinScanArea = checkScanArea(result.cornerPoints);
        if (!isWithinScanArea) return;

        setIsProcessingBarcode(true);
        setDetectionAreas(prev => prev.map(area => ({ ...area, color: '#15CF77' })));

        const fetchedData = await fetchData(
          `${envConfig.OPEN_FOOD_FACTS_API_URL}/${result.data}`,
          { method: 'GET', cache: 'force-cache' }
        );

        if (fetchedData?.status === 1 && fetchedData.product) {
          const product = processProductData(fetchedData.product);
          setScannedProduct(product);
          const ingredient = mapIngredientByName({
            product: {
              product_name: product.product_name,
              categories_tags: product.categories_tags,
              nutriments: product.nutriments
            }
          });

          if (ingredient) {
            setMappedIngredient(ingredient);
            setScanning(false);
          }
        }
      } catch (error) {
        console.error('Error processing barcode:', error);
      } finally {
        bottomSheetRef.current?.expand();
        setTimeout(() => {
          setDetectionAreas(prev => prev.map(area => ({ ...area, color: 'white' })));
        }, 1000);
      }
    }, 1000)();
  }, [scanning, isProcessingBarcode, fetchData, mapIngredientByName]);

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    debouncedBarcodeHandler(result);
  }, [debouncedBarcodeHandler]);

  const handleAddIngredient = useCallback((ingredient: any) => {
    if (!mappedIngredient) return;

    setCurrentRecipeIngredientsState((prevIngredients: Ingredient[]) => {
      const existingIndex = prevIngredients.findIndex(item => item.id === mappedIngredient.id);

      if (existingIndex >= 0) {
        return prevIngredients.map((item, index) => {
          if (index === existingIndex) {
            return {
              ...item,
              quantity: Math.min((item.quantity || 0) + 1, 20)
            };
          }
          return item;
        });
      }

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

    setScannedProduct(null);
    bottomSheetRef.current?.close();
  }, [mappedIngredient, setCurrentRecipeIngredientsState]);

  const handleAddIngredientFromSearch = (ingredient) => {
    setCurrentRecipeIngredientsState((prevIngredients) => {
      const existingIndex = prevIngredients.findIndex((item) => item.id === ingredient.id);

      if (existingIndex >= 0) {
        return prevIngredients.map((item, index) => {
          if (index === existingIndex) {
            return {
              ...item,
              quantity: Math.min((item.quantity || 0) + 1, 20),
            };
          }
          return item;
        });
      }

      return [
        ...prevIngredients,
        {
          ...ingredient,
          quantity: 1,
          unit: ingredient.unit || FoodUnit.GRAM,
        },
      ];
    });

    handleCloseSearch();
  };

  const handleRecommendation = useCallback(() => {
    if (!mappedIngredient) return;
    const recommender = new RecipeRecommender(recipes, user, [mappedIngredient]);
    const recommendations = recommender.getSingleIngredientRecommendations(3);
    setCurrentRecommendations(recommendations);
    router.push('/(logged)/recommendations');
  }, [mappedIngredient, setCurrentRecommendations]);

  const handleFullRecommendation = useCallback(() => {
    if (!currentRecipeIngredients.length) return;
    const recommender = new RecipeRecommender(recipes, user, currentRecipeIngredients);
    const recommendations = recommender.getMultiIngredientRecommendations(3);
    setCurrentRecommendations(recommendations);
    router.push('/(logged)/recommendations');
  }, [currentRecipeIngredients, setCurrentRecommendations]);

  const updateQuantity = useCallback((id: number, increment: number) => {
    setCurrentRecipeIngredientsState((prevIngredients: Ingredient[]) =>
      prevIngredients.map(ing => {
        if (ing.id === id) {
          const newQuantity = Math.max(0, Math.min(20, (ing.quantity || 0) + increment));
          return newQuantity === 0 ? null : { ...ing, quantity: newQuantity };
        }
        return ing;
      }).filter(Boolean) as Ingredient[]
    );
  }, [setCurrentRecipeIngredientsState]);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        No hay ingredientes agregados
      </Text>
      <Text style={styles.emptyStateSubtext}>
        Escanea productos o agrégalos manualmente
      </Text>
    </View>
  ), []);

  const HeaderComponent = useMemo(() => (
    <View style={styles.header}>
      <View style={styles.leftHeader}>
        <Text style={styles.title}>Ingredientes</Text>
      </View>
      <View style={styles.rightHeader}>
        <TouchableOpacity onPress={handleScan}>
          <Ionicons name='barcode-outline' size={32} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleOpenSearch}>
          <Ionicons name="add-outline" size={32} />
        </TouchableOpacity>
      </View>
    </View>
  ), [handleScan, handleOpenSearch]);

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

  const cameraComponent = useMemo(() => {
    if (!scanning) return null;

    if (!permission) return <View />;

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>Necesitamos permiso para usar la cámara</Text>
          <Button onPress={requestPermission} title="Dar permiso" />
        </View>
      );
    }

    return (
      <CameraComponent
        onClose={() => {
          setScanning(false);
          setIsProcessingBarcode(false);
        }}
        onBarcodeScanned={handleBarcodeScanned}
        detectionAreas={detectionAreas}
        facing={facing}
      />
    );
  }, [scanning, permission, detectionAreas, facing, handleBarcodeScanned]);

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
        {scanning ? cameraComponent : (
          <View style={{ flex: 1, padding: 16 }}>
            {HeaderComponent}
            <Text style={styles.itemCount}>
              {currentRecipeIngredients.length} {currentRecipeIngredients.length === 1 ? 'Item' : 'Items'}
            </Text>
            <FlatList
              data={currentRecipeIngredients}
              renderItem={renderItem}
              keyExtractor={item => item.id?.toString() ?? ''}
              contentContainerStyle={styles.list}
              ListEmptyComponent={ListEmptyComponent}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={5}
            />
            <TouchableOpacity
              onPress={handleFullRecommendation}
              style={[
                styles.addButton,
                currentRecipeIngredients.length === 0 && styles.addButtonDisabled
              ]}
              disabled={currentRecipeIngredients.length === 0}
            >
              <Text style={[
                styles.addButtonText,
                currentRecipeIngredients.length === 0 && styles.addButtonTextDisabled
              ]}>
                Buscar
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <BottomSheetComponent
          addIngredient={handleAddIngredient}
          found={mappedIngredient !== null}
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
        <SearchIngredientModal
          visible={isSearchModalVisible}
          onClose={handleCloseSearch}
          knownIngredients={ingredients}
          onSelectIngredient={handleAddIngredientFromSearch}
        />
        <ScanLoader isVisible={loading} />

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 16,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
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
    shadowOpacity: 0.015,
    shadowRadius: 1,
    elevation: 0.3,
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
    backgroundColor: '#4CAF50',
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  addButtonTextDisabled: {
    color: '#999',
  },
});

