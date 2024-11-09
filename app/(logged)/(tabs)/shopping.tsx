import { View, Text } from 'react-native'
import React from 'react'
import { useData } from '@/context/DataProvider'

const shopping = () => {
  const { shoppingList } = useData();

  return (
    <View>
      {
        shoppingList.length > 0 ? (
          shoppingList.map(({ingredient}, index) => (
            <Text key={index}>{ingredient.name} - {ingredient.quantity}</Text>
          ))
        ) : (
          <Text>No hay ingredientes en la lista de compras</Text>
        )
      }
    </View>
  )
}

export default shopping