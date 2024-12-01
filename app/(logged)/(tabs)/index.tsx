import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useRouter } from 'expo-router';
import { useData } from '@/context/DataProvider';
import { envConfig } from '@/configs/envConfig';
import { RecipeRecommender } from '@/hooks/useRecipeRecommender';
import { Recipe } from '@/types/types';
import { Cuisine, DietaryRestriction } from '@/types/enums';
import SearchBar from '@/components/Search';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { TipContainer } from '@/components/TipsContainer';
import { translateDietaryRestriction, translateCuisine } from '@/utils/enum-translations';
import recipes from './recipes';

// Filtros rápidos para el ScrollView horizontal
const QUICK_FILTERS = {
    restrictions: [
        DietaryRestriction.VEGAN,
        DietaryRestriction.VEGETARIAN,
        DietaryRestriction.LOW_FAT,
        DietaryRestriction.NO_SUGAR
    ]
};

// Filtros completos para el modal
const ALL_FILTERS = {
    restrictions: Object.values(DietaryRestriction),
    cuisines: Object.values(Cuisine),
};


const FilterTag = ({ title, active = false, onPress }: { title: string; active?: boolean; onPress?: () => void }) => (
    <TouchableOpacity
        style={[styles.filterTag, active && styles.filterTagActive]}
        onPress={onPress}
    >
        <Text style={[styles.filterTagText, active && styles.filterTagTextActive]}>
            {title}
        </Text>
    </TouchableOpacity>
);

