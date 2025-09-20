'use client';

import { useState } from 'react';
import Image from 'next/image';
import Dropdown from './Dropdown';

interface HeaderProps {
    title: string;
}

const Header = ({ title }: HeaderProps) => {
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

    return (
        <header className="fixed top-0 w-full bg-[#191922] z-30 safe-area-padding-top">
            <div className="max-w-md mx-auto h-[66px] sm:h-[72px] flex justify-between items-center px-4">
                <h1 className="font-bold text-[20px] sm:text-[24px] text-white">{title}</h1>
                <div className="relative">
                    <button onClick={() => setIsLangModalOpen((prev) => !prev)}>
                        <Image src="/icons/globe-icon.svg" alt="Language" width={30} height={30} />
                    </button>
                    {isLangModalOpen && (
                        <Dropdown options={languageOptions} selected={currentLang} onSelect={handleLanguageSelect} />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
