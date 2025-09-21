import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

type NextPageWithLayout = NextPage & {
    title?: string;
    hideLayout?: boolean;
    // 👇 페이지별로 헤더 오른쪽 아이콘을 지정할 수 있는 타입 추가
    rightIconType?: 'globe' | 'logout' | 'none';
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
    const getTitle = Component.title ?? 'Default Title';
    const hideLayout = Component.hideLayout ?? false;
    // 👇 페이지에 지정된 rightIconType을 가져오고, 없으면 'globe'를 기본값으로 사용
    const rightIcon = Component.rightIconType ?? 'globe';

    if (hideLayout) {
        return (
            <div className="font-formula1">
                <Component {...pageProps} />
            </div>
        );
    }

    return (
        <div className="relative bg-[#191922] text-white min-h-screen flex flex-col font-formula1">
            {/* 👇 Header에 rightIcon prop을 전달 */}
            <Header title={getTitle} rightIcon={rightIcon} />
            <main className="flex-grow">
                <Component {...pageProps} />
            </main>
            <BottomNav />
        </div>
    );
}
