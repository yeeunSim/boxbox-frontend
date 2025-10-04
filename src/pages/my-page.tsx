'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import MyPageModal from '@/components/MyPageModal';
import Modal from '@/components/Modal';

import { myPageAPI } from '@/apis/myPageAPI';
import { useAuthStore } from '../../store/authStore';

interface FanMessage {
    id: number;
    number: string;
    text: string;
}

const MyPage = () => {
    const router = useRouter();
    const { modal } = router.query;
    const currentUser = useAuthStore((state) => state.user);

    const [isFanRadioModalOpen, setIsFanRadioModalOpen] = useState(false);
    const [character, setCharacter] = useState<'female' | 'male'>('female');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);

    const [myMessages, setMyMessages] = useState<FanMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyRadioList = async () => {
            setIsLoading(true);
            const dataFromApi = await myPageAPI.getMyRadioList();

            if (dataFromApi) {
                const formattedMessages: FanMessage[] = dataFromApi.map((item) => ({
                    id: item.radioSn,
                    number: `#${String(item.radioSn).padStart(2, '0')}`,
                    text: item.radioTextEng,
                }));
                setMyMessages(formattedMessages);
            } else {
                setError('내가 쓴 라디오 목록을 불러오는 데 실패했습니다.');
            }
            setIsLoading(false);
        };

        fetchMyRadioList();
    }, []);

    useEffect(() => {
        if (modal === 'fan-radio') {
            setIsFanRadioModalOpen(true);
        }
    }, [modal]);

    const handleDeleteRequest = (id: number) => {
        setDeletingMessageId(id);
        setIsDeleteModalOpen(true);
    };
    const handleConfirmDelete = async () => {
        if (deletingMessageId === null) return;

        const success = await myPageAPI.deleteMyRadio(deletingMessageId);

        if (success) {
            setMyMessages((currentMessages) => currentMessages.filter((message) => message.id !== deletingMessageId));
            console.log(`${deletingMessageId}번 메시지가 성공적으로 삭제되었습니다.`);
        } else {
            alert('메시지 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        }

        setIsDeleteModalOpen(false);
        setDeletingMessageId(null);
    };

    //  로딩 중
    if (isLoading) {
        return <div className="min-h-screen bg-[#191922] text-white flex justify-center items-center">Loading...</div>;
    }

    // 에러 메시지
    if (error) {
        return <div className="min-h-screen bg-[#191922] text-red-500 flex justify-center items-center">{error}</div>;
    }

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
                        <h2 className="font-bold text-3xl text-[#02F5D0]">{currentUser?.userNickname || 'User'}</h2>
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
                nickname={currentUser?.userNickname || 'User'}
                messages={myMessages}
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
