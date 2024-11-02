import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useEffect } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { 
    Ingredient,
} from '@/types/types';

interface BottomSheetFoundContentProps {
    scannedProduct: any;
    mappedIngredient: Ingredient | null;
    addIngredient: (ingredient: Ingredient) => void;
    handleRecommendation: (ingredient: Ingredient) => void;
    handleScanAgain: () => void;
}

const BottomSheetFoundContent: React.FC<BottomSheetFoundContentProps> = ({
    scannedProduct,
    mappedIngredient,
    addIngredient,
    handleRecommendation,
    handleScanAgain
}) => {
    const handleRecommendationClick = () => {
        if (!mappedIngredient) {
            console.warn('No mapped ingredient available for recommendations');
            return;
        }

        handleRecommendation(mappedIngredient);
    };


    // Renderizar solo si hay un producto mapeado
    if (!scannedProduct) {
        return (
            <BottomSheetView style={styles.container}>
                <Text style={styles.errorText}>
                    No se pudo identificar el producto
                </Text>
                <Pressable 
                    onPress={handleScanAgain}
                    style={({ pressed }) => [
                        styles.scanAgainButton, 
                        { opacity: pressed ? 0.5 : 1 }
                    ]}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.scanAgainText}>Volver a escanear</Text>
                        <Ionicons name='refresh' size={24} color='black' />
                    </View>
                </Pressable>
            </BottomSheetView>
        );
    }

    return (
        <BottomSheetView style={styles.container}>
            <View style={styles.productContainer}>
                <Text style={styles.foundContainer}>
                    Producto encontrado
                </Text>
                <View style={styles.foundIcon}>
                    <Ionicons 
                        name='checkmark' 
                        size={24} 
                        color='white' 
                    />
                </View>
            </View>

            <Text style={styles.productText}>
                {scannedProduct?.product_name}
            </Text>

            <Pressable 
                onPress={handleRecommendationClick}
                style={({ pressed }) => [
                    styles.searchForRecipesButton,
                    { opacity: pressed ? 0.5 : 1 }
                ]}
            >
                <Text style={styles.searchForRecipesText}>
                    Ver recetas con este ingrediente
                </Text>
            </Pressable>

            <Pressable 
                onPress={() => addIngredient(scannedProduct)
}
                style={({ pressed }) => [
                    styles.addAnotherButton,
                    { opacity: pressed ? 0.5 : 1 }
                ]}
            >
                <Text style={styles.addAnotherText}>
                    Agregar ingrediente
                </Text>
            </Pressable>

            <Pressable 
                onPress={handleScanAgain}
                style={({ pressed }) => [
                    styles.scanAgainButton,
                    { opacity: pressed ? 0.5 : 1 }
                ]}
            >
                <View style={styles.buttonContent}>
                    <Text style={styles.scanAgainText}>
                        Volver a escanear
                    </Text>
                    <Ionicons name='refresh' size={24} color='black' />
                </View>
            </Pressable>
        </BottomSheetView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 12,
        paddingHorizontal: 16,
    },
    productContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: '6%'
    },
    foundContainer: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000'
    },
    foundIcon: {
        backgroundColor: '#15CF77',
        borderRadius: 32,
        padding: 8
    },
    productText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 8
    },
    categoryText: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 16
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        marginBottom: 24
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    searchForRecipesButton: {
        backgroundColor: '#15CF77',
        borderRadius: 18,
        marginTop: 20,
        padding: 16,
        width: '100%',
        alignItems: 'center',
    },
    searchForRecipesText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    addAnotherButton: {
        backgroundColor: '#F2F2F2',
        borderRadius: 18,
        marginTop: 8,
        padding: 16,
        width: '100%',
        alignItems: 'center',
    },
    addAnotherText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    scanAgainButton: {
        backgroundColor: '#F2F2F2',
        borderRadius: 18,
        marginTop: 8,
        padding: 16,
        width: '100%',
        alignItems: 'center',
    },
    scanAgainText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default BottomSheetFoundContent;