import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import routes from '../routes.js'
import { logError } from '../utils/logger.js'

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(routes.productsPath())
      // console.log('[SLICE] fetch products: ', response.data)
      return response.data
    } catch (error) {
      // console.error('[SLICE] Error fetching products:', error)
      await logError('fetchProducts (thunk)', error, {})
      return rejectWithValue(error.response?.data || { error: error.message })
    }
  },
)

const productsAdapter = createEntityAdapter({
  selectId: (entity) => entity.product_id,
})

const productsSlice = createSlice({
  name: 'products',
  initialState: productsAdapter.getInitialState({ loading: false }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => { state.loading = true })
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      productsAdapter.setAll(state, action.payload)
      state.loading = false
    })
  },
})

export const productSelectors = productsAdapter.getSelectors(state => state.products)
export default productsSlice.reducer
