import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import tableColumnsReducer from './slices/tableColumnsSlice';
import ticketReducer from './slices/ticketSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    tableColumns: tableColumnsReducer,
    ticket: ticketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['your/action/type'],
      },
    }),
});

export default store;
