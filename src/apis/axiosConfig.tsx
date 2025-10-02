'use client';

import axios, { AxiosHeaders, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// 요청 인터셉터
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  const headers = (config.headers = AxiosHeaders.from(config.headers));

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    headers.delete('Authorization');
  }

  return config;
});

// 응답 인터셉터
http.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original || err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }

    original._retry = true;
    try {
      const resp = await http.post('/refresh', {}, { withCredentials: true });

      let newAT: string | undefined = (resp.data as any)?.newAccess;

      if (!newAT || typeof newAT !== 'string' || newAT.length < 10) {
        useAuthStore.getState().logout();
        throw new Error('Refresh succeeded without accessToken');
      }

      useAuthStore.getState().setAccessToken(newAT);
      const headers = (original.headers = AxiosHeaders.from(original.headers));
      headers.set('Authorization', `Bearer ${newAT}`);
      return http(original);
    } catch (e) {
      try { useAuthStore.getState().logout(); } catch {}
      return Promise.reject(e);
    }
  }
);

export default http;