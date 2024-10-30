// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DataProvider } from '@/context/DataProvider';
import { useDataLoader } from '@/hooks/useDataLoader';
import { View, Text, ActivityIndicator } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text style={{ marginTop: 10 }}>Cargando datos...</Text>
  </View>
);

const ErrorScreen = ({ message }: { message: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>Error al cargar los datos</Text>
    <Text style={{ textAlign: 'center' }}>{message}</Text>
  </View>
);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { ingredients, recipes, isLoading, error } = useDataLoader();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  if (!loaded || isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <DataProvider
        rawIngredientsData={ingredients}
        rawRecipesData={recipes}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(logged)" options={{ headerShown: false }} />
        </Stack>
      </DataProvider>
    </ThemeProvider>
  );
}