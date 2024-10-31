import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { Ionicons } from '@expo/vector-icons'
import { Ingredient } from '@/types/types'

const BottomSheetFoundContent = ({
    bottomSheetRef,
    scannedProduct,
    addIngredient,
    handleRecommendation,
    handleScanAgain
}:{
    bottomSheetRef: React.RefObject<BottomSheet>,
    scannedProduct: any,
    addIngredient?: (ingredient: Ingredient) => void,
    handleRecommendation: (product: Ingredient) => void
    handleScanAgain: () => void
}) => {

    const handleAddIngredient = () => {
        if (scannedProduct) {
            addIngredient && addIngredient({
                name: scannedProduct.product_name,
                quantity: 1,
                image: scannedProduct.image_url,
                unit: undefined,
                calories: scannedProduct.nutriments.energy_serving,
                keywords: scannedProduct?.keywords || []
            })
        }
        bottomSheetRef.current?.close()
    }

    return (
        <BottomSheetView style={styles.container}>
            <View style={styles.productContainer}>
                <Text style={styles.foundContainer}>
                    Producto encontrado
                </Text>
                <View style={styles.foundIcon}>
                    <Ionicons name='checkmark' size={24} color='white' onPress={() => bottomSheetRef.current?.close()} />
                </View>
            </View>
            <Text style={styles.productText}>
                {scannedProduct && scannedProduct.product_name}
            </Text>
            <Pressable onPress={() => handleRecommendation(scannedProduct)} 
                style={({ pressed }) => [styles.searchForRecipesButton, { opacity: pressed ? 0.5 : 1 }]}>
                    <Text style={styles.searchForRecipesText}>Ver recetas con este producto</Text>
            </Pressable>
            <Pressable 
                onPress={() => { handleAddIngredient(); }} 
                style={({ pressed }) => [styles.addAnotherButton, { opacity: pressed ? 0.5 : 1 }]}>
                    <Text style={styles.addAnotherText}>Agregar ingrediente</Text>
            </Pressable>
            <Pressable onPress={handleScanAgain} 
                style={({ pressed }) => [styles.scanAgainButton, { opacity: pressed ? 0.5 : 1 }]}>
                    <View style={{flexDirection: 'row', gap: 8}}>
                        <Text style={styles.scanAgainText}>Volver a escanear</Text>
                        <Ionicons name='refresh' size={24} color='black' />
                    </View>
            </Pressable>
        </BottomSheetView>

    )
}

export default BottomSheetFoundContent

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 12,
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
        color: '#000000' 
    },
    searchForRecipesButton: {
        backgroundColor: '#15CF77',
        borderRadius: 18,
        marginTop: 20,
        padding: 16,
        width: '80%',
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
        width: '80%',
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
        width: '80%',
        alignItems: 'center',
    },
    scanAgainText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    }
})

