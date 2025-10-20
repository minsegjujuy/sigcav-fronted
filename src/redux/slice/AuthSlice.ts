import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { parseJwt } from "../../helpers/extractExtraClaims";


interface AuthState {
  name: string | null;
  rol: string | null;
  token: string | null;
}

const savedData = localStorage.getItem("auth");
const initialState: AuthState = savedData
  ? JSON.parse(savedData)
  : { username: null, role: null, token: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginAction(state, action: PayloadAction<string>) {
      const token = action.payload;
      const payload = parseJwt(token);
      console.log('payload ', payload)

      state.name = payload.name;
      state.rol = payload.rol;
      state.token = token;

      // guardar en localStorage
      localStorage.setItem(
        "auth",
        JSON.stringify({
          username: payload.name,
          role: payload.rol,
          token,
        })
      );
    },
    logout(state) {
      state.name = null;
      state.rol = null;
      state.token = null;
      localStorage.removeItem("auth");
    },
  },
});

export const { loginAction, logout } = authSlice.actions;
export default authSlice.reducer;