import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../../../context/DataProvider'; // Ajusta la ruta según tu estructura

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user } = useData(); // Usa el contexto para obtener los datos del usuario

  const handleLogout = () => {
    console.log('Logout');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* Manteniendo la imagen existente */}
      <Image
        style={styles.profileImage}
        source={require('../../../assets/images/users/userProfile.png')} // Ruta de la imagen existente
      />
      <Text style={styles.nameText}>{user?.name || 'Nombre no disponible'}</Text>
      <Text style={styles.usernameText}>{user?.email || 'Email no disponible'}</Text>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>

        <Text style={styles.subTitle}>Restricciones Dietéticas:</Text>
        <Text style={styles.text}>{user?.preferences?.dietaryRestrictions?.join(', ') || 'Ninguna'}</Text>

        <Text style={styles.subTitle}>Objetivos:</Text>
        <Text style={styles.text}>{user?.preferences?.goals?.join(', ') || 'No especificado'}</Text>

        <Text style={styles.subTitle}>Categorías Preferidas:</Text>
        <Text style={styles.text}>{user?.preferences?.preferredCategories?.join(', ') || 'No especificado'}</Text>

        <Text style={styles.subTitle}>Cocinas Preferidas:</Text>
        <Text style={styles.text}>{user?.preferences?.preferredCuisines?.join(', ') || 'No especificado'}</Text>
      </View>

      {/* Measurements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medidas y Actividad</Text>

        <Text style={styles.subTitle}>Peso:</Text>
        <Text style={styles.text}>{user?.measurements?.weight || 'N/A'} kg</Text>

        <Text style={styles.subTitle}>Altura:</Text>
        <Text style={styles.text}>{user?.measurements?.height || 'N/A'} cm</Text>

        <Text style={styles.subTitle}>Edad:</Text>
        <Text style={styles.text}>{user?.measurements?.age || 'N/A'} años</Text>

        <Text style={styles.subTitle}>Nivel de Actividad:</Text>
        <Text style={styles.text}>{user?.measurements?.activityLevel || 'N/A'}</Text>

        <Text style={styles.subTitle}>Tasa Metabólica Basal (BMR):</Text>
        <Text style={styles.text}>{user?.measurements?.bmr || 'N/A'} kcal</Text>

        <Text style={styles.subTitle}>Calorías Diarias:</Text>
        <Text style={styles.text}>{user?.measurements?.dailyCalories || 'N/A'} kcal</Text>
      </View>

      {/* Botón de Logout al final del ScrollView */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  backText: {
    fontSize: 24,
    color: '#333',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    shadowRadius: 5,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0.5, height: 0.5 },
    elevation: 5,
  },
  nameText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginVertical: 5,
  },
  usernameText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 60,
    backgroundColor: '#EF4444',
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
  },
  text: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 5,
  },
});

export default ProfileScreen;