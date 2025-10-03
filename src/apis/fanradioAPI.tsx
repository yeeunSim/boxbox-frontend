import http from './axiosConfig';

export type RadioParams = { lang: string; text: string };

export const fanRadioAPI = {
  postRadio: (r: RadioParams) => http.post<string>('/radio/create-radio', r),
};