import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchEquipment = createAsyncThunk('equipment/fetchEquipment', async () => {
  const response = await api.get('/equipment');
  return response.data;
});

export const fetchEquipmentById = createAsyncThunk('equipment/fetchEquipmentById', async (id) => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
});

export const addEquipment = createAsyncThunk('equipment/addEquipment', async (data) => {
  const response = await api.post('/equipment', data);
  return response.data;
});

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState: {
    items: [],
    currentItem: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEquipment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchEquipmentById.fulfilled, (state, action) => {
        state.currentItem = action.payload;
      })
      .addCase(addEquipment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default equipmentSlice.reducer;
