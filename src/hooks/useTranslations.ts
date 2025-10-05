import { useAuthStore } from '../../store/authStore';
import { translations } from '../lib/translations';

/**
 * 현재 언어 설정에 맞는 번역 텍스트 객체를 반환하는 커스텀 훅
 */
export const useTranslations = () => {
    const lang = useAuthStore((state) => state.lang);
    return translations[lang];
};
