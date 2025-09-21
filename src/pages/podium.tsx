'use client';

import { useState } from 'react';
import Image from 'next/image';

import Dropdown from '@/components/Dropdown';
// 1. PodiumModal을 import 합니다.
import PodiumModal from '@/components/PodiumModal';

interface User {
    id: number;
    nickname: string;
    likes: number;
    message: string;
    isLiked: boolean; // 좋아요 상태를 위한 isLiked 속성 추가
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
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState<'popular' | 'latest'>('popular');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // 2. 유저 데이터를 state로 관리하여 좋아요 상태 변경 시 리렌더링되도록 합니다.
    const [users, setUsers] = useState<User[]>([...dummyData].sort((a, b) => b.likes - a.likes));

    // 3. 좋아요 버튼 클릭 시 실행될 핸들러 함수를 만듭니다.
    const handleLike = (id: number) => {
        setUsers((currentUsers) =>
            currentUsers.map((user) => (user.id === id ? { ...user, isLiked: !user.isLiked } : user))
        );
        // 선택된 유저 정보도 업데이트하여 모달에 바로 반영되도록 합니다.
        if (selectedUser && selectedUser.id === id) {
            setSelectedUser((prev) => (prev ? { ...prev, isLiked: !prev.isLiked } : null));
        }
    };

    const filterOptions = [
        { value: 'popular', label: 'Popular' },
        { value: 'latest', label: 'Latest' },
    ] as const;

    return (
        <div className="w-full max-w-md mx-auto flex flex-col flex-1">
            {/* 검색 + 필터 UI (기존과 동일) */}
            <div className="sticky top-[66px] sm:top-[72px] px-4 py-3 flex items-center gap-3 bg-[#191922] z-20">
                <input
                    type="text"
                    placeholder="Nickname Search"
                    className="flex-1 bg-[#22202A] rounded-lg px-3 py-3 text-sm text-white placeholder-gray-400 focus:outline-none"
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
            <div className="flex-1 overflow-y-auto px-4 pb-[100px] mt-14">
                <div className="bg-[#22202A] rounded-2xl overflow-hidden mt-4">
                    <ul className="flex flex-col gap-3 p-4">
                        {users.map((user, idx) => (
                            <li
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`cursor-pointer rounded-lg px-4 py-3 flex items-center justify-between ${
                                    idx === 0
                                        ? 'border-[2px] border-[#FDE56D] bg-[#22202A]'
                                        : idx === 1
                                        ? 'border-[2px] border-[#AEB7C2] bg-[#22202A]'
                                        : idx === 2
                                        ? 'border-[2px] border-[#886050] bg-[#22202A]'
                                        : (idx + 1) % 3 === 2
                                        ? 'bg-[#2A2833]'
                                        : 'bg-[#22202A]'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {idx < 3 ? (
                                        <Image
                                            src={`/icons/trophy-${idx + 1}.svg`}
                                            alt={`Trophy ${idx + 1}`}
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
                        ))}
                    </ul>
                </div>
            </div>

            {/* 4. PodiumModal 컴포넌트를 호출하고 props를 전달합니다. */}
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
