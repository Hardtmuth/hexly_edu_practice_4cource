import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import routes from '../routes.js'



export const fetchPartners = createAsyncThunk(
  'partners/fetchPartners',
  async () => {
    const response = await axios.get(routes.partnersSummaryPath())
    // console.log('[SLICE] padtners: ',response.data)
    return response.data
  },
)

const partnersAdapter = createEntityAdapter({
  selectId: (entity) => entity.partner_id,
})

const initialState = partnersAdapter.getInitialState({
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
})

const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartners.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchPartners.fulfilled, (state, action) => {
        partnersAdapter.setAll(state, action.payload)
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Unknown error'
      })
  },
})

export const partnersSelectors = partnersAdapter.getSelectors(state => state.partners)
export default partnersSlice.reducer
