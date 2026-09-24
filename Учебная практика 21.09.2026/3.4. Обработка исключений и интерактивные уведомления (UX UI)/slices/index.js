import { configureStore } from '@reduxjs/toolkit'
import partnersSlice from './partnersSlice.js'

export default configureStore({
  reducer: {
    partners: partnersSlice,
  },
})
