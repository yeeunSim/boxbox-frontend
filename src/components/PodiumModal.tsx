'use client';

import Image from 'next/image';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

type Message = {
    id: number;
    number: string;
    text: string;
    isLiked: boolean;
};

export interface PodiumModalProps {
    isOpen: boolean;
    nickname: string;
    message: Message | null;
    onClose: () => void;
    onLike: (id: number) => void;
    isLoading?: boolean;
}

const PodiumModal = ({ isOpen, nickname, message, onClose, onLike }: PodiumModalProps) => {
    if (!isOpen || !message) return null;

    const handleDownload = () => {
        const target = document.getElementById(`radio-card-podium-${message.id}`);
        if (!target) return;

        setTimeout(() => {
            html2canvas(target, {
                scale: 2,
                backgroundColor: '#191922',
                useCORS: true,
                onclone: (clonedDoc) => {
                    const iconGroup = clonedDoc.querySelector('.translate-x-4') as HTMLElement;
                    if (iconGroup) iconGroup.style.transform = 'none';

                    const messageNumber = clonedDoc.querySelector('.-translate-x-4') as HTMLElement;
                    if (messageNumber) messageNumber.style.transform = 'none';

                    const waveContainer = clonedDoc.querySelector('.-mt-6') as HTMLElement;
                    if (waveContainer) waveContainer.style.marginTop = '0';

                    const radioText = clonedDoc.querySelector('.radio-text') as HTMLElement;
                    if (radioText) {
                        radioText.style.position = 'relative';

                        radioText.style.top = '-14px';
                    }
                },
            }).then((canvas) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        saveAs(blob, `radio-card-${message.id}.png`);
                    }
                });
            });
        }, 300);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50" onClick={onClose}>
            <div
                className="rounded-2xl p-4 text-white relative w-[80%] max-w-[360px]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 아이콘 영역 */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-3 translate-x-4">
                        <button onClick={() => onLike(message.id)}>
                            <Image
                                src={message.isLiked ? '/icons/like-active.svg' : '/icons/like.svg'}
                                alt="Like"
                                width={28}
                                height={28}
                            />
                        </button>
                        <button onClick={handleDownload}>
                            <Image src="/icons/download.svg" alt="Download" width={28} height={28} />
                        </button>
                    </div>
                    <span className="text-[#02F5D0] -translate-x-4 font-bold text-[18px] sm:text-[20px] lg:text-[22px]">
                        {message.number}
                    </span>
                </div>

                {/* 라디오 카드 */}
                <div
                    id={`radio-card-podium-${message.id}`}
                    className="bg-[#191922] border-2 border-[#02F5D0] rounded-xl mx-auto flex flex-col gap-1"
                >
                    <div className="p-4">
                        <h2 className="font-bold text-right text-[#02F5D0] text-[28px]">{nickname}</h2>
                        <div className="flex justify-end items-center gap-2">
                            <Image src="/icons/mercedes-logo.svg" alt="Mercedes Logo" width={24} height={24} />
                            <span className="font-bold text-[30px] radio-text">Radio</span>
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
                    <div className="p-4 min-h-[100px]">
                        <p className="text-[#02F5D0] text-[17px] text-right leading-relaxed whitespace-pre-wrap break-words">
                            {`“${message?.text}”`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PodiumModal;
