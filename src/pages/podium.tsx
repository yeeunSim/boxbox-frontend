'use client';

import { useState } from 'react';
import Image from 'next/image';

import Dropdown from '@/components/Dropdown';
import RadioModal from '@/components/RadioModal';

interface User {
    id: number;
    nickname: string;
    likes: number;
    message: string;
}

const dummyData: User[] = [
    { id: 1, nickname: 'JHKIM', likes: 726, message: 'Go get it, Valtteri! 🚀' },
    { id: 2, nickname: 'JAMES', likes: 276, message: 'Go get it, Valtteri! 🚀' },
    { id: 3, nickname: 'SLIVER ARROWS', likes: 163, message: 'Go get it, Valtteri! 🚀' },
    { id: 4, nickname: 'WJDWLR03', likes: 163, message: 'Go get it, Valtteri! 🚀' },
    { id: 5, nickname: 'PDD0818', likes: 163, message: 'Go get it, Valtteri! 🚀' },
    { id: 6, nickname: 'GAMJA', likes: 163, message: 'Go get it, Valtteri! 🚀' },
    { id: 7, nickname: 'BOTTAS', likes: 163, message: 'Go get it, Valtteri! 🚀' },
    { id: 8, nickname: 'HAMJIZZANG', likes: 163, message: 'Go get it, Valtteri! 🚀' },
    { id: 9, nickname: 'LEWIS', likes: 163, message: 'Go get it, Valtteri! 🚀' },
    { id: 10, nickname: 'MAX', likes: 163, message: 'Go get it, Valtteri! 🚀' },
    { id: 11, nickname: 'VERSTAPPEN', likes: 163, message: 'Go get it, Valtteri! 🚀' },
    { id: 12, nickname: 'CHECO', likes: 163, message: 'Go get it, Valtteri! 🚀' },
    { id: 13, nickname: 'SAINZ', likes: 163, message: 'Go get it, Valtteri! 🚀' },
    { id: 14, nickname: 'LECLERC', likes: 163, message: 'Go get it, Valtteri! 🚀' },
];

const PodiumPage = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState<'popular' | 'latest'>('popular');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const filterOptions = [
        { value: 'popular', label: 'Popular' },
        { value: 'latest', label: 'Latest' },
    ] as const;

    const sortedData = [...dummyData].sort((a, b) => b.likes - a.likes);

    return (
        <div className="w-full max-w-md mx-auto flex flex-col flex-1">
            {/* 검색 + 필터 */}
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
                        {sortedData.map((user, idx) => (
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

            {/* 라디오 모달 */}
            {selectedUser && (
                <RadioModal
                    isOpen={!!selectedUser}
                    nickname={selectedUser.nickname}
                    message={selectedUser.message}
                    number={`#${selectedUser.id}`}
                    showLike
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

PodiumPage.title = 'PODIUM';
export default PodiumPage;
