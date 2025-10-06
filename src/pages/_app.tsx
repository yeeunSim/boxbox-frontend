// src/pages/_app.tsx

import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Modal from '@/components/Modal';
import { useAuthStore, useUiStore } from '../../store/authStore';

type NextPageWithLayout = NextPage & {
    title?: string;
    hideLayout?: boolean;
    rightIconType?: 'globe' | 'logout' | 'none' | 'login';
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

function AppContent({ Component, pageProps }: AppPropsWithLayout) {
    const isLoggedIn = useAuthStore((s) => s.isAuthed());
    const isLoginModalOpen = useUiStore((s) => s.isLoginModalOpen);
    const closeLoginModal = useUiStore((s) => s.closeLoginModal);

    const router = useRouter();

    useEffect(() => {
        // sessionStorage를 사용해 현재 세션에서 인트로를 봤는지 확인
        const hasSeenIntro = sessionStorage.getItem('seenIntro');

        // 인트로를 본 적이 없고, 현재 경로가 인트로 페이지가 아니라면 리다이렉트
        if (!hasSeenIntro && router.pathname !== '/intro') {
            router.push('/intro');
        }
    }, [router]); // router 객체가 변경될 때마다 이 효과를 재실행

    const handleRedirectToLogin = () => {
        closeLoginModal();
        router.push('/login');
    };

    const getTitle = Component.title ?? 'Default Title';
    const hideLayout = Component.hideLayout ?? false;

    const getRightIcon = () => {
        const isMainPage = router.pathname === '/';

        if (isMainPage && !isLoggedIn) {
            return 'login';
        }

        return Component.rightIconType ?? 'globe';
    };

    return (
        <>
            {hideLayout ? (
                <div className="font-formula1">
                    <Component {...pageProps} />
                </div>
            ) : (
                <div className="relative flex min-h-screen flex-col bg-[#191922] font-formula1 text-white">
                    {/* 결정된 아이콘 타입을 Header에 전달 */}
                    <Header title={getTitle} rightIcon={getRightIcon()} />
                    <main className="flex-grow">
                        <Component {...pageProps} />
                    </main>
                    <BottomNav />
                </div>
            )}
            <Modal
                isOpen={isLoginModalOpen}
                title="Login Required"
                message="This feature is available after logging&nbsp;in."
                primaryText="Login"
                secondaryText="Cancel"
                onPrimary={handleRedirectToLogin}
                onSecondary={closeLoginModal}
            />
        </>
    );
}

export default function App(props: AppPropsWithLayout) {
    return <AppContent {...props} />;
}
