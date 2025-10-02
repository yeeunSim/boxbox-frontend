'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Dropdown from './Dropdown';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
    title: string;
    rightIcon?: 'globe' | 'logout' | 'none' | 'login';
}

const Header = ({ title, rightIcon = 'globe' }: HeaderProps) => {
    const { isLoggedIn, login, logout } = useAuth();

    const [isLangModalOpen, setIsLangModalOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState<'en' | 'ko'>('en');

    const languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'ko', label: 'Korean' },
    ] as const;

    const handleLanguageSelect = (lang: 'en' | 'ko') => {
        setCurrentLang(lang);
        setIsLangModalOpen(false);
    };

    const renderRightIcon = () => {
        if (rightIcon === 'login') {
            return (
                <Link href="/login">
                    <Image src="/icons/login.svg" alt="Login" width={30} height={30} />
                </Link>
            );
        }
        if (rightIcon === 'globe') {
            return (
                <div className="relative">
                    <button onClick={() => setIsLangModalOpen((prev) => !prev)}>
                        <Image src="/icons/globe.svg" alt="Language" width={30} height={30} />
                    </button>
                    {isLangModalOpen && (
                        <Dropdown
                            options={languageOptions}
                            selected={currentLang}
                            onSelect={handleLanguageSelect}
                            widthClass="w-36"
                        />
                    )}
                </div>
            );
        }
        if (rightIcon === 'logout') {
            return (
                //  실제 logout 함수 연결
                <button onClick={logout}>
                    <Image src="/icons/logout.svg" alt="Logout" width={30} height={30} />
                </button>
            );
        }
        return null;
    };

    return (
        <header className="fixed top-0 w-full bg-[#191922] z-30 safe-area-padding-top">
            <div className="max-w-md mx-auto h-[66px] sm:h-[72px] flex justify-between items-center px-4">
                <h1 className="font-bold text-[20px] sm:text-[24px] text-white">{title}</h1>
                {renderRightIcon()}
            </div>

            {/* 개발용 임시 테스트 버튼들을 추가 */}
            <div className="fixed bottom-24 right-4 z-50 rounded-lg bg-gray-700 p-2 text-white shadow-lg">
                <p className="text-center text-xs text-yellow-400">-- DEV-MODE --</p>
                <p className="text-sm">현재 상태: {isLoggedIn ? '로그인' : '로그아웃'}</p>
                <div className="mt-2 flex gap-2">
                    <button onClick={login} className="rounded bg-green-500 px-3 py-1 text-sm">
                        Login Test
                    </button>
                    <button onClick={logout} className="rounded bg-red-500 px-3 py-1 text-sm">
                        Logout Test
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
