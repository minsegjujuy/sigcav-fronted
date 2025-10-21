import { store, type RootState } from "../redux/store/Store";

export function getAuthHeader(){
    const state: RootState = store.getState();
    
    const token = state.auth.token;

    if (token) {
        return {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
    }
    return {};
}