'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Modal from '../components/Modal';

const FanRadioPage = () => {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');
    const [currentBanner, setCurrentBanner] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [nextPath, setNextPath] = useState('');
    const confirmedNavigation = useRef(false);

    const banners = [
        `“TYPE YOUR WELCOME NOTE HERE 💌\nCOULD BE THE ONE BOTTAS ACTUALLY READS 👀”`,
        `“SEND A MESSAGE TO YOUR FAVORITE DRIVER 💬\nAND WE’LL MAKE SURE IT HITS THE PIT WALL 🛠️”`,
        `“REV UP YOUR PASSION 🚗💨\nF1 FANS UNITE WITH YOUR WORDS”`,
        `“FEELING FAST?\nDROP A NOTE BEFORE THE NEXT LAP 🏁”`,
        `“YOUR WORDS, THEIR EARS 🎧\nSEND LOVE TO THE TRACKSIDE”`,
    ];

    {
        /* 배너 자동 전환 */
    }
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [banners.length]);

    {
        /* 페이지 이탈 방지 로직 */
    }
    useEffect(() => {
        const handleRouteChange = (url: string) => {
            if (message.length > 0 && !confirmedNavigation.current) {
                setShowLeaveModal(true);
                setNextPath(url);
                router.events.emit('routeChangeError');
                throw 'Route change cancelled to show confirmation modal.';
            }
        };

        router.events.on('routeChangeStart', handleRouteChange);

        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }, [message, router.events]);

    const handleConfirmLeave = () => {
        confirmedNavigation.current = true;
        router.push(nextPath);
    };

    const handleCancelLeave = () => {
        setShowLeaveModal(false);
    };

    const handleSend = () => setModalOpen(true);

    return (
        <div className="w-full max-w-md mx-auto px-4 min-h-screen overflow-y-auto pt-[70px] pb-[80px]">
            {/* 메인 이미지 + 배너 묶음 */}
            <div className="rounded-xl overflow-hidden">
                {/* 메인 이미지 */}
                <Image
                    src="/images/fan-radio.svg"
                    alt="Main Fan"
                    width={340}
                    height={180}
                    className="w-full h-auto object-contain"
                />

                {/* 배너 */}
                <div className="overflow-hidden relative w-full h-[100px] sm:h-[120px] md:h-[140px]">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                    >
                        {banners.map((text, idx) => (
                            <div
                                key={idx}
                                className="min-w-full flex flex-col justify-between px-4 py-3 text-center text-[#383838]"
                                style={{
                                    background: 'linear-gradient(90deg, #00CCAD 0%, #003B39 100%)',
                                }}
                            >
                                <div className="flex-1 flex items-center justify-center whitespace-pre-wrap break-words text-xs sm:text-sm">
                                    {text}
                                </div>
                                <div className="mt-2 flex justify-center items-center gap-1">
                                    {banners.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${
                                                i === currentBanner ? 'bg-[#02F5D0]' : 'bg-[#00A19B80]'
                                            } rounded-sm`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 메시지 작성 */}
            <div className="relative w-full mt-6 sm:mt-8">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-0.5 h-3.5 bg-[#02f5d0]" />
                    <span className="text-base sm:text-lg tracking-wide leading-5">Your Radio</span>
                </div>

                {/* 언어 선택 */}
                <div className="flex justify-end gap-3 mb-2">
                    {[
                        { code: 'ko', icon: '/icons/kr.svg' },
                        { code: 'en', icon: '/icons/us.svg' },
                    ].map(({ code, icon }) => (
                        <div className="flex items-center gap-1.5" key={code}>
                            <Image src={icon} alt={code.toUpperCase()} width={20} height={15} />
                            <div
                                className={`w-[15px] h-[15px] rounded-[2px] border-2 border-[#02f5d0] flex items-center justify-center cursor-pointer ${
                                    language === code ? 'bg-[#02f5d0]' : ''
                                }`}
                                onClick={() => setLanguage(code as 'ko' | 'en')}
                            >
                                {language === code && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="12"
                                        height="12"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                    >
                                        <path
                                            d="M4 10L8 14L16 6"
                                            stroke="#383838"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 메시지 박스 */}
                <div className="w-full h-[180px] sm:h-[210px] bg-[#22202A] rounded-[15px] relative">
                    <textarea
                        className="w-full h-full p-4 bg-transparent text-white text-sm sm:text-base resize-none rounded-[15px] placeholder:text-[#5a6570]"
                        placeholder={language === 'ko' ? '한국어로 입력해주세요 😉' : 'Please type in English only 😉'}
                        value={message}
                        onChange={(e) => {
                            const input = e.target.value;
                            if (language === 'ko') {
                                const filtered = input.replace(/[^ㄱ-ㅎ가-힣0-9\s.,!?'"@#$%^&*()\-_=+]/g, '');
                                setMessage(filtered);
                            } else {
                                const filtered = input.replace(/[^a-zA-Z0-9\s.,!?'"@#$%^&*()\-_=+]/g, '');
                                setMessage(filtered);
                            }
                        }}
                        maxLength={500}
                    />
                    <div className="absolute bottom-4 right-4 text-[#444d56] text-[11px] sm:text-xs">
                        {message.length} / 500
                    </div>
                </div>

                {/* 전송 버튼 */}
                <div className="flex justify-center mt-4 sm:mt-6">
                    <button
                        onClick={handleSend}
                        className="w-full bg-[#02F5D0] text-[#383838] py-3 rounded-[15px] text-[15px] sm:text-base tracking-wide"
                    >
                        Send Fan Radio 📻
                    </button>
                </div>
            </div>

            {/* 전송 완료 모달 */}
            <Modal
                isOpen={modalOpen}
                title="Fan Radio sent"
                message="See it in the special frame ✨"
                primaryText="Show me"
                secondaryText="Cancel"
                icon={<span>🚀</span>}
                onPrimary={() => {
                    setModalOpen(false);
                    // ✨ 수정된 부분 ✨
                    confirmedNavigation.current = true;
                    router.push(`/my-page?modal=fan-radio&message=${encodeURIComponent(message)}`);
                }}
                onSecondary={() => setModalOpen(false)}
            />
            {/* 이탈 확인 모달 */}
            <Modal
                isOpen={showLeaveModal}
                title="Leave this page?"
                message="Your draft will vanish if you go 👀"
                primaryText="Go"
                secondaryText="Stay"
                onPrimary={handleConfirmLeave}
                onSecondary={handleCancelLeave}
            />
        </div>
    );
};

FanRadioPage.title = 'FAN RADIO';
export default FanRadioPage;
