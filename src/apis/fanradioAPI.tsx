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

// ✅ 1. '드라이버 넘버' API를 위한 타입들을 새로 추가합니다.
/** '드라이버 넘버' API 응답으로 오는 단일 아이템 타입 */
export interface DriverNumberRadio {
    radioSn: string;
    radioNum: number;
    radioNickname: string;
    radioTextEng: string;
}

/** '드라이버 넘버' API의 전체 응답 타입 */
interface DriverNumberApiResponse {
    code: number;
    message: string;
    data: DriverNumberRadio[];
}

const postRadio = async (payload: CreateRadioRequest) => {
    const res = await api.post<CreateRadioResponse>('/radio/create-radio', payload);
    return res.data;
};

const patchRadio = async (radioSn: number, payload: PatchRadioRequest) => {
    const res = await api.patch<PatchRadioResponse>(`/radio/patch-radio/${radioSn}`, payload);
    return res.data;
};

// ✅ 2. '드라이버 넘버' 라디오 목록을 조회하는 새로운 API 함수를 추가합니다.
const getDriverNumberRadios = async () => {
    try {
        const response = await api.get<DriverNumberApiResponse>('/radio/driver-number');
        // 실제 데이터 배열인 response.data.data를 반환합니다.
        return response.data.data || [];
    } catch (error) {
        console.error("'드라이버 넘버' 라디오 조회 API 실패:", error);
        return [];
    }
};

// ✅ 3. 기존 export 객체에 새로운 함수를 추가합니다.
export const fanRadioAPI = {
    postRadio,
    patchRadio,
    getDriverNumberRadios, // <-- 추가!
};

export default fanRadioAPI;
