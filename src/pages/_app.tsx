// src/pages/_app.tsx

import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/Modal';

type NextPageWithLayout = NextPage & {
    title?: string;
    hideLayout?: boolean;
    rightIconType?: 'globe' | 'logout' | 'none' | 'login';
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

function AppContent({ Component, pageProps }: AppPropsWithLayout) {
    const { isLoggedIn, isLoginModalOpen, closeLoginModal } = useAuth();
    const router = useRouter();

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
    return (
        <AuthProvider>
            <AppContent {...props} />
        </AuthProvider>
    );
}
