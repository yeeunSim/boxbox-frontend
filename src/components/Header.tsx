'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Dropdown from './Dropdown';

interface HeaderProps {
    title: string;
    rightIcon?: 'globe' | 'logout' | 'none' | 'login';
}

const Header = ({ title, rightIcon = 'globe' }: HeaderProps) => {
    const logout = () => {}

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
        </header>
    );
};

export default Header;
