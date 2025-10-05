'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';

import { Swiper, SwiperSlide, SwiperRef } from 'swiper/react';
import 'swiper/css';

type Message = {
    id: number;
    number: string;
    text: string;
};

export interface MyPageModalProps {
    isOpen: boolean;
    nickname: string;
    messages: Message[];
    initialSlide?: number;
    onClose: () => void;

    onDelete: (id: number) => void;
}

const MyPageModal = ({ isOpen, nickname, messages = [], initialSlide = 0, onClose, onDelete }: MyPageModalProps) => {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(initialSlide);
    const swiperRef = useRef<SwiperRef>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (isOpen && swiperRef.current) {
            swiperRef.current.swiper.slideTo(initialSlide, 0);
            setActiveIndex(initialSlide);
        }
    }, [isOpen, initialSlide]);

    if (!isOpen) return null;

    const handleDownload = () => {
        const target = cardRefs.current[activeIndex];
        if (!target) return;

        html2canvas(target, { scale: 2, backgroundColor: null }).then((canvas) => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `radio-card-${messages[activeIndex].id}.png`;
            link.click();
        });
    };

    const currentMessage = messages[activeIndex] || messages[0];

    const handleEdit = () => {
        if (!currentMessage) return;

        const query = new URLSearchParams({
            editId: String(currentMessage.id),
            editText: currentMessage.text,
        });

        router.push(`/fan-radio?${query.toString()}`);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50" onClick={onClose}>
            <div
                className="rounded-2xl p-4 text-white relative w-[85%] max-w-[380px]"
                onClick={(e) => e.stopPropagation()}
            >
                {messages.length > 0 ? (
                    // --- 1. 메시지가 있을 경우: 기존 Swiper UI ---
                    <>
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex gap-3 translate-x-4">
                                <button onClick={handleDownload}>
                                    <Image src="/icons/download.svg" alt="Download" width={28} height={28} />
                                </button>
                                <button onClick={handleEdit}>
                                    <Image src="/icons/message-edit.svg" alt="Edit" width={28} height={28} />
                                </button>
                                <button onClick={() => onDelete(currentMessage.id)}>
                                    <Image src="/icons/message-delete.svg" alt="Delete" width={28} height={28} />
                                </button>
                            </div>
                            <span className="text-[#02F5D0] -translate-x-4 font-bold text-[18px]">
                                {currentMessage?.number}
                            </span>
                        </div>

                        <div className="relative">
                            <Swiper
                                ref={swiperRef}
                                spaceBetween={10}
                                slidesPerView={1}
                                initialSlide={initialSlide}
                                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                                className="w-full"
                            >
                                {messages.map((msg, index) => (
                                    <SwiperSlide key={msg.id}>
                                        <div
                                            id={`radio-card-mypage-${msg.id}`}
                                            ref={(el) => {
                                                cardRefs.current[index] = el;
                                            }}
                                            className="bg-[#191922] border-2 border-[#02F5D0] rounded-xl mx-auto flex flex-col gap-1"
                                        >
                                            <div className="p-4">
                                                <h2 className="font-bold text-right text-[#02F5D0] text-[28px]">
                                                    {nickname}
                                                </h2>
                                                <div className="flex justify-end items-center gap-2">
                                                    <Image
                                                        src="/icons/mercedes-logo.svg"
                                                        alt="Mercedes Logo"
                                                        width={24}
                                                        height={24}
                                                    />
                                                    <span className="font-bold text-[30px]">Radio</span>
                                                </div>
                                            </div>
                                            <div className="relative w-full -mt-6">
                                                <Image
                                                    src="/icons/radio-wave.svg"
                                                    alt="Radio Wave"
                                                    width={800}
                                                    height={150}
                                                    className="w-full h-auto object-contain"
                                                />
                                                <div className="w-full h-[2px] bg-[#444D56] mt-1" />
                                                <Image
                                                    src="/icons/radio-wave2.svg"
                                                    alt="Radio Wave Shadow"
                                                    width={800}
                                                    height={150}
                                                    className="w-full h-auto object-contain -mt-1.5"
                                                />
                                            </div>
                                            <div className="p-4 pb-10 min-h-[100px] flex items-end justify-end">
                                                <p className="text-[#02F5D0] text-[17px] text-right leading-relaxed whitespace-pre-wrap break-words">{`“${msg.text}”`}</p>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center items-center gap-[6px]">
                                {messages.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-[6px] h-[6px] rounded-full transition-colors duration-300 ${
                                            index === activeIndex ? 'bg-[#02f5d0]' : 'bg-[#00A19B]/50'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    // --- 2. 메시지가 없을 경우: 새로운 안내 UI ---
                    <div className="bg-[#191922] border-2 border-[#02F5D0] rounded-xl mx-auto flex flex-col items-center justify-center gap-6 p-8 min-h-[300px]">
                        <Image src="/icons/radio-btn.svg" alt="No messages" width={64} height={64} />
                        <p className="text-lg  text-center">You haven't written any messages yet.</p>
                        <button
                            onClick={() => router.push('/fan-radio')}
                            className="bg-[#02F5D0] text-black font-bold py-3 px-6 rounded-lg transition hover:bg-opacity-80"
                        >
                            Go to Fan Radio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPageModal;
