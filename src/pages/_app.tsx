// src/pages/_app.tsx

import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Modal from '@/components/Modal';
import { useAuthStore, useUiStore } from '../../store/authStore';
import http from '@/apis/axiosConfig';

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

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const bootstrapped = useRef(false);
    useEffect(() => {
        if (bootstrapped.current) return;
        bootstrapped.current = true;

        const { user, accessToken, setAccessToken, logout } = useAuthStore.getState();

        // 기존 토큰이 있으면 axios 기본 헤더에도 반영
        if (accessToken) {
            setAccessToken(accessToken);
            return;
        }

        // user만 남아있으면 조용히 재발급
        if (user && !accessToken) {
            (async () => {
                try {
                    // ⚠️ axiosConfig에서 withCredentials: true 설정돼 있어야 쿠키가 붙음
                    const { data } = await http.post('/refresh');
                    const newAccess = (data as any).accessToken as string | undefined;
                    if (!newAccess) throw new Error('No accessToken in response');

                    setAccessToken(newAccess);
                } catch (e) {
                    // 재발급 실패 → 세션 정리
                    logout();
                    delete http.defaults.headers.common.Authorization;
                }
            })();
        }
    }, []);

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

    const safeRightIcon = mounted ? getRightIcon() : 'none';

    return (
        <>
            {hideLayout ? (
                <div className="font-formula1">
                    <Component {...pageProps} />
                </div>
            ) : (
                <div className="relative flex min-h-screen flex-col bg-[#191922] font-formula1 text-white">
                    {/* 결정된 아이콘 타입을 Header에 전달 */}
                    <Header title={getTitle} rightIcon={safeRightIcon} />
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
