'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import MyPageModal from '@/components/MyPageModal';
import Modal from '@/components/Modal';

const MyPage = () => {
    const router = useRouter();
    const { modal } = router.query;

    const [isFanRadioModalOpen, setIsFanRadioModalOpen] = useState(false);
    const [character, setCharacter] = useState<'female' | 'male'>('female');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);

    const [fanMessages, setFanMessages] = useState([
        { id: 1, number: '#01', text: '첫 번째 팬라디오 메시지입니다.' },
        { id: 2, number: '#02', text: '두 번째 메시지입니다.' },
        { id: 3, number: '#03', text: '세 번째 메시지입니다.' },
    ]);

    useEffect(() => {
        if (modal === 'fan-radio') {
            setIsFanRadioModalOpen(true);
        }
    }, [modal]);

    const handleDeleteRequest = (id: number) => {
        setDeletingMessageId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deletingMessageId === null) return;

        setFanMessages((currentMessages) => currentMessages.filter((message) => message.id !== deletingMessageId));

        setIsDeleteModalOpen(false);
        setDeletingMessageId(null);
    };

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

            <MyPageModal
                isOpen={isFanRadioModalOpen}
                nickname="GAMJA"
                messages={fanMessages}
                onClose={() => {
                    setIsFanRadioModalOpen(false);
                    router.replace('/my-page', undefined, { shallow: true });
                }}
                onDelete={handleDeleteRequest}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                title="Delete Message?"
                message="Are you sure you want to delete this radio message permanently?"
                primaryText="Delete"
                secondaryText="Cancel"
                onPrimary={handleConfirmDelete}
                onSecondary={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingMessageId(null);
                }}
            />
        </div>
    );
};

MyPage.hideLayout = true;

export default MyPage;
