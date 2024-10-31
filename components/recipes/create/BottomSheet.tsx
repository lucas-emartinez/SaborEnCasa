import React from 'react'
import BottomSheet from '@gorhom/bottom-sheet'
import BottomSheetNotFoundContent from '@/components/recipes/create/BottomSheetNotFoundContent'
import BottomSheetFoundContent from './BottomSheetFoundContent'
import { Ingredient } from '@/types/types'
import { StyleSheet } from 'react-native'

const BottomSheetComponent = ({bottomSheetRef, found, scannedProduct, addIngredient, handleRecommendation, handleScanAgain}: {
    bottomSheetRef: React.RefObject<BottomSheet>,
    found: boolean,
    scannedProduct: any
    addIngredient: (ingredient: Ingredient) => void,
    handleRecommendation: (product: Ingredient) => void,
    handleScanAgain: () => void
}) => {
  return (
    <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          style={styles.container}
          snapPoints={['45%']}
          enablePanDownToClose={true}
        >
          {
          found ? <BottomSheetFoundContent bottomSheetRef={bottomSheetRef} 
                                           scannedProduct={scannedProduct}
                                           addIngredient={addIngredient}
                                           handleRecommendation={handleRecommendation}
                                           handleScanAgain={handleScanAgain}
                                           /> 
                : <BottomSheetNotFoundContent />
        }
    </BottomSheet>
  )
}

export default BottomSheetComponent

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white', 
    borderTopLeftRadius: 48, 
    borderTopRightRadius: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

})