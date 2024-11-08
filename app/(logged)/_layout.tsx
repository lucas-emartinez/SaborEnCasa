import React, { useEffect } from 'react'
import { router, Slot, Stack } from 'expo-router'
import { useData } from '@/context/DataProvider';
import { LoadingScreen } from '@/components/LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loggedLayout = () => {
  const { user, loading } = useData();
  useEffect(() => {
    if (!loading && user && !user.Onboarding.completed) {
      router.replace('/onboarding/onboardingSteps');
    }
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding/onboardingSteps" />
      <Stack.Screen name="recipes/create" />
      <Stack.Screen name="recommendations/index" />
      <Stack.Screen name='recommendations/[id]' />
    </Stack>
  )
}

export default loggedLayout