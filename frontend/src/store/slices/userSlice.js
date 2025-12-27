import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchTechnicians = createAsyncThunk('users/fetchTechnicians', async () => {
    const response = await api.get('/users/technicians');
    return response.data;
});

const userSlice = createSlice({
    name: 'users',
    initialState: {
        technicians: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTechnicians.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTechnicians.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.technicians = action.payload;
            })
            .addCase(fetchTechnicians.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default userSlice.reducer;
