import axios from "axios";
import type { AuthenticationResponse } from "../models/AuthenticationResponse";
import type { AuthenticationRequest } from "../models/AuthenticationRequest";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const login = async (data: AuthenticationRequest) : Promise<AuthenticationResponse> => {
  const response = await axios.post<AuthenticationResponse>(`${baseURL}/auth/login`, data);
  return response.data;
};