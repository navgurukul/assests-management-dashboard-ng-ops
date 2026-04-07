import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  userRole: '',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
  },
});

export const { setAppLoading, setUserRole } = appSlice.actions;

export const selectAppLoading = (state) => state.app.loading;
export const selectUserRole = (state) => state.app.userRole;

export default appSlice.reducer;
