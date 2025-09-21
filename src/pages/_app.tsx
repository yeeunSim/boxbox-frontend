import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

type NextPageWithLayout = NextPage & {
    title?: string;
    hideLayout?: boolean;

    rightIconType?: 'globe' | 'logout' | 'none';
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
    const getTitle = Component.title ?? 'Default Title';
    const hideLayout = Component.hideLayout ?? false;

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
            <Header title={getTitle} rightIcon={rightIcon} />
            <main className="flex-grow">
                <Component {...pageProps} />
            </main>
            <BottomNav />
        </div>
    );
}
