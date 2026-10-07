import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit'
import axios from 'axios'
import routes from '../routes.js'


export const fetchSalesHistory = createAsyncThunk(
  'salesHistory/fetchByPartner',
  async (partnerId, { rejectWithValue }) => {
    // console.log('[SLICE] sales history inbound: ', partnerId)
    if (!partnerId || partnerId === '' || Number.isNaN(Number(partnerId))) {
      return rejectWithValue('Некорректный ID партнёра')
    }
    try {
      const response = await axios.get(routes.salesHistoryPath(partnerId))
      // console.log('[SLICE] sales history response: ', response.data)
      return response.data
    } catch (error) {
      console.error('[SLICE] Error sales history:', error)
      return rejectWithValue(error.response?.data || { error: error.message })
    }
  }
)

const salesHistoryAdapter = createEntityAdapter({
  selectId: (sale) => sale.sale_id,
  sortComparer: (a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime(),
})

const initialState = salesHistoryAdapter.getInitialState({
  status: 'idle',
  error: null,
})

const salesHistorySlice = createSlice({
  name: 'salesHistory',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesHistory.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSalesHistory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        salesHistoryAdapter.setAll(state, action.payload)
      })
      .addCase(fetchSalesHistory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Неизвестная ошибка'
      })
  },
})

export const salesHistorySelectors = salesHistoryAdapter.getSelectors(state => state.salesHistory)
export default salesHistorySlice.reducer
