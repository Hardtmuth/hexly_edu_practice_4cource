import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import routes from '../routes.js'

export const calculateRawMaterialThunk = createAsyncThunk(
  'calculation/calculateRawMaterial',
  async (calulationData, { rejectWithValue }) => {
    console.log('[SLICE] calculation inbound: ', calulationData )
    try {
      const response = await axios.post(routes.calculateRawMaterial(), calulationData)
      console.log('[SLICE] calculation response: ', response.data)
      return response.data
    } catch (error) {
      console.error('[SLICE] Error calculation: ', error)
      return rejectWithValue(error.response?.data || { error: error.message })
    }
  },
)

const initialState = {
  result: null,
  error: null,
  loading: false,
}

const calculationSlice = createSlice({
  name: 'calculation',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(calculateRawMaterialThunk.pending, (state) => {
        state.loading = true
        state.error = null
        state.result = null
      })
      .addCase(calculateRawMaterialThunk.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.result === -1) {
          state.error = action.payload.error
          state.result = null
        } else {
          state.result = action.payload.result
          state.error = null
        }
      })
      .addCase(calculateRawMaterialThunk.rejected, (state, _action) => {
        state.loading = false
        state.error = 'Ошибка сети или сервера'
        state.result = null
      })
  },
})

export default calculationSlice.reducer
