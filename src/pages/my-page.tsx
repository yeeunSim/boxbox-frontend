'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
// 1. MyPageModal을 import 합니다.
import MyPageModal from '@/components/MyPageModal';

const MyPage = () => {
    const router = useRouter();
    const { modal } = router.query;

    const [isFanRadioModalOpen, setIsFanRadioModalOpen] = useState(false);
    const [character, setCharacter] = useState<'female' | 'male'>('female');

    // 2. 슬라이더에 사용할 메시지 배열 데이터를 state로 관리합니다. (API 연동 전 임시 데이터)
    const [fanMessages, setFanMessages] = useState([
        { id: 1, number: '#01', text: '첫 번째 팬라디오 메시지입니다.' },
        { id: 2, number: '#02', text: '두 번째 메시지입니다.' },
        { id: 3, number: '#03', text: '세 번째 메시지입니다.' },
    ]);

    useEffect(() => {
        // message 쿼리 파라미터는 더 이상 사용하지 않습니다.
        if (modal === 'fan-radio') {
            setIsFanRadioModalOpen(true);
        }
    }, [modal]);

    return (
        <div className="min-h-screen bg-[#191922]">
            <Header title="MYPAGE" rightIcon="logout" />

            <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 z-0 bg-[url('/images/mypage-bg.svg')] bg-center bg-no-repeat" />

                <div className="relative z-10 flex flex-col min-h-screen justify-center pt-16 pb-24">
                    <main className="flex-1 flex flex-col items-center justify-center text-center">
                        <button onClick={() => setCharacter((prev) => (prev === 'female' ? 'male' : 'female'))}>
                            <Image
                                src={`/icons/character-${character}.svg`}
                                alt={`${character} character`}
                                width={250}
                                height={370}
                                className="mb-4"
                            />
                        </button>
                        <h2 className="font-bold text-3xl text-[#02F5D0]">GAMJA</h2>
                    </main>
                    <button
                        onClick={() => setIsFanRadioModalOpen(true)}
                        className="absolute bottom-24 right-4 sm:right-10 w-16 h-16 z-20"
                    >
                        <Image src="/icons/radio-btn.svg" alt="Open Radio Modal" layout="fill" />
                    </button>
                </div>
            </div>

            <BottomNav />

            {/* 3. MyPageModal 컴포넌트를 호출하고 props를 전달합니다. */}
            <MyPageModal
                isOpen={isFanRadioModalOpen}
                nickname="GAMJA"
                messages={fanMessages}
                onClose={() => {
                    setIsFanRadioModalOpen(false);
                    router.replace('/my-page', undefined, { shallow: true });
                }}
                onEdit={(id) => console.log('Edit message ID:', id)}
                onDelete={(id) => console.log('Delete message ID:', id)}
            />
        </div>
    );
};

MyPage.hideLayout = true;

export default MyPage;
