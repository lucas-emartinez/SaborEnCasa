import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const NotFoundScreen = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <LottieView
                source={require('@/assets/animations/not-found.json')}
                autoPlay
                loop
                style={styles.animation}
            />
            <Text style={styles.title}>¡Ups! No encontramos esta receta</Text>
            <Text style={styles.subtitle}>
                La receta que buscas no está disponible en este momento
            </Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.back()}
            >
                <Text style={styles.buttonText}>Volver</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    animation: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default NotFoundScreen;