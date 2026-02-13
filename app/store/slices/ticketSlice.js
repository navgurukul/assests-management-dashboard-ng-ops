import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedTicket: null,
};

const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    setSelectedTicket: (state, action) => {
      state.selectedTicket = action.payload;
    },
    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
    },
  },
});

export const { setSelectedTicket, clearSelectedTicket } = ticketSlice.actions;

export const selectTicket = (state) => state.ticket.selectedTicket;

export default ticketSlice.reducer;
