// components/recipes/create/CameraComponent.tsx
import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

interface CameraComponentProps {
    onClose: () => void;
    onBarcodeScanned: (result: any) => void;
    detectionAreas: Array<{ id: string; color: string }>;
    facing: CameraType;
}

const CameraComponent = memo(({
    onClose,
    onBarcodeScanned,
    detectionAreas,
    facing
}: CameraComponentProps) => {
    return (
        <View style={styles.cameraContainer}>
            <CameraView
                style={styles.camera}
                barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8"] }}
                active={true}
                facing={facing}
                onBarcodeScanned={onBarcodeScanned}
            >
                <View style={styles.scanArea}>
                    {detectionAreas.map((area) => (
                        <View
                            key={area.id}
                            style={[
                                styles.scanAreaCorner,
                                styles[area.id as keyof typeof styles],
                                { borderColor: area.color }
                            ]}
                        />
                    ))}
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons name="barcode-outline" size={24} color="white" style={styles.icon} />
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close-circle" size={32} color="white" />
                </TouchableOpacity>
            </CameraView>
        </View>
    );
});

const styles = StyleSheet.create({
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
    }
});

export default CameraComponent;