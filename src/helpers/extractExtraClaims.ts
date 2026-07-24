import {jwtDecode} from 'jwt-decode'

export interface JwtPayload {
  name: string;
  rol: string;
}

export const parseJwt = (token: string): JwtPayload => {
  return jwtDecode<JwtPayload>(token);
};