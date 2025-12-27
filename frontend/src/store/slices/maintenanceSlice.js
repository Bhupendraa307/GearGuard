import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchRequests = createAsyncThunk('maintenance/fetchRequests', async () => {
  const response = await api.get('/maintenance');
  return response.data;
});

export const addRequest = createAsyncThunk('maintenance/addRequest', async (data) => {
  const response = await api.post('/maintenance', data);
  return response.data;
});

export const updateRequestStage = createAsyncThunk('maintenance/updateRequestStage', async ({ id, stage, duration }) => {
  const response = await api.patch(`/maintenance/${id}/stage`, { stage, duration });
  return response.data;
});

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addRequest.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateRequestStage.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default maintenanceSlice.reducer;
