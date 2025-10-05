// src/apis/fanradioAPI.tsx
import api from './axiosConfig';

export type RadioLang = 'kor' | 'eng';

export type CreateRadioRequest = {
  /** 서버 명세: 'kor' | 'eng' */
  lang: RadioLang;
  text: string;
};

export type RadioData = {
  radioSn: number;
  radioTextKor: string;
  radioTextEng: string;
  writerNickname: string;
};

export type CreateRadioResponse = {
  code: number;
  message: string;
  data: RadioData;
};

export type PatchRadioRequest = {
  lang: RadioLang;
  text: string;
};

export type PatchRadioResponse = {
  code: number;
  message: string;
  data: RadioData;
};

const postRadio = async (payload: CreateRadioRequest) => {
  const res = await api.post<CreateRadioResponse>('/radio/create-radio', payload);
  return res.data;
};

const patchRadio = async (radioSn: number, payload: PatchRadioRequest) => {
  const res = await api.patch<PatchRadioResponse>(`/radio/patch-radio/${radioSn}`, payload);
  return res.data;
};

export const fanRadioAPI = {
  postRadio,
  patchRadio,
};

export default fanRadioAPI;
