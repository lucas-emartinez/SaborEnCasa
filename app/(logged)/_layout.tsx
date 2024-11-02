import React from 'react'
import { Slot, Stack } from 'expo-router'

const loggedLayout = () => {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name='recipes/create' />
      <Stack.Screen name='recipes/recommendations' />
    </Stack>
  )
}

export default loggedLayout