// src/apis/podiumAPI.tsx

import api from './axiosConfig';

/* 목록 조회 API가 반환하는 단일 아이템 타입 */
export interface PodiumItem {
    rank: number;
    radioSn: number;
    writerNickname: string;
    previewKor: string;
    previewEng: string;
    likeCount: number;
    createdAt: string;
    likeYn: boolean;
}

/*목록 조회 API의 응답 타입 */
interface PaginatedApiResponse {
    code: number;
    message: string;
    data: {
        content: PodiumItem[];
        last: boolean;
    };
}

/*개별 조회 API가 반환하는 타입 */
export interface PodiumDetailItem {
    radioSn: number;
    radioTextKor: string;
    radioTextEng: string;
    writerNickname: string;
    likeYn: boolean;
}

export type LikeResult = { liked: boolean; likes: number };

const getPodiumList = async (page: number, sort: 'POPULAR' | 'LATEST') => {
    try {
        const response = await api.get<PaginatedApiResponse>('/radio/list', {
            params: { page, size: 20, sort },
        });
        return response.data.data.content || [];
        const isLast = response.data.data.last;
    } catch (error) {
        console.error('포디움 목록 조회 API 실패:', error);
        return [];
    }
};

const searchPodiumList = async (nickname: string, page: number, sort: 'POPULAR' | 'LATEST') => {
    try {
        const response = await api.get<PaginatedApiResponse>('/radio/search', {
            params: { nickname, page, size: 10, sort },
        });
        return response.data.data.content || [];
    } catch (error) {
        console.error('포디움 검색 API 실패:', error);
        return [];
    }
};

const getPodiumDetail = async (radioSn: number) => {
    try {
        const response = await api.get<PodiumDetailItem>(`/radio/podium/${radioSn}`);

        return response.data;
    } catch (error) {
        console.error('포디움 개별 조회 API 실패:', error);

        console.error('Axios Error Object:', error);
        return null;
    }
};

export const likePodiumPost = async (radioSn: number) => {
  try {
    const res = await api.post<LikeResult>('/radio-like', { radioSn });
    return { isLiked: res.data.liked, likes: res.data.likes };
  } catch (e) {
    console.error('좋아요 실패');
    return null;
  }
};

export const podiumAPI = {
    getPodiumList,
    searchPodiumList,
    likePodiumPost,
    getPodiumDetail,
};
