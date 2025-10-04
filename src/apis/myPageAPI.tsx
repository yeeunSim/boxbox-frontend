// src/apis/myPageAPI.tsx

import api from './axiosConfig';

/* '내 라디오 목록' API 응답으로 오는 단일 아이템 타입 */
export interface MyRadioItem {
    radioSn: number;
    radioTextKor: string;
    radioTextEng: string;
    writerNickname: string;
}

/* '내 라디오 목록' API의 전체 응답 타입 */
interface MyRadioApiResponse {
    code: number;
    message: string;
    data: MyRadioItem[];
}

/* '내 라디오 목록'을 조회하는 API 함수
 */
const getMyRadioList = async () => {
    try {
        const response = await api.get<MyRadioApiResponse>('radio/my-page/radio-list');

        // 실제 데이터 배열인 response.data.data를 반환
        return response.data.data || [];
    } catch (error) {
        console.error("'내 라디오 목록' 조회 API 실패:", error);
        // 실패 시 빈 배열을 반환
        return [];
    }
};

/* '내 라디오 메시지'를 삭제하는 API 함수
 */
const deleteMyRadio = async (radioSn: number) => {
    try {
        const response = await api.delete(`/radio/delete-radio/${radioSn}`);
        return response.status === 200 || response.status === 204;
    } catch (error) {
        console.error("'내 라디오' 삭제 API 실패:", error);
        return false;
    }
};

export const myPageAPI = {
    getMyRadioList,

    deleteMyRadio,
};
