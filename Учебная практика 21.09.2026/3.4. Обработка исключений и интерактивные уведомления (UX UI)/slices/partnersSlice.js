import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import routes from '../routes.js'

export const fetchPartners = createAsyncThunk(
  'partners/fetchPartners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(routes.partnersSummaryPath())
      console.log('[SLICE] fetch partners: ', response.data)
      return response.data
    } catch (error) {
      console.error('[SLICE] Error fetching partners:', error)
      return rejectWithValue(error.response?.data || { error: error.message })
    }
  },
)

export const addPartner = createAsyncThunk(
  'partners/addPartner',
  async (partnerData, { rejectWithValue }) => {
    console.log('[SLICE] add partners inbound: ', partnerData)
    try {
      const response = await axios.post(routes.partnersPath(), partnerData)
      console.log('[SLICE] add partner response: ', response.data)
      return response.data
    } catch (error) {
      console.error('[SLICE] Error adding partner:', error)
      return rejectWithValue(error.response?.data || { error: error.message })
    }
  },
)

export const editPartner = createAsyncThunk(
  'partners/editPartner',
  async ({ partnerId, data }, { rejectWithValue }) => {
    console.log('[SLICE] edit partner inbound: ', partnerId, data)
    try {
      const response = await axios.put(routes.partnerPath(partnerId), data)
      console.log('[SLICE] edit partner response: ', response.data)
      return response.data
    } catch (error) {
      console.error('[SLICE] Error editing partner:', error)
      return rejectWithValue(error.response?.data || { error: error.message })
    }
  },
)

const partnersAdapter = createEntityAdapter({
  selectId: (entity) => entity.partner_id,
})

const initialState = partnersAdapter.getInitialState({
  status: 'idle',
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
        state.error = action.payload?.error || action.error.message || 'Unknown error'
      })

      .addCase(addPartner.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(addPartner.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.error = null
        partnersAdapter.addOne(state, action.payload)
      })
      .addCase(addPartner.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.error || action.error.message || 'Unknown error'
      })

      .addCase(editPartner.pending, (state) => {
        state.status = 'loading' // Меняем status вместо глобального status!
      })
      .addCase(editPartner.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.error = null
        partnersAdapter.upsertOne(state, action.payload)
      })
      .addCase(editPartner.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.error || action.error.message || 'Unknown error'
      })
  },
})

export const partnersSelectors = partnersAdapter.getSelectors(state => state.partners)
export default partnersSlice.reducer
