import { Asset } from "expo-asset";
import * as FileSystem from 'expo-file-system';

export async function loadJSON(filename: string): Promise<any> {
    try {
        const asset = Asset.fromModule(require(`../assets/data/${filename}`));
        // Cargar
        await asset.downloadAsync();

        if (asset.localUri) {
            // Leemos el json
            const jsonContent = await FileSystem.readAsStringAsync(asset.localUri);
            // Parseamos
            return JSON.parse(jsonContent);
        }
        throw new Error(`Could not load ${filename}`);
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return null;
    }
}