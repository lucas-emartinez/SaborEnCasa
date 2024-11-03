// components/onboarding/SelectionGrid.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CategoryItemProps {
  category: string;
  imageSource: any;
  isSelected?: boolean;
  onPress: () => void;
}

const { width } = Dimensions.get('window');


export const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  imageSource,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <ImageBackground
        source={imageSource}
        style={styles.imageBackground}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.5)',
            'rgba(0,0,0,0.8)'
          ]}
          style={[
            styles.gradient,
            isSelected && styles.selectedGradient
          ]}
          locations={[0, 0.6, 1]}
        />
        <View style={styles.textContainer}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '45%',
    height: 120,
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 16,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  selectedGradient: {
    backgroundColor: 'rgba(0, 122, 255, 0.4)',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    color: 'white',
    zIndex: 10,
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Sombra más sutil
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});