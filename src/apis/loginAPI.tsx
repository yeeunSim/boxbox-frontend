import http from './axiosConfig';
import type { User } from '../../store/authStore';

export type LoginParams = { loginEmail: string; loginPw: string };
export type LoginRes = { accessToken: string; user: User };
export type LangPrefResponse = { code: number; message: string; data: boolean };

export const loginAPI = {
    login: (p: LoginParams) => http.post<LoginRes>('/login', p),
    logout: () => http.post<void>('/logout'),
    setLanguagePreference: (lang: 'en' | 'ko') =>
        http.patch<LangPrefResponse>('/user/lang/preferences', {
            userLang: lang === 'en' ? false : true,
        }),
};

export type SignUpParams = {
    loginEmail: string;
    loginPw: string;
    userNickname: string;
    userBirth: string; // 'YYYY-MM-DD'
    userGender: 'M' | 'F' | 'N' | ''; // 남:M, 여:F, 선택안함:N(혹은 '')
    svcUsePcyAgmtYn: 'Y' | 'N'; // 서비스 이용 약관(필수)
    psInfoProcAgmtYn: 'Y' | 'N'; // 개인정보 처리 동의(선택)
};

export const signUpAPI = {
    register: (p: SignUpParams) => http.post<void>('/sign-up', p),
};

export type SimpleRes = { code: number; message: string };
export type AvailabilityRes = { available: boolean };

export const verifyAPI = {
    // 이메일 중복확인
    checkEmailAvailable: (email: string) => http.get<AvailabilityRes>('/sign-up/email-check', { params: { email } }),

    // 닉네임 중복확인
    checkNicknameAvailable: (nickname: string) =>
        http.get<AvailabilityRes>('/sign-up/nickname-check', { params: { nickname } }),
};
