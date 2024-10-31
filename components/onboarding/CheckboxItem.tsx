import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CheckboxItemProps {
  label: string;
  isChecked: boolean;
  isDarkMode: boolean;
  onToggle: () => void;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, isChecked, isDarkMode, onToggle }) => {
  return (
    <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
      <View style={[styles.checkBox, { backgroundColor: isChecked ? '#28A745' : '#FFFFFF' }]}>
        {isChecked && <Text style={styles.checkmark}>✔</Text>}
      </View>
      <Text style={[styles.checkboxText, isDarkMode ? styles.darkText : styles.lightText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkBox: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  checkboxText: {
    fontSize: 16,
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#000000',
  },
});

export default CheckboxItem;
