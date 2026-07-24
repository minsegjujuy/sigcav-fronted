//import axios from "axios";
import axios from "axios";
import type { AuthenticationResponse, TwoFactorVerifyRequest } from "../models/AuthenticationResponse";
import type { AuthenticationRequest } from "../models/AuthenticationRequest";
import type { SetupResponse } from "../pages/TwoFactorSetup";
import { getAuthHeader } from "../utilities/getAuthHeader";
import api from "../interceptors/axios.interceptors";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const login = async (
  data: AuthenticationRequest
): Promise<AuthenticationResponse> => {
  const response = await axios.post<AuthenticationResponse>(
    `${baseURL}/auth/login`,
    data,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const setup = async () : Promise<SetupResponse> => {
  const response = await api.post<SetupResponse>(
    `${baseURL}/auth/setup`,
    {},
    getAuthHeader()
  );
  return response.data;
};

export const verify = async (
  data: TwoFactorVerifyRequest
): Promise<AuthenticationResponse> => {
  const response = await axios.post<AuthenticationResponse>(
    `${baseURL}/auth/2fa/verify`,
    data,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const refresh = async (): Promise<AuthenticationResponse> => {
  const response = await axios.post<AuthenticationResponse>(
    `${baseURL}/auth/refresh`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const logout = async (): Promise<void> => {
  await axios.post(
    `${baseURL}/auth/logout`,
    {},
    {
      withCredentials: true,
    }
  );
};
