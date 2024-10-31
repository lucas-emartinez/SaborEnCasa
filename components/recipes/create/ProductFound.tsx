import React, { useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet'

export default function ProductFoundSheet({
    visible,
    onClose,
    onViewRecipes,
    onAddIngredient,
    onScanAgain
}: {
    visible: boolean
    onClose: () => void
    onViewRecipes: () => void
    onAddIngredient: () => void
    onScanAgain: () => void
}) {
    const snapPoints = ['45%']

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.4}
            />
        ),
        []
    )

    React.useEffect(() => {
        if (visible) {
            bottomSheetRef.current?.expand()
        } else {
            bottomSheetRef.current?.close()
        }
    }, [visible])

    if (!visible) return null

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        zIndex: 1000,
        paddingHorizontal: 20,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#454545',
        borderRadius: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    link: {
        alignItems: 'center',
        marginBottom: 24,
    },
    linkText: {
        color: '#2196F3',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    primaryButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    secondaryButton: {
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
})