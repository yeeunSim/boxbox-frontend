'use client';

import { useState } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';

export interface RadioModalProps {
    isOpen: boolean;
    nickname: string;
    message: string;
    number: string;
    onClose: () => void;

    showEdit?: boolean;
    showDelete?: boolean;
    showLike?: boolean;

    onEdit?: () => void;
    onDelete?: () => void;
    onLike?: () => void;
}

const RadioModal = ({
    isOpen,
    nickname,
    message,
    number,
    onClose,
    showEdit,
    showDelete,
    showLike,
    onEdit,
    onDelete,
    onLike,
}: RadioModalProps) => {
    const [isLiked, setIsLiked] = useState(false);

    if (!isOpen) return null;

    const handleDownload = () => {
        const target = document.getElementById('radio-card');
        if (!target) return;

        html2canvas(target, { scale: 2, backgroundColor: null }).then((canvas) => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'radio-card.png';
            link.click();
        });
    };

    const toggleLike = () => {
        setIsLiked((prev) => !prev);
        if (onLike) onLike();
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
                        {/* 좋아요 */}
                        {showLike && (
                            <button onClick={toggleLike}>
                                <Image
                                    src={isLiked ? '/icons/like-active.svg' : '/icons/like.svg'}
                                    alt="Like"
                                    width={28}
                                    height={28}
                                    className="w-[28px] h-[28px] sm:w-[28px] sm:h-[26px] lg:w-[30px] lg:h-[30px]"
                                />
                            </button>
                        )}
                        {/* 다운로드 */}
                        <button onClick={handleDownload}>
                            <Image
                                src="/icons/download.svg"
                                alt="Download"
                                width={28}
                                height={28}
                                className="w-[30px] h-[30px] sm:w-[26px] sm:h-[26px] lg:w-[30px] lg:h-[30px]"
                            />
                        </button>

                        {/* 수정 */}
                        {showEdit && (
                            <button onClick={onEdit}>
                                <Image
                                    src="/icons/message-edit.svg"
                                    alt="Edit"
                                    width={28}
                                    height={28}
                                    className="w-[25px] h-[25px] sm:w-[26px] sm:h-[26px] lg:w-[30px] lg:h-[30px]"
                                />
                            </button>
                        )}

                        {/* 삭제 */}
                        {showDelete && (
                            <button onClick={onDelete}>
                                <Image
                                    src="/icons/message-delete.svg"
                                    alt="Delete"
                                    width={28}
                                    height={28}
                                    className="w-[25px] h-[25px] sm:w-[26px] sm:h-[26px] lg:w-[30px] lg:h-[30px]"
                                />
                            </button>
                        )}
                    </div>
                    <span className="text-[#02F5D0] -translate-x-4 font-bold text-[18px] sm:text-[20px] lg:text-[22px]">
                        {number}
                    </span>
                </div>

                {/* 라디오 카드 */}
                <div
                    id="radio-card"
                    className="bg-[#191922] border-2 border-[#02F5D0] rounded-xl mx-auto flex flex-col gap-1"
                >
                    {/* 닉네임 + 로고 */}
                    <div className="p-4">
                        <h2 className="font-bold text-right text-[#02F5D0] text-[28px]">{nickname}</h2>
                        <div className="flex justify-end items-center gap-2">
                            <Image src="/icons/mercedes-logo.svg" alt="Mercedes Logo" width={24} height={24} />
                            <span className="font-bold text-[30px]">Radio</span>
                        </div>
                    </div>

                    {/* 파형 */}
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

                    {/* 메시지 */}
                    <div className="p-4">
                        <p className="text-[#02F5D0] text-[17px] text-right leading-relaxed">{`“${message}”`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RadioModal;
