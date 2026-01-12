import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setAppLoading } = appSlice.actions;

export const selectAppLoading = (state) => state.app.loading;

export default appSlice.reducer;
