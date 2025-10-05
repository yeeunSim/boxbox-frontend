// src/pages/podium.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
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

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            const sortOption = filterType === 'popular' ? 'POPULAR' : 'LATEST';
            let dataFromApi: PodiumItem[];

            if (searchTerm.trim() !== '') {
                dataFromApi = await podiumAPI.searchPodiumList(searchTerm, 0, sortOption);
            } else {
                dataFromApi = await podiumAPI.getPodiumList(0, sortOption);
            }

            const formattedUsers: User[] = dataFromApi.map((item) => ({
                id: item.radioSn,
                nickname: item.writerNickname,
                likes: item.likeCount,
                message: item.previewEng,
                isLiked: item.likeYn,
            }));
            setDisplayedUsers(formattedUsers);

            setIsLoading(false);
        };

        fetchData();
    }, [searchTerm, filterType]);

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
                message: detailData.radioTextEng, // 메시지 (상세 내용으로 교체)
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

    if (isLoading) return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
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
                    // ✅ 검색 버튼을 눌렀을 때도 검색이 되도록 onClick 추가
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
                                    className={`cursor-pointer rounded-lg px-4 py-3 flex items-center justify-between ${
                                        rank === 0
                                            ? 'border-[2px] border-[#FDE56D] bg-[#22202A]'
                                            : rank === 1
                                            ? 'border-[2px] border-[#AEB7C2] bg-[#22202A]'
                                            : rank === 2
                                            ? 'border-[2px] border-[#886050] bg-[#22202A]'
                                            : (idx + 1) % 3 === 2
                                            ? 'bg-[#2A2833]'
                                            : 'bg-[#22202A]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {rank !== undefined && rank < 3 ? (
                                            <Image
                                                src={`/icons/trophy-${rank + 1}.svg`}
                                                alt={`Trophy ${rank + 1}`}
                                                width={20}
                                                height={20}
                                            />
                                        ) : (
                                            <span className="w-6 text-center font-bold">{idx + 1}</span>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-bold">{user.nickname}</span>
                                            <span className="text-xs text-gray-300">“{user.message}”</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Image src="/icons/likes.svg" alt="Likes" width={16} height={16} />
                                        <span className="text-sm">{user.likes}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
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
