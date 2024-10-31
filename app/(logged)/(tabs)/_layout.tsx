import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

// Constantes para la configuración del TabBar
const TAB_CONFIG = {
  ACTIVE_COLOR: '#23B361',
  INACTIVE_COLOR: 'gray',
  BAR_HEIGHT: 60,
  ICON_SIZE: 24,
};

// Configuración de las pestañas
const TAB_SCREENS = [
  {
    name: 'index',
    title: 'Inicio',
    icon: ({ color, size }: any) => (
      <Image
        style={{
          width: size + 10,
          height: size + 10,
          opacity: color === TAB_CONFIG.ACTIVE_COLOR ? 1 : 0.5,
        }}
        source={require('../../../assets/images/logo.png')}
        resizeMode="contain"
      />
    ),
  },
  {
    name: 'recipes',
    title: 'Recetas',
    icon: ({ color, size }: any) => (
      <Ionicons name="book-outline" size={size} color={color} />
    ),
  },
  {
    name: 'shopping',
    title: 'Compras',
    icon: ({ color, size }: any) => (
      <Ionicons name="card-outline" size={size} color={color} />
    ),
  },
  {
    name: 'profile',
    title: 'Perfil',
    icon: ({ color, size }: any) => (
      <Ionicons name="person-outline" size={size} color={color} />
    ),
  },
];

// Estilos comunes para el TabBar
const tabBarOptions = {
  tabBarActiveTintColor: TAB_CONFIG.ACTIVE_COLOR,
  tabBarInactiveTintColor: TAB_CONFIG.INACTIVE_COLOR,
  tabBarStyle: {
    backgroundColor: 'white',
    borderTopColor: 'rgba(0,0,0,0.1)',
    height: TAB_CONFIG.BAR_HEIGHT,
    elevation: 0, // Para Android
    shadowOpacity: 0, // Para iOS
    borderTopWidth: 1,
  },
  tabBarLabelStyle: {
    marginTop: -5, // Ajusta el texto más arriba
    marginBottom: 5, // Ajusta el texto más abajo
    fontSize: 12,
  },
  tabBarIconStyle: {
    marginTop: 5, // Añade un poco de espacio arriba del icono
  },
  headerShown: false,
};

export default function TabLayout() {
  return (
    <Tabs screenOptions={tabBarOptions}>
      {TAB_SCREENS.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: ({ color, size }) => screen.icon({ color, size: TAB_CONFIG.ICON_SIZE }),
          }}
        />
      ))}
    </Tabs>
  );
}