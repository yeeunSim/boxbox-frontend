import http from './axiosConfig';
import type { User } from '../../store/authStore';

export type LoginParams = { loginEmail: string; loginPw: string };
export type LoginRes = { accessToken: string; user: User };

export const loginAPI = {
  login: (p: LoginParams) => http.post<LoginRes>('/login', p),
  logout: () => http.post<void>('/logout'),
};