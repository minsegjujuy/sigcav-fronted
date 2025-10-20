import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/AuthSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Tipos de ayuda para TS
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;