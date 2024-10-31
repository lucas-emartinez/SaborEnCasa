import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CategoryItemProps {
  category: string;
  isDarkMode: boolean;
  onPress: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, isDarkMode, onPress }) => {
  return (
    <TouchableOpacity style={[styles.categoryBox, isDarkMode ? styles.darkBox : styles.lightBox]} onPress={onPress}>
      <Text style={[styles.categoryText, isDarkMode ? styles.darkText : styles.lightText]}>
        {category}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryBox: {
    width: 100,
    height: 100,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  categoryText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  darkBox: {
    backgroundColor: '#333333',
  },
  lightBox: {
    backgroundColor: '#f0f0f0',
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#000000',
  },
});

export default CategoryItem;
