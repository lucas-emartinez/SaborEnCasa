import React, { useEffect } from 'react'
import { router, Slot, Stack } from 'expo-router'
import { useData } from '@/context/DataProvider';
import { LoadingScreen } from '@/components/LoadingScreen';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

const loggedLayout = () => {
  const { user, isInitialized, isLoading } = useData();

  useEffect(() => {
    if (!isInitialized && !isLoading && !user?.Onboarding.completed) {
      router.replace('/(logged)/onboarding/onboardingSteps');
    }
  }, [user]);

  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BottomSheetModalProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding/onboardingSteps" />
        <Stack.Screen name="recipes/create" />
        <Stack.Screen name="recommendations/index" />
        <Stack.Screen name='recommendations/[id]' />
        <Stack.Screen name="tips/[id]" />
      </Stack>
    </BottomSheetModalProvider>
  )
}

export default loggedLayout