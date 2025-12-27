import { configureStore } from '@reduxjs/toolkit';
import equipmentReducer from './slices/equipmentSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import teamReducer from './slices/teamSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    equipment: equipmentReducer,
    maintenance: maintenanceReducer,
    teams: teamReducer,
    users: userReducer,
  },
});
