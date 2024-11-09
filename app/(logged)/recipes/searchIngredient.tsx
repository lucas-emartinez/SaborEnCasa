// components/recipes/create/SearchIngredientSheet.tsx
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFetch } from '@/hooks/useFetch';
import { useIngredientMapper } from '@/hooks/useIngredientMapper';
import { envConfig } from '@/configs/envConfig';
import { Ingredient } from '@/types/types';
import { debounce } from '@/utils/debounce';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

interface SearchIngredientSheetProps {
    bottomSheetRef: React.RefObject<BottomSheetModal>;
    onSelectIngredient: (ingredient: Ingredient) => void;
    knownIngredients: Ingredient[];
    onClose: () => void
}

const SearchIngredientSheet: React.FC<SearchIngredientSheetProps> = ({
    bottomSheetRef,
    onSelectIngredient,
    knownIngredients,
    onClose
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
    const [offResults, setOffResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const { fetchData } = useFetch();
    const { mapIngredientByName } = useIngredientMapper(knownIngredients);

    // Buscar en ingredientes locales
    const searchLocalIngredients = (term: string) => {
        if (!term) {
            setSearchResults([]);
            return;
        }

        const normalizedTerm = term.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const results = knownIngredients?.filter(ingredient => {
            const normalizedName = ingredient.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalizedName.includes(normalizedTerm) ||
                ingredient.keywords.some(keyword =>
                    keyword.toLowerCase().includes(normalizedTerm)
                );
        });

        setSearchResults(results);
    };

    // Buscar en Open Food Facts
    const searchOpenFoodFacts = async (term: string) => {
        try {
            const response = await fetchData(
                `${envConfig.OPEN_FOOD_FACTS_API_URL}?search_terms=${term}&json=1`,
                { method: 'GET' }
            );
            console.log(response)
            if (response?.products) {
                const mappedProducts = response.products
                    .map((product: any) => {
                        const mappedIngredient = mapIngredientByName({
                            product: {
                                product_name: product.product_name,
                                categories_tags: product.categories_tags,
                                nutriments: product.nutriments
                            }
                        });

                        if (mappedIngredient) {
                            return {
                                ...mappedIngredient,
                                image: product.image_url || mappedIngredient.image,
                                off_data: true
                            };
                        }
                        return null;
                    })
                    ?.filter(Boolean);

                setOffResults(mappedProducts);
            }
        } catch (error) {
            console.error('Error searching OFF:', error);
        }
    };

    const debouncedSearch = useCallback(
        debounce((term: string) => {
            setIsSearching(true);
            searchLocalIngredients(term);
            searchOpenFoodFacts(term).finally(() => setIsSearching(false));
        }, 500),
        []
    );

    const handleSearch = (text: string) => {
        setSearchTerm(text);
        debouncedSearch(text);
    };

    const renderItem = ({ item }: { item: Ingredient }) => {
        const imageUrl = item.image.includes("http")
            ? item.image
            : `${envConfig.IMAGE_SERVER_URL}/ingredients/${item.image}`;

        return (
            <TouchableOpacity
                style={styles.resultItem}
                onPress={() => onSelectIngredient(item)}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.resultImage}
                />
                <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    {item.keywords?.length > 0 && (
                        <Text style={styles.resultKeywords}>
                            {item.keywords.slice(0, 3).join(', ')}
                        </Text>
                    )}
                </View>
                {(item as any).off_data && (
                    <Ionicons name="globe-outline" size={20} color="#666" />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <BottomSheetModal
            ref={bottomSheetRef}
            index={0}
            snapPoints={['25%', '50%', '75%']}
            enablePanDownToClose
            onDismiss={onClose}
            backgroundStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            handleIndicatorStyle={styles.handleIndicator}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Buscar Ingrediente</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="gray" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Escriba algo"
                        placeholderTextColor="gray"
                        value={searchTerm}
                        onChangeText={handleSearch}
                    />
                    {isSearching && (
                        <ActivityIndicator size="small" color="gray" />
                    )}
                </View>

                <FlatList
                    data={[...searchResults, ...offResults]}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.id?.toString() || `off-${index}`}
                    style={styles.resultsList}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                {searchTerm ? 'No se encontraron resultados' : 'Ingresa un término de búsqueda'}
                            </Text>
                        </View>
                    )}
                />
            </View>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    handleIndicator: {
        width: 40,
        height: 4,
        backgroundColor: '#DADADA',
        borderRadius: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    resultsList: {
        flex: 1,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFF',
        borderRadius: 12,
    },
    resultImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    resultInfo: {
        flex: 1,
        marginLeft: 12,
    },
    resultName: {
        fontSize: 16,
        fontWeight: '500',
    },
    resultKeywords: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    separator: {
        height: 8,
    },
    emptyState: {
        alignItems: 'center',
        padding: 24,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
    },
});

export default SearchIngredientSheet;