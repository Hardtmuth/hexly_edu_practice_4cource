import { configureStore } from '@reduxjs/toolkit'
import partnersSlice from './partnersSlice.js'
import salesHistorySlice from './salesHistory.js'
import calculationSlice from './calculationSlice.js'
import productSlice from './productSlice.js'

export default configureStore({
  reducer: {
    partners: partnersSlice,
    salesHistory: salesHistorySlice,
    calculation: calculationSlice,
    products: productSlice,
  },
})
