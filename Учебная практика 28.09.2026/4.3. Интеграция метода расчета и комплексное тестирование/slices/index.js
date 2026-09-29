import { configureStore } from '@reduxjs/toolkit'
import partnersSlice from './partnersSlice.js'
import salesHistorySlice from './salesHistory.js'

export default configureStore({
  reducer: {
    partners: partnersSlice,
    salesHistory: salesHistorySlice,
  },
})
