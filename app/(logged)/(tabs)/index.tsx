import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useRouter } from 'expo-router';
import { useData } from '@/context/DataProvider';
import { envConfig } from '@/configs/envConfig';
import { useRecipeRecommendations } from '@/hooks/useRecipeRecommender';
import { Recipe } from '@/types/types';
import { SkeletonLoader } from '@/components/SkeletonLoader';


const FilterTag = ({ title, active = false, onPress }: { title: string; active?: boolean; onPress?: () => void }) => (
    <TouchableOpacity
        style={[styles.filterTag, active && styles.filterTagActive]}
        onPress={onPress}
    >
        <Text style={[styles.filterTagText, active && styles.filterTagTextActive]}>{title}</Text>
    </TouchableOpacity>
);

const FoodItem = ({ title, imageUrl, id }: { id: string, title: string; imageUrl: string }) => (
    <TouchableOpacity onPress={() => router.push({
        pathname: '/recommendations/[id]',
        params: { id },
    })} style={styles.foodItem}>
        <View style={[styles.foodImage, !imageUrl && styles.imagePlaceholder]}>
            {imageUrl && <Image
                source={{ uri: imageUrl }}
                style={styles.foodImage}
            />}
        </View>
        <Text style={styles.foodTitle}>{title}</Text>
    </TouchableOpacity>
);

export default function Home() {
    const insets = useSafeAreaInsets();
    const navigation = useRouter();
    const { user, ingredients, recipes, loading, setCurrentRecommendations, currentRecommendations } = useData();

    // Inicializar el hook de recomendaciones
    const { getRecommendations, isCalculating } = useRecipeRecommendations(
        recipes || [],
        user,
        ingredients || [],
    );

    const loadRecommendations = async () => {
        if (loading || isCalculating) {
            return;
        }

        try {
            if (!recipes?.length || !user) {
                console.log("Missing required data");
                return;
            }

            const newRecommendations = getRecommendations();
            // Verificar si las recomendaciones son válidas
            if (newRecommendations && newRecommendations.length > 0) {
                setCurrentRecommendations(newRecommendations);
            } else {
                console.log("No recommendations returned");
            }
        } catch (error) {
            console.error('Error loading recommendations:', error);
        }
    };


    useEffect(() => {
        if (!loading && recipes && user) {
            loadRecommendations();
        }
    }, [loading]);


    const renderRecommendedSection = () => {

        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {currentRecommendations.length ?
                    currentRecommendations.slice(0, 4).map((recipe: Recipe, index) => {
                        return (
                            <FoodItem
                                key={recipe.id || index}
                                title={recipe.name}
                                imageUrl={recipe.image ? `${envConfig.IMAGE_SERVER_URL}/recipes/${recipe.image}` : ''}
                                id={recipe.id}
                            />
                        );
                    }) :
                    <SkeletonLoader />
                }
            </ScrollView>
        );
    };

    // Renderizado principal
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                {/* Header y búsqueda siempre visibles */}
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                            {user && (
                                <View style={[styles.avatar, !user.image && styles.avatarPlaceholder]}>
                                    {user.image && <Image
                                        source={{ uri: `${envConfig.IMAGE_SERVER_URL}/users/${user.image}` }}
                                        style={styles.avatar}
                                    />}
                                </View>
                            )}
                            <Text style={styles.greeting}>Hola,</Text>
                            <Text style={styles.userName}>{user?.name || ''}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="gray" />
                    <TextInput
                        style={styles.searchText}
                        placeholder="Escriba algo"
                        placeholderTextColor="gray"
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    <FilterTag title="Vegano" active />
                    <FilterTag title="Economico" />
                    <FilterTag title="Rapido" active />
                    <FilterTag title="Compartir" />
                </ScrollView>

                {/* Sección de recomendaciones con manejo de estados */}
                <View style={styles.recommendedSection}>
                    <View style={styles.recommendedHeader}>
                        <Text style={styles.recommendedTitle}>Recomendado para ti</Text>
                        <TouchableOpacity onPress={() => router.navigate('/(logged)/recommendations')}>
                            <Text style={styles.seeAllText}>Ver Todo</Text>
                        </TouchableOpacity>
                    </View>
                    {renderRecommendedSection()}
                </View>
            </ScrollView>

            <View style={[styles.createRecipeButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={styles.createRecipeButton}
                    onPress={() => navigation.push('/(logged)/recipes/create')}
                >
                    <Text style={styles.createRecipeText}>Crear Receta</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 80,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarPlaceholder: {
        backgroundColor: '#F2F2F2',
    },
    greeting: {
        fontSize: 16,
        color: 'gray',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 25,
        margin: 16,
        padding: 10,
    },
    searchText: {
        flex: 1,
        marginLeft: 10,
        color: 'gray',
    },
    filterContainer: {
        paddingHorizontal: 16,
    },
    filterTag: {
        backgroundColor: '#F2F2F2',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
    },
    filterTagActive: {
        backgroundColor: '#4CAF50',
    },
    filterTagText: {
        color: 'gray',
    },
    filterTagTextActive: {
        color: 'white',
    },
    recommendedSection: {
        flex: 1,
        margin: 16,
    },
    recommendedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    recommendedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    seeAllText: {
        color: '#4CAF50',
    },
    foodItem: {
        marginRight: 16,
        alignItems: 'center',
        width: 100,
    },
    foodImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    imagePlaceholder: {
        backgroundColor: '#F2F2F2',
    },
    foodTitle: {
        marginTop: 4,
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Roboto',
        fontWeight: 'semibold',
        color: '#333333',
    },
    createRecipeButtonContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    createRecipeButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        padding: 16,
        alignItems: 'center',
    },
    createRecipeText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    skeletonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 16,
    },
    skeletonItem: {
        width: 100,
        height: 140,
        backgroundColor: '#E1E9EE',
        borderRadius: 8,
        marginRight: 16,
    },

    emptyState: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
    },
});