// utils/scannerUtils.ts
import { BarcodePoint } from '@/types/types';
import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export const checkScanArea = (cornerPoints: BarcodePoint[]): boolean => {
    const scanAreaLeft = (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2;
    const scanAreaTop = (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2;
    const scanAreaRight = scanAreaLeft + SCAN_AREA_SIZE;
    const scanAreaBottom = scanAreaTop + SCAN_AREA_SIZE;

    return cornerPoints.every(point =>
        point.x >= scanAreaLeft &&
        point.x <= scanAreaRight &&
        point.y >= scanAreaTop &&
        point.y <= scanAreaBottom
    );
};

export const processProductData = (product: any) => {
    return {
        product_name: product.product_name || 'Producto desconocido',
        categories_tags: product.categories_tags || [],
        nutriments: product.nutriments || {},
        image_url: product.image_url || null
    };
};

// También podemos agregar otras utilidades relacionadas con el scanner aquí
export const formatBarcode = (barcode: string): string => {
    return barcode.replace(/[^0-9]/g, '');
};

export const validateBarcode = (barcode: string): boolean => {
    // Validación básica para códigos EAN
    const cleanBarcode = formatBarcode(barcode);
    return /^(\d{8}|\d{13})$/.test(cleanBarcode);
};