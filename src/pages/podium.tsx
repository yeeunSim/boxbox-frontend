'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Dropdown from '@/components/Dropdown';
import PodiumModal from '@/components/PodiumModal';
import { useAuthStore, useUiStore } from '../../store/authStore';

interface User {
    id: number;
    nickname: string;
    likes: number;
    message: string;
    isLiked: boolean;
}

const dummyData: User[] = [
    { id: 1, nickname: 'JHKIM', likes: 726, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 2, nickname: 'JAMES', likes: 276, message: 'Go get it, Valtteri! 🚀', isLiked: true },
    { id: 3, nickname: 'SLIVER ARROWS', likes: 163, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 4, nickname: 'LEWIS', likes: 98, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 5, nickname: 'MAX', likes: 87, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 6, nickname: 'SEBASTIAN', likes: 54, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 7, nickname: 'CHARLES', likes: 32, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 8, nickname: 'GEORGE', likes: 21, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 9, nickname: 'LANDO', likes: 19, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 10, nickname: 'VALTTERI', likes: 7, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 11, nickname: 'PIERRE', likes: 4, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 12, nickname: 'KIMI', likes: 2, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 13, nickname: 'MICK', likes: 1, message: 'Go get it, Valtteri! 🚀', isLiked: false },
    { id: 14, nickname: 'NICO', likes: 0, message: 'Go get it, Valtteri! 🚀', isLiked: false },
];

const PodiumPage = () => {
    const isLoggedIn = useAuthStore((s) => s.isAuthed());
    const openLoginModal = useUiStore((s) => s.openLoginModal);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState<'popular' | 'latest'>('popular');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);

    const popularRanks = useMemo(() => {
        const sortedByLikes = [...dummyData].sort((a, b) => b.likes - a.likes);
        const rankMap = new Map<number, number>();
        sortedByLikes.forEach((user, index) => {
            rankMap.set(user.id, index);
        });
        return rankMap;
    }, []);

    useEffect(() => {
        let result = [...dummyData];

        if (searchTerm.trim() !== '') {
            result = result.filter((user) => user.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (filterType === 'popular') {
            result.sort((a, b) => b.likes - a.likes);
        } else {
            result.sort((a, b) => b.id - a.id);
        }

        setDisplayedUsers(result);
    }, [searchTerm, filterType]);

    const handleLike = (id: number) => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }

        // 로그인이 되어 있다면, 기존 로직을 실행
        setDisplayedUsers((currentUsers) =>
            currentUsers.map((user) => {
                if (user.id === id) {
                    const newIsLiked = !user.isLiked;
                    const newLikes = newIsLiked ? user.likes + 1 : user.likes - 1;
                    return { ...user, isLiked: newIsLiked, likes: newLikes };
                }
                return user;
            })
        );
        if (selectedUser && selectedUser.id === id) {
            setSelectedUser((prev) => {
                if (!prev) return null;
                const newIsLiked = !prev.isLiked;
                const newLikes = newIsLiked ? prev.likes + 1 : prev.likes - 1;
                return { ...prev, isLiked: newIsLiked, likes: newLikes };
            });
        }
    };

    const filterOptions = [
        { value: 'popular', label: 'Popular' },
        { value: 'latest', label: 'Latest' },
    ] as const;

    return (
        <div className="w-full max-w-md mx-auto flex flex-col flex-1">
            {/* 검색 + 필터 */}
            <div className="sticky top-[66px] sm:top-[72px] px-4 py-3 flex items-center gap-3 bg-[#191922] z-20">
                <input
                    type="text"
                    placeholder="Nickname Search"
                    className="flex-1 bg-[#22202A] rounded-lg px-3 py-3 text-sm text-white placeholder-gray-400 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="w-[47px] h-[46px] flex items-center justify-center rounded-lg bg-[#22202A]">
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
                                    onClick={() => setSelectedUser(user)}
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

            <PodiumModal
                isOpen={!!selectedUser}
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
