import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

interface BottomSheetNotFoundContentProps {
  handleScanAgain: () => void;
}

const BottomSheetNotFoundContent: React.FC<BottomSheetNotFoundContentProps> = ({
  handleScanAgain
}) => {
  return (
    <BottomSheetView style={styles.container}>
      <View style={styles.productContainer}>
        <Text style={styles.notFoundContainer}>
          Producto no encontrado
        </Text>
        <View style={styles.notFoundIcon}>
          <Ionicons
            name='close'
            size={24}
            color='white'
          />
        </View>
      </View>

      <Text style={styles.errorText}>
        No pudimos identificar este producto en nuestra base de datos
      </Text>

      <Text style={styles.suggestionText}>
        Intenta escanear el código de barras nuevamente o busca el ingrediente manualmente
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

      <Pressable
        style={({ pressed }) => [
          styles.searchManuallyButton,
          { opacity: pressed ? 0.5 : 1 }
        ]}
      >
        <Text style={styles.searchManuallyText}>
          Buscar manualmente
        </Text>
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
  notFoundContainer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000'
  },
  notFoundIcon: {
    backgroundColor: '#FF3B30',
    borderRadius: 32,
    padding: 8
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 12
  },
  suggestionText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
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
  },
  searchManuallyButton: {
    backgroundColor: '#F2F2F2',
    borderRadius: 18,
    marginTop: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  searchManuallyText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default BottomSheetNotFoundContent;