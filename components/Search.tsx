import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/context/DataProvider';
import { Recipe } from '@/types/types';
import { debounce } from '@/utils/debounce';
import { router } from 'expo-router';
import { envConfig } from '@/configs/envConfig';
import { translateCuisine, translateCategory } from '@/utils/enum-translations';


interface SearchDropdownProps {
    results: Recipe[];
    onSelect: (recipe: Recipe) => void;
    visible: boolean;
}

const SearchDropdown = ({ results, onSelect, visible }: SearchDropdownProps) => {
    if (!visible || results.length === 0) return null;

    return (
        <View style={styles.dropdownContainer}>
            <ScrollView style={styles.dropdown} keyboardShouldPersistTaps="never">
                {results.map((recipe) => (
                    <TouchableOpacity
                        key={recipe.id}
                        style={styles.dropdownItem}
                        onPress={() => onSelect(recipe)}
                    >
                        <View>
                            <Image style={styles.image} source={{uri:`${envConfig.IMAGE_SERVER_URL}/recipes/${recipe.image}`}} />
                        </View>
                        <View>
                            <Text style={styles.dropdownTitle}>{recipe.name}</Text>
                            <Text style={styles.dropdownSubtitle}>
                                {`${translateCuisine(recipe.cuisine)} • ${translateCategory(recipe.category)}`}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const SearchBar = () => {
    const { recipes } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Recipe[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const handleSearch = useCallback((text: string) => {
        if (!text.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        const filteredRecipes = recipes.filter(recipe => 
            recipe.name.toLowerCase().includes(text.toLowerCase()) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase()))
        );

        setSearchResults(filteredRecipes.slice(0, 5)); // Limitamos a 5 resultados
        setShowDropdown(true);
    }, [recipes]);

    const debouncedSearch = debounce(handleSearch, 300);

    const handleTextChange = (text: string) => {
        setSearchQuery(text);
        debouncedSearch(text);
    };

    const handleSelectRecipe = (recipe: Recipe) => {
        setSearchQuery('');
        setShowDropdown(false);
        // Removemos el Keyboard.dismiss() ya que no es necesario
        router.push({
            pathname: '/recommendations/[id]',
            params: { id: recipe.id, fromSearch: 'true' },
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={20} color="gray" />
                <TextInput
                    ref={inputRef}
                    style={styles.searchText}
                    placeholder="Buscar recetas..."
                    placeholderTextColor="gray"
                    value={searchQuery}
                    onChangeText={handleTextChange}
                    onFocus={() => {
                        if (searchQuery.trim() && searchResults.length > 0) {
                            setShowDropdown(true);
                        }
                    }}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setShowDropdown(false);
                            inputRef.current?.clear();
                            Keyboard.dismiss();
                        }}
                    >
                        <Ionicons name="close-circle" size={20} color="gray" />
                    </TouchableOpacity>
                )}
            </View>
            {/* Removemos el TouchableWithoutFeedback y agregamos una capa de presión para cerrar */}
            {showDropdown && (
                <>
                    <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
                        <View style={styles.backdrop} />
                    </TouchableWithoutFeedback>
                    <SearchDropdown
                        results={searchResults}
                        onSelect={handleSelectRecipe}
                        visible={showDropdown}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 1000,
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
        fontSize: 14,
    },
    dropdownContainer: {
        position: 'absolute',
        top: '100%',
        left: 16,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        maxHeight: 300,
        marginTop: -12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1001,
    },
    dropdown: {
        maxHeight: 300,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',

    },
    dropdownTitle: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    dropdownSubtitle: {
        fontSize: 12,
        color: 'gray',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    backdrop: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        bottom: -1000, // Valor grande para cubrir toda la pantalla
        backgroundColor: 'transparent',
        zIndex: 999,
    }
});

export default SearchBar;