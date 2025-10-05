import http from './axiosConfig';
import type { User } from '../../store/authStore';

export type LoginParams = { loginEmail: string; loginPw: string };
export type LoginRes = { accessToken: string; user: User };
export type LangPrefResponse = { code: number, message: string, data: boolean };

export const loginAPI = {
  login: (p: LoginParams) => http.post<LoginRes>('/login', p),
  logout: () => http.post<void>('/logout'),
  setLanguagePreference: (lang: 'en' | 'ko') => http.patch<LangPrefResponse>('/user/lang/preferences', {
    userLang: (lang === 'en') ? false : true
  })
};
