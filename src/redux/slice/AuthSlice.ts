import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { parseJwt2 } from "../../utilities/jwt";


interface AuthState {
  name: string | null;
  rol: string | null;
  token: string | null;
}

const initialState: AuthState = { name: null, rol: null, token: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // payload: token string
    loginAction(state, action: PayloadAction<string>) {
      const token = action.payload;
      const payload = parseJwt2<any>(token);
      state.name = payload?.name ?? null;
      state.rol = payload?.rol ?? null;
      state.token = token;
    },
    logout(state) {
      state.name = null;
      state.rol = null;
      state.token = null;
    },
  },
});

export const { loginAction, logout } = authSlice.actions;
export default authSlice.reducer;