// components/onboarding/CheckboxItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxItemProps {
  label: string;
  isChecked: boolean;
  isDarkMode?: boolean;
  onToggle: () => void;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({
  label,
  isChecked,
  onToggle,
}) => {

  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isChecked ? 1 : 0,
      useNativeDriver: false,
      speed: 2000,
      bounciness: 2,
    }).start();
  }, [isChecked]);

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={styles.container}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.checkbox,
          { transform: [{ scale }] },
        ]}
      >
        <Ionicons 
          name={isChecked ? "checkbox" : "square-outline"} 
          size={36} 
          color={isChecked ? '#28A745' : '#999'} 
        />
      </Animated.View>
      <Text style={styles.label}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  checkbox: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#000',
  },
});

export default CheckboxItem;