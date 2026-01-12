import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import tableColumnsReducer from './slices/tableColumnsSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    tableColumns: tableColumnsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['your/action/type'],
      },
    }),
});

export default store;
