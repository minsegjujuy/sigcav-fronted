// utils/authHeader.ts
export const getAuthHeader = () => {
  const authString = localStorage.getItem("auth");
  const authObject = authString ? JSON.parse(authString) : null;
  const token = authObject?.token;
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};