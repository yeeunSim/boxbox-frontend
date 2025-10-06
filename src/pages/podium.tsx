// src/pages/podium.tsx

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Dropdown from '@/components/Dropdown';
import PodiumModal from '@/components/PodiumModal';
import { useAuthStore, useUiStore } from '../../store/authStore';
import { podiumAPI, PodiumItem } from '@/apis/podiumAPI';

interface User {
    id: number;
    nickname: string;
    likes: number;
    message: string;
    isLiked: boolean;
}

const PodiumPage = () => {
    const lang = useAuthStore((state) => state.lang);
    const isLoggedIn = useAuthStore((s) => s.isAuthed());
    const openLoginModal = useUiStore((s) => s.openLoginModal);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [filterType, setFilterType] = useState<'popular' | 'latest'>('popular');
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 무한스크롤용 상태
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    // 데이터 fetch 함수
    const fetchData = async (reset = false) => {
        if (!hasMore && !reset) return;

        setIsLoading(true);
        setError(null);

        const sortOption = filterType === 'popular' ? 'POPULAR' : 'LATEST';
        let dataFromApi: PodiumItem[];

        try {
            if (searchTerm.trim() !== '') {
                dataFromApi = await podiumAPI.searchPodiumList(searchTerm, reset ? 0 : page, sortOption);
            } else {
                dataFromApi = await podiumAPI.getPodiumList(reset ? 0 : page, sortOption);
            }

            const formattedUsers: User[] = dataFromApi.map((item) => ({
                id: item.radioSn,
                nickname: item.writerNickname,
                likes: item.likeCount,
                message: lang === 'ko' ? item.previewKor : item.previewEng,
                isLiked: item.likeYn,
            }));

            if (reset) {
                setDisplayedUsers(formattedUsers);
                setPage(1);
                setHasMore(formattedUsers.length > 0);
            } else {
                setDisplayedUsers((prev) => [...prev, ...formattedUsers]);
                setPage((prev) => prev + 1);
                setHasMore(formattedUsers.length > 0);
            }
        } catch (err) {
            setError('데이터 불러오기 실패');
        } finally {
            setIsLoading(false);
        }
    };

    // 검색어/필터/언어 변경 시 목록 리셋 후 새로 불러오기
    useEffect(() => {
        fetchData(true);
    }, [searchTerm, filterType, lang]);

    // 무한스크롤 IntersectionObserver
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading) {
                    fetchData();
                }
            },
            { threshold: 1 }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [isLoading]);

    const popularRanks = useMemo(() => {
        const rankMap = new Map<number, number>();
        displayedUsers.forEach((user, index) => {
            rankMap.set(user.id, index);
        });
        return rankMap;
    }, [displayedUsers]);

    const handleLike = async (id: number) => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        const success = await podiumAPI.likePodiumPost(id);

        if (success) {
            const updateUserState = (users: User[]) =>
                users.map((user) => {
                    if (user.id === id) {
                        const newIsLiked = !user.isLiked;
                        const newLikes = newIsLiked ? user.likes + 1 : user.likes - 1;
                        return { ...user, isLiked: newIsLiked, likes: newLikes };
                    }
                    return user;
                });
            setDisplayedUsers(updateUserState);

            if (selectedUser?.id === id) {
                setSelectedUser((prev) =>
                    prev ? { ...prev, isLiked: !prev.isLiked, likes: prev.likes + (prev.isLiked ? -1 : 1) } : null
                );
            }
        } else {
            alert('좋아요 처리에 실패했습니다.');
        }
    };

    /*목록 아이템 클릭 시 실행될 새로운 함수 */
    const handleItemClick = async (userFromList: User) => {
        setSelectedUser(userFromList);
        setIsModalLoading(true);

        const detailData = await podiumAPI.getPodiumDetail(userFromList.id);

        if (detailData) {
            const detailedUser: User = {
                ...userFromList,
                id: detailData.radioSn, // id
                nickname: detailData.writerNickname, // 닉네임
                message: lang === 'ko' ? detailData.radioTextKor : detailData.radioTextEng,
                isLiked: detailData.likeYn,
            };
            setSelectedUser(detailedUser);
        } else {
            alert('상세 정보를 불러오는 데 실패했습니다.');
            setSelectedUser(null);
        }

        setIsModalLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setSearchTerm(inputValue);
        }
    };

    const filterOptions = [
        { value: 'popular', label: 'Popular' },
        { value: 'latest', label: 'Latest' },
    ] as const;

    if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

    return (
        <div className="w-full max-w-md mx-auto flex flex-col flex-1">
            {/* 검색 + 필터  */}
            <div className="sticky top-[66px] sm:top-[72px] px-4 py-3 flex items-center gap-3 bg-[#191922] z-20">
                <input
                    type="text"
                    placeholder="Nickname Search"
                    className="flex-1 bg-[#22202A] rounded-lg px-3 py-3 text-sm text-white placeholder-gray-400 focus:outline-none"
                    value={inputValue} // value를 inputValue로 변경
                    onChange={(e) => setInputValue(e.target.value)} // onChange는 setInputValue로 변경
                    onKeyDown={handleKeyDown} // onKeyDown 이벤트 핸들러 추가
                />
                <button
                    className="w-[47px] h-[46px] flex items-center justify-center rounded-lg bg-[#22202A]"
                    // 검색 버튼을 눌렀을 때도 검색이 되도록 onClick 추가
                    onClick={() => setSearchTerm(inputValue)}
                >
                    <Image src="/icons/search.svg" alt="Search" width={23} height={23} />
                </button>
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen((prev) => !prev)}
                        className={`w-[47px] h-[46px] flex items-center justify-center rounded-lg transition-colors ${
                            isFilterOpen ? 'bg-[#02F5D0]' : 'bg-[#22202A]'
                        }`}
                    >
                        <Image
                            src={isFilterOpen ? '/icons/filter-active.svg' : '/icons/filter.svg'}
                            alt="Filter"
                            width={26}
                            height={26}
                        />
                    </button>
                    {isFilterOpen && (
                        <Dropdown
                            options={filterOptions}
                            selected={filterType}
                            onSelect={(val) => {
                                setFilterType(val);
                                setIsFilterOpen(false);
                            }}
                        />
                    )}
                </div>
            </div>

            {/* 순위 리스트 */}
            <div className="h-[700px] overflow-y-auto px-4 pb-4 mt-14 scrollbar-hide">
                <div className="bg-[#22202A] rounded-2xl overflow-hidden mt-4">
                    <ul className="flex flex-col gap-3 p-4 pb-8">
                        {displayedUsers.map((user, idx) => {
                            const rank = popularRanks.get(user.id);

                            return (
                                <li
                                    key={user.id}
                                    onClick={() => handleItemClick(user)}
                                    className={`
                                        cursor-pointer rounded-lg px-4 py-3 flex items-center justify-between
                                        bg-[#22202A] 
                                        hover:bg-[#2A2833]      /* 데스크탑 호버 효과 */
                                        active:bg-[#2A2833]      /* 모바일 탭 효과 (색상) */
                                        active:scale-[0.98]      /* 모바일 탭 효과 (크기) */
                                        transition-all duration-150
                                        ${rank === 0 ? 'border-2 border-[#FDE56D]' : ''}
                                        ${rank === 1 ? 'border-2 border-[#AEB7C2]' : ''}
                                        ${rank === 2 ? 'border-2 border-[#886050]' : ''}
                                    `}
                                >
                                    <div className="flex flex-1 items-center gap-3 min-w-0">
                                        {rank !== undefined && rank < 3 ? (
                                            <Image
                                                src={`/icons/trophy-${rank + 1}.svg`}
                                                alt={`Trophy ${rank + 1}`}
                                                width={20}
                                                height={20}
                                                className="flex-shrink-0"
                                            />
                                        ) : (
                                            <span className="w-6 text-center font-bold text-white flex-shrink-0">
                                                {idx + 1}
                                            </span>
                                        )}

                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="font-bold text-white truncate">{user.nickname}</span>
                                            <span className="block text-xs text-gray-300 truncate">
                                                “{user.message}”
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-0.5">
                                        <Image src="/icons/likes.svg" alt="Likes" width={16} height={16} />
                                        <span className="text-xs text-gray-300">{user.likes}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    {/* 무한스크롤 트리거 */}
                    <div ref={loaderRef} className="h-10 flex justify-center items-center text-gray-400">
                        {isLoading && <span>Loading...</span>}
                        {!hasMore && <span></span>}
                    </div>
                </div>
            </div>

            {/* 모달 */}
            <PodiumModal
                isOpen={!!selectedUser}
                isLoading={isModalLoading}
                nickname={selectedUser?.nickname || ''}
                message={
                    selectedUser
                        ? {
                              id: selectedUser.id,
                              number: `#${selectedUser.id}`,
                              text: selectedUser.message,
                              isLiked: selectedUser.isLiked,
                          }
                        : null
                }
                onClose={() => setSelectedUser(null)}
                onLike={handleLike}
            />
        </div>
    );
};

PodiumPage.title = 'PODIUM';
export default PodiumPage;
