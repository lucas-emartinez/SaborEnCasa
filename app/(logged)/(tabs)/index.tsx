import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '@/context/DataProvider';

const FilterTag = ({ title, active = false }) => (
    <TouchableOpacity style={[styles.filterTag, active && styles.filterTagActive]}>
        <Text style={[styles.filterTagText, active && styles.filterTagTextActive]}>{title}</Text>
    </TouchableOpacity>
);

const FoodItem = ({ title, price, imageUrl }) => (
    <View style={styles.foodItem}>
        <Image source={{ uri: imageUrl }} style={styles.foodImage} />
        <Text style={styles.foodTitle}>{title}</Text>
        <Text style={styles.foodPrice}>{price}</Text>
    </View>
);



export default function Home() {
    const insets = useSafeAreaInsets();
    const navigation = useRouter();
    const { user } = useData();


    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                            {user && <Image source={require("@/assets/images/users/userProfile.jpg")} style={styles.avatar} />}
                            <Text style={styles.greeting}>Hola,</Text>
                            <Text style={styles.userName}>{user?.name}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="gray" />
                    <TextInput style={styles.searchText} placeholder="Escriba algo" />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    <FilterTag title="Vegano" active />
                    <FilterTag title="Economico" />
                    <FilterTag title="Rapido" active />
                    <FilterTag title="Compartir" />
                </ScrollView>

                <View style={styles.recommendedSection}>
                    <View style={styles.recommendedHeader}>
                        <Text style={styles.recommendedTitle}>Recomendado para ti</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Ver Todo</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FoodItem
                            title="Veggie tomato mix"
                            price="N1,900"
                            imageUrl="/placeholder.svg?height=100&width=100"
                        />
                        <FoodItem
                            title="Egg and cucumber..."
                            price="N1,900"
                            imageUrl="/placeholder.svg?height=100&width=100"
                        />
                    </ScrollView>
                </View>
            </ScrollView>
            <View style={[styles.createRecipeButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity style={styles.createRecipeButton}
                    onPress={() => navigation.push('recipes/create')}
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
        paddingBottom: 80, // Add extra padding to ensure content is not hidden behind the button
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
    },
    foodImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    foodTitle: {
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
    },
    foodPrice: {
        color: '#FF6347',
        fontWeight: 'bold',
    },
    createRecipeButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    createRecipeButton: {
        backgroundColor: '#2196F3',
        borderRadius: 25,
        padding: 16,
        alignItems: 'center',
    },
    createRecipeText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});