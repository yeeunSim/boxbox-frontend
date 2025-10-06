'use client';

import axios, { AxiosHeaders, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';

type RefreshResp = { newAccess: string };

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// 요청 인터셉터 (매개변수 불변 유지)
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  const headers = AxiosHeaders.from(config.headers);

  if (token) headers.set('Authorization', `Bearer ${token}`);
  else headers.delete('Authorization');

  return { ...config, headers };
});

// 응답 인터셉터 (401 처리 + SSR/빌드 가드)
http.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    // SSR/빌드 단계에서는 리프레시 시도 X
    if (typeof window === 'undefined') return Promise.reject(err);

    const original = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original || original._retry || err.response?.status !== 401) {
        return Promise.reject(err);
    }

    if (original.url === '/login' || original.url === '/refresh') {
        // 토큰 갱신 시도 없이 바로 로그인 컴포넌트의 catch 블록으로 전달
        return Promise.reject(err);
    }

    const originalCopy: InternalAxiosRequestConfig & { _retry?: boolean } = { ...original, _retry: true };

    try {
      const resp = await http.post<RefreshResp>('/refresh', {}, { withCredentials: true });
      const newAT = resp.data?.newAccess;

      if (!newAT || typeof newAT !== 'string' || newAT.length < 10) {
        useAuthStore.getState().logout();
        throw new Error('Refresh succeeded without valid accessToken');
      }

      useAuthStore.getState().setAccessToken(newAT);

      const headers = AxiosHeaders.from(originalCopy.headers);
      headers.set('Authorization', `Bearer ${newAT}`);

      return http({ ...originalCopy, headers });
    } catch (e) {
      try { useAuthStore.getState().logout(); } catch {}
      return Promise.reject(e);
    }
  }
);

export default http;