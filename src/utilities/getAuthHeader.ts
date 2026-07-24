import { getAccessToken } from "./tokenStore";

export function getAuthHeader() {
    const token = getAccessToken();

    if (token) {
        return {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
    }
    return {};
}
