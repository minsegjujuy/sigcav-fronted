let accessToken: string | null = null;

// guardar token
export const setAccessToken = (token: string) => {
  accessToken = token;
};

// obtener token
export const getAccessToken = () => {
  return accessToken;
};

// limpiar token
export const clearAccessToken = () => {
  accessToken = null;
};
