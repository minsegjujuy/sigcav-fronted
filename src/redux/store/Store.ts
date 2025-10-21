// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import authReducer from "../slice/AuthSlice";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  auth: authReducer,
  // otros reducers...
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Asegurate que es exactamente "auth"
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, // <- IMPORTANTE: pasar el reducer persistido (no { auth: persistedReducer })
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

