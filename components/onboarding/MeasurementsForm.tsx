import React from 'react';
import { Animated, Platform } from 'react-native';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { ActivityLevel } from '@/types/enums';
import { translateActivityLevel } from '@/utils/enum-translations';
import { UserMeasurements } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';

interface MeasurementsFormProps {
    measurements: UserMeasurements;
    setMeasurements: React.Dispatch<React.SetStateAction<UserMeasurements>>;
}

const MeasurementsForm: React.FC<MeasurementsFormProps> = ({
    measurements,
    setMeasurements,
}) => {
    const fadeAnim = new Animated.Value(1);
    const calculateBMR = (weight: number, height: number, age: number): number => {
        return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    };

    const calculateDailyCalories = (bmr: number, activityLevel: ActivityLevel): number => {
        const multipliers = {
            [ActivityLevel.SEDENTARY]: 1.2,
            [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
            [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
            [ActivityLevel.VERY_ACTIVE]: 1.725,
            [ActivityLevel.EXTRA_ACTIVE]: 1.9,
        };
        return Math.round(bmr * multipliers[activityLevel]);
    };

    const pickerItems = Object.values(ActivityLevel).map(level => ({
        label: translateActivityLevel(level),
        value: level
    }));

    const handleInputChange = (field: keyof UserMeasurements, value: string) => {
        const numericValue = parseFloat(value) || 0;
        const updatedMeasurements = {
            ...measurements,
            [field]: numericValue
        };

        // Calcular BMR y calorías diarias cuando cambian los valores relevantes
        if (['weight', 'height', 'age'].includes(field)) {
            const bmr = calculateBMR(
                field === 'weight' ? numericValue : measurements.weight || 0,
                field === 'height' ? numericValue : measurements.height || 0,
                field === 'age' ? numericValue : measurements.age || 0
            );
            updatedMeasurements.bmr = bmr;
            updatedMeasurements.dailyCalories = calculateDailyCalories(bmr, measurements.activityLevel);
        }

        setMeasurements({
            ...measurements, ...updatedMeasurements
        });
    };

    const handleActivityLevelChange = (activityLevel: ActivityLevel) => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0.5,
                duration: 150,
                useNativeDriver: true
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true
            })
        ]).start();

        const bmr = calculateBMR(
            measurements.weight || 0,
            measurements.height || 0,
            measurements.age || 0
        );
        setMeasurements({
            ...measurements,
            activityLevel,
            bmr,
            dailyCalories: calculateDailyCalories(bmr, activityLevel)
        });
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Text style={styles.subtitle}>Ingresa tus datos físicos</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={measurements.weight.toString()}
                    onChangeText={(value) => handleInputChange('weight', value)}
                    placeholder="Ej: 70"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Altura (cm)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={measurements.height.toString()}
                    onChangeText={(value) => handleInputChange('height', value)}
                    placeholder="Ej: 170"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Edad</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={measurements.age.toString()}
                    onChangeText={(value) => handleInputChange('age', value)}
                    placeholder="Ej: 25"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nivel de Actividad</Text>
                <RNPickerSelect
                    onValueChange={handleActivityLevelChange}
                    value={measurements.activityLevel}
                    items={pickerItems}
                    style={pickerSelectStyles}
                    useNativeAndroidPickerStyle={false}
                    placeholder={{}}
                    Icon={() =>
                        <Ionicons
                            name="chevron-down"
                            size={24}
                            color="gray"
                        />
                    }
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    }
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        color: 'black',
        backgroundColor: '#F3F4F6',
        paddingRight: '15%',
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        color: 'black',
        backgroundColor: '#F3F4F6',
        paddingRight: 30,
    },
    iconContainer: {
        top: 18,
        right: 12,
    }
});

export default MeasurementsForm;