const FilterModal = ({ visible, onClose, activeFilters, onToggleFilter }: {
    visible: boolean;
    onClose: () => void;
    activeFilters: {
        restrictions: Set<DietaryRestriction>;
        cuisines: Set<Cuisine>;
    };
    onToggleFilter: (group: "restrictions" | "cuisines", value: any) => void;
}) => (
    <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
    >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Filtros</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <ScrollView>
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterGroupTitle}>Restricciones dietéticas</Text>
                        <View style={styles.filterGroupContent}>
                            {ALL_FILTERS.restrictions.map((restriction) => (
                                <FilterTag
                                    key={restriction as unknown as string}
                                    title={translateDietaryRestriction(restriction)}
                                    active={activeFilters.restrictions.has(restriction)}
                                    onPress={() => onToggleFilter('restrictions', restriction)}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.filterGroup}>
                        <Text style={styles.filterGroupTitle}>Cocinas</Text>
                        <View style={styles.filterGroupContent}>
                            {ALL_FILTERS.cuisines.map((cuisine) => (
                                <FilterTag
                                    key={cuisine as unknown as string}
                                    title={translateCuisine(cuisine)}
                                    active={activeFilters.cuisines.has(cuisine)}
                                    onPress={() => onToggleFilter('cuisines', cuisine)}
                                />
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    </Modal>
);

const FoodItem = ({ title, imageUrl, id }: { id: string, title: string; imageUrl: string }) => (
    <TouchableOpacity
        onPress={() => router.push({
            pathname: '/recommendations/[id]',
            params: { id },
        })}
        style={styles.foodItem}
    >
        <View style={[styles.foodImage, !imageUrl && styles.imagePlaceholder]}>
            {imageUrl && <Image
                source={{ uri: imageUrl }}
                style={styles.foodImage}
            />}
        </View>
        <Text numberOfLines={2} style={styles.foodTitle}>{title}</Text>
    </TouchableOpacity>
);

export default function Home() {
    const insets = useSafeAreaInsets();
    const navigation = useRouter();
    const { user, ingredients, recipes, isInitialized, isLoading, setCurrentRecommendations } = useData();
    const [recommendations, setRecommendations] = useState<Recipe[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isCalculating, setIsCalculating] = useState(true);
    const [activeFilters, setActiveFilters] = useState<{
        restrictions: Set<DietaryRestriction>;
        cuisines: Set<Cuisine>;
    }>({
        restrictions: new Set(),
        cuisines: new Set()
    });

    useEffect(() => {
        const loadRecommendations = () => {
            if (!isInitialized ||
                isLoading ||
                !user?.Onboarding?.completed ||
                !user?.preferences?.preferredCategories?.length) {
                return;
            }

            try {
                const recommender = new RecipeRecommender(
                    recipes,
                    user,
                    ingredients,
                );

                const newRecommendations = recommender.getRecommendations(5, true);
                if (newRecommendations && newRecommendations.length > 0) {
                    setCurrentRecommendations(newRecommendations);
                    setRecommendations(newRecommendations);
                    setFilteredRecipes(newRecommendations);
                }
            } catch (error) {
                console.error('Error loading recommendations:', error);
            } finally {
                setIsCalculating(false);
            }
        };

        loadRecommendations();
        return () => {
            setCurrentRecommendations([]);
            setRecommendations([]);
            setFilteredRecipes([]);
        };
    }, [isInitialized, isLoading]);

    const toggleFilter = (group: keyof typeof activeFilters, value: DietaryRestriction | Cuisine) => {
        setActiveFilters(prev => {
            const newFilters = { ...prev };
            if (newFilters[group].has(value)) {
                newFilters[group].delete(value);
            } else {
                newFilters[group].add(value);
            }
            return newFilters;
        });
    };

    useEffect(() => {
        if (!recommendations.length) return;

        let filtered = [...recommendations];

        // Filtrar por restricciones dietéticas
        if (activeFilters.restrictions.size > 0) {
            filtered = filtered.filter(recipe => {
                const cumpleRestricciones = Array.from(activeFilters.restrictions)
                    .every(restriction => recipe.restrictions.includes(restriction));

                return cumpleRestricciones;
            });
        }

        // Filtrar por tipo de cocina
        if (activeFilters.cuisines.size > 0) {
            filtered = filtered.filter(recipe => {
                const cumpleCocina = Array.from(activeFilters.cuisines)
                    .some(cuisine => recipe.cuisine === cuisine);
                return cumpleCocina;
            });
        }

        setFilteredRecipes(filtered);
    }, [activeFilters, recommendations]);

    const renderFilterSection = () => (
        <View style={styles.filterSection}>
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilterModal(true)}
            >
                <Ionicons name="filter" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <ScrollView horizontal scrollEnabled showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {QUICK_FILTERS.restrictions.map((restriction) => (
                    <FilterTag
                        key={restriction}
                        title={translateDietaryRestriction(restriction)}
                        active={activeFilters.restrictions.has(restriction)}
                        onPress={() => toggleFilter('restrictions', restriction)}
                    />
                ))}
            </ScrollView>
        </View>
    );

    const renderRecommendedSection = () => {
        const hasActiveFilters = activeFilters.restrictions.size > 0 || activeFilters.cuisines.size > 0;
        const recipesToShow = hasActiveFilters ? filteredRecipes : recommendations;

        return (
            <View style={styles.recommendedSection}>
                <View style={styles.recommendedHeader}>
                    <Text style={styles.recommendedTitle}>Recomendado para ti</Text>
                    <TouchableOpacity onPress={() => router.navigate('/(logged)/recommendations')}>
                        <Text style={styles.seeAllText}>Ver Todo</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {
                        (isCalculating)
                            ? <SkeletonLoader />
                            : recipesToShow.map(recipe => (
                                <FoodItem
                                    key={recipe.id}
                                    id={recipe.id}
                                    title={recipe.name}
                                    imageUrl={recipe.image ? `${envConfig.IMAGE_SERVER_URL}/recipes/${recipe.image}` : ''}
                                />
                            ))
                    }

                </ScrollView>

                {
                    !isCalculating && isInitialized && recipesToShow.length === 0 &&
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            {hasActiveFilters
                                ? "No se encontraron recetas que coincidan con los filtros seleccionados"
                                : "No hay recomendaciones disponibles"}
                        </Text>
                    </View>
                }
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                            {user && (
                                <TouchableOpacity
                                    onPress={() => router.navigate('/(logged)/profile')}
                                >
                                    <View style={[styles.avatar, !user.image && styles.avatarPlaceholder]}>
                                        {user.image && <Image
                                            source={{ uri: `${envConfig.IMAGE_SERVER_URL}/users/${user.image}` }}
                                            style={styles.avatar}
                                        />}
                                    </View>
                                </TouchableOpacity>
                            )}
                            <Text style={styles.greeting}>Hola,</Text>
                            <Text style={styles.userName}>{user?.name || ''}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <SearchBar />

                {renderFilterSection()}
                {renderRecommendedSection()}
                <TipContainer />
            </ScrollView>

            <View style={[styles.createRecipeButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={styles.createRecipeButton}
                    onPress={() => navigation.push('/(logged)/recipes/create')}
                >
                    <Text style={styles.createRecipeText}>Crear Receta</Text>
                </TouchableOpacity>
            </View>

            <FilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                activeFilters={activeFilters}
                onToggleFilter={toggleFilter}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 64
    },
    scrollView: {
        flex: 1,
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
    filterSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filterButton: {
        padding: 8,
        marginRight: 8,
    },
    filterContainer: {
        flexGrow: 0,
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
        width: 120,
    },
    foodImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    imagePlaceholder: {
        backgroundColor: '#F2F2F2',
    },
    foodTitle: {
        marginTop: 4,
        fontSize: 12, // Reducido para que quepa mejor
        lineHeight: 16, // Ajustado para mejor espaciado
        textAlign: 'left', // Cambiado a left alignment
        color: '#333333',
        paddingHorizontal: 4, // Añadido padding horizontal
        height: 32, // Altura fija para 2 líneas
    },
    createRecipeButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        backgroundColor: 'fff',
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingBottom: 16,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    filterGroup: {
        marginVertical: 16,
    },
    filterGroupTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    filterGroupContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    applyButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    applyButtonText: {
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
        paddingHorizontal: 16,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        maxWidth: 250,
    },
});

