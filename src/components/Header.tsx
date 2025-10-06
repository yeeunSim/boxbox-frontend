'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Dropdown from './Dropdown';
import Modal from '../components/Modal';
import { useAuthStore } from '../../store/authStore';
import { loginAPI } from '@/apis/loginAPI';
import { useRouter } from 'next/router';

interface HeaderProps {
    title: string;
    rightIcon?: 'globe' | 'logout' | 'none' | 'login';
}

const Header = ({ title, rightIcon = 'globe' }: HeaderProps) => {
    const router = useRouter();
    const isLoggedIn = useAuthStore((state) => state.isAuthed());
    const currentLang = useAuthStore((state) => state.lang);
    const setLang = useAuthStore((state) => state.setLang);
    const logoutAction = useAuthStore((state) => state.logout);
    const [isLangModalOpen, setIsLangModalOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const handleLanguageSelect = async (lang: 'en' | 'ko') => {
        setLang(lang);
        setIsLangModalOpen(false);

        //  로그인 상태일 때만 서버에 언어 설정을 저장하는 API를 호출
        if (isLoggedIn) {
            try {
                await loginAPI.setLanguagePreference(lang);
            } catch (error) {
                console.error('Failed to set language preference on server:', error);
            }
        }
    };

    const logout = async () => {
        try {
            await loginAPI.logout();
        } catch (e) {
            console.error('Logout API failed, proceeding with client-side logout.', e);
        } finally {
            logoutAction();
            useAuthStore.persist.clearStorage();
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
                <button onClick={() => setLogoutModalOpen(true)}>
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

            {/* 완료 모달 */}
            <Modal
                isOpen={logoutModalOpen}
                title={'로그아웃 하시겠어요?'}
                message={'Final Lap 🏁'}
                primaryText="확인"
                secondaryText="취소"
                onPrimary={() => {
                    setLogoutModalOpen(false);
                    logout();
                }}
                onSecondary={() => {
                    setLogoutModalOpen(false);
                }}
            />
        </header>
    );
};

export default Header;
