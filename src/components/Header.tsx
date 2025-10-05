'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Dropdown from './Dropdown';
import { useAuthStore } from '../../store/authStore';
import { loginAPI } from '@/apis/loginAPI';
import { useRouter } from 'next/router';

interface HeaderProps {
    title: string;
    rightIcon?: 'globe' | 'logout' | 'none' | 'login';
}

const Header = ({ title, rightIcon = 'globe' }: HeaderProps) => {
    const router = useRouter();
    const currentLang = useAuthStore((state) => state.lang);
    const setLang = useAuthStore((state) => state.setLang);
    const logoutAction = useAuthStore((state) => state.logout);
    const [isLangModalOpen, setIsLangModalOpen] = useState(false);

    const handleLanguageSelect = async (lang: 'en' | 'ko') => {
        setLang(lang);
        setIsLangModalOpen(false);
        try {
            await loginAPI.setLanguagePreference(lang);
        } catch (error) {
            console.error('Failed to set language preference:', error);
        }
    };
    const logout = async () => {
        try {
            await loginAPI.logout();
        } catch (e) {
            console.error('Logout API failed, proceeding with client-side logout.', e);
        } finally {
            logoutAction();
            router.push('/login');
        }
    };

    const languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'ko', label: 'Korean' },
    ] as const;

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
