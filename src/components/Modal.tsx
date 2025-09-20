// components/Modal.tsx
import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    message?: string;
    primaryText?: string;
    secondaryText?: string;
    onPrimary?: () => void;
    onSecondary?: () => void;
    icon?: ReactNode;
}

const Modal = ({
    isOpen,
    title,
    message,
    primaryText = 'OK',
    secondaryText,
    onPrimary,
    onSecondary,
    icon,
}: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-[#191922] rounded-2xl px-6 py-8 w-[90%] max-w-[360px] text-center shadow-lg">
                {/* 제목 */}
                <h2 className="font-bold text-white text-lg flex items-center justify-center gap-2">
                    {title} {icon}
                </h2>
                {message && <p className="mt-2 text-sm text-gray-300">{message}</p>}

                {/* 버튼 */}
                <div className="flex justify-center gap-3 mt-6">
                    {secondaryText && (
                        <button
                            onClick={onSecondary}
                            className="w-[110px] h-[34px] text-sm rounded-lg border border-[#02F5D0] text-[#02F5D0] hover:bg-[#02F5D0]/10 transition"
                        >
                            {secondaryText}
                        </button>
                    )}
                    <button
                        onClick={onPrimary}
                        className="w-[110px] h-[34px] text-sm rounded-lg bg-[#02F5D0] text-[#383838] hover:bg-[#00d9b5] transition"
                    >
                        {primaryText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
