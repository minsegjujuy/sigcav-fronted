import axios from "axios";
import type { AuthenticationResponse, MessageResponse, TwoFactorResendRequest, TwoFactorVerifyRequest } from "../models/AuthenticationResponse";
import type { AuthenticationRequest } from "../models/AuthenticationRequest";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const login = async (data: AuthenticationRequest) : Promise<AuthenticationResponse> => {
  const response = await axios.post<AuthenticationResponse>(`${baseURL}/auth/login`, data);
  return response.data;
};

export const verify = async (data: TwoFactorVerifyRequest) : Promise<AuthenticationResponse> => {
  const response = await axios.post<AuthenticationResponse>(`${baseURL}/auth/2fa/verify`, data);
  return response.data;
};

export const resend = async (data: TwoFactorResendRequest) : Promise<MessageResponse> => {
  const response = await axios.post<MessageResponse>(`${baseURL}/auth/2fa/resend`, data);
  return response.data;
};