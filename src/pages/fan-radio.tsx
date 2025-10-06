// src/pages/fan-radio.tsx (원래 성공 모달 로직 복구 및 적용)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Modal from '../components/Modal';
import { useAuthStore, useUiStore } from '../../store/authStore';
import { AxiosError } from 'axios';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { fanRadioAPI, RadioData } from '@/apis/fanradioAPI'; // RadioData 타입 임포트

const FanRadioPage = () => {
    const isLoggedIn = useAuthStore((s) => s.isAuthed());
    const openLoginModal = useUiStore((s) => s.openLoginModal);
    const router = useRouter();
    const lang = useAuthStore((state) => state.lang); // 현재는 사용되지 않음

    const defaultBanners = [
        '“언어 감지를 수동으로 진행하고 있습니다. 🛠️\n정확한 번역을 위해 선택하신 언어로만 작성해 주세요. 🥹”',
        '“Language detection is done manually. 🛠️\nFor smoother translation please write only in your selected language. 🥹”',
    ];

    const [bannerItems] = useState<string[]>(defaultBanners);

    const [message, setMessage] = useState('');
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');
    // 🌟 원래 사용하던 modalOpen 상태 복구
    const [modalOpen, setModalOpen] = useState(false); 
    const [isLimitModalOpen, setLimitModalOpen] = useState(false);

    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [nextPath, setNextPath] = useState('');
    const confirmedNavigation = useRef(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [showLangChangeModal, setShowLangChangeModal] = useState(false);
    const [pendingLang, setPendingLang] = useState<'ko' | 'en' | null>(null);

    // 미리보기 유틸
    const getPreview = (text: string, limit = 50) => (text.length > limit ? text.slice(0, limit) + '...' : text);

    /** 전송 진행 상태 & 서버 응답 저장 */
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 🌟 createdRadio 상태에 RadioData 타입 적용
    const [createdRadio, setCreatedRadio] = useState<RadioData | null>(null); 

    // URL 파라미터(editId, editText)로 수정 모드 진입
    useEffect(() => {
        if (!router.isReady) return;
        const { editId, editText } = router.query;
        if (editId) setEditingId(Number(editId));
        if (editText) setMessage(String(editText));
    }, [router.isReady, router.query]);

    //  텍스트 입력 시도 시 로그인 모달을 띄우는 함수
    const handleFocus = () => {
        if (!isLoggedIn) openLoginModal();
    };

    /* 페이지 이탈 방지 로직 */
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

    const handleCancelLeave = () => setShowLeaveModal(false);

    /** 'ko' | 'en' → 서버 명세 'kor' | 'eng' 매핑 */
    const mapLangToApi = (uiLang: 'ko' | 'en'): 'kor' | 'eng' => (uiLang === 'ko' ? 'kor' : 'eng');

    const handleSend = async () => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        if (!message.trim()) {
            alert('메시지를 입력해 주세요.');
            return;
        }
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const payload = {
                lang: mapLangToApi(language),
                text: message.trim(),
            };

            // 수정 모드면 PATCH, 아니면 POST
            const res = editingId
                ? await fanRadioAPI.patchRadio(editingId, payload)
                : await fanRadioAPI.postRadio(payload);

            // 🌟 성공적으로 생성/수정되면 상태 저장 및 모달 열기
            setCreatedRadio(res.data);
            setModalOpen(true);
            
        } catch (e: any) {
            const error = e as AxiosError;
            if (error.response?.status === 409) {
                setLimitModalOpen(true);
            } else {
                console.error('Fan Radio 전송 실패', e);
                alert('요청 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🌟 모달의 Primary 버튼 (Show me) 클릭 핸들러
    const handleSuccessPrimaryClick = () => {
        setModalOpen(false); // 모달 닫기

        if (createdRadio) {
            // 마이페이지로 전달할 메시지 결정 (한국어 or 영어)
            const msg =
                language === 'ko'
                    ? createdRadio.radioTextKor
                    : createdRadio.radioTextEng;
            
            setMessage(''); // 메시지 입력 필드 초기화
            confirmedNavigation.current = true; // 페이지 이동 허용

            // 🌟 마이페이지로 이동 및 쿼리 파라미터 전달
            router.push(`/my-page?modal=fan-radio&message=${encodeURIComponent(msg)}`);
        }
        // createdRadio가 없으면 아무 일도 하지 않음 (모달만 닫음)
    };
    
    // 🌟 모달의 Secondary 버튼 (Close) 클릭 핸들러
    const handleSuccessSecondaryClick = () => {
        setModalOpen(false);
        setMessage(''); // 메시지 입력 필드 초기화
    };


    return (
        <div className="w-full max-w-md mx-auto px-4 min-h-screen overflow-y-auto pt-[70px] pb-[80px]">
            <style jsx global>{`
                .fan-radio-pagination .swiper-pagination-bullet {
                    width: 5px;
                    height: 5px;
                    background-color: rgba(0, 210, 202, 0.5); /* #00D2CA with 50% opacity */
                    border-radius: 50%;
                    opacity: 1;
                    transition: background-color 0.3s;
                    margin: 0 3px !important;
                }
                .fan-radio-pagination .swiper-pagination-bullet-active {
                    background-color: #02f5d0;
                }
            `}</style>

            {/* 메인 이미지 + 배너 묶음 */}
            <div className="rounded-xl overflow-hidden shadow-lg">
                <Image
                    src="/images/fan-radio.svg"
                    alt="Main Fan"
                    width={340}
                    height={180}
                    className="w-full h-auto object-contain"
                />

                {/*  배너 */}
                <div className="relative">
                    <Swiper
                        modules={[Pagination]}
                        spaceBetween={0}
                        slidesPerView={1}
                        loop={true}
                        pagination={{
                            clickable: true,
                            el: '.fan-radio-pagination',
                        }}
                        className="w-full"
                    >
                        {bannerItems.map((text, idx) => (
                            <SwiperSlide key={idx}>
                                <div
                                    className="min-w-full h-[100px] sm:h-[120px] flex flex-col justify-center items-center px-4 py-3 text-center"
                                    style={{
                                        background:
                                            'linear-gradient(90deg, #00DDBC 0%, #009A94 35%, #009A94 49.52%, #009A94 65%, #00DDBC 100%)',
                                    }}
                                >
                                    <div className="flex-1 flex items-center justify-center whitespace-pre-wrap break-words text-xs sm:text-sm text-[#02F5D0]">
                                        {text}
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className="fan-radio-pagination absolute bottom-3 left-0 right-0 z-10 flex justify-center items-center" />
                </div>
            </div>

            {/* 메시지 작성 */}
            <div className="relative w-full mt-6 sm:mt-8">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-0.5 h-3.5 bg-[#02f5d0]" />
                    <span className="text-base sm:text-lg tracking-wide leading-5">Your Radio</span>
                </div>

                {/* 언어 선택 */}
                <div className="flex justify-end gap-4 mb-2">
                    {[
                        { code: 'ko', icon: '/icons/kr.svg', label: 'KR' },
                        { code: 'en', icon: '/icons/us.svg', label: 'EN' },
                    ].map(({ code, icon, label }) => (
                        <div className="flex items-center gap-1.5" key={code}>
                            <Image src={icon} alt={code.toUpperCase()} width={20} height={15} />
                            <span className="text-xs text-gray-300">{label}</span> {/* ✅ kor / eng 텍스트 */}
                            <div
                                className={`w-[15px] h-[15px] rounded-full border-2 border-[#02f5d0] flex items-center justify-center cursor-pointer`}
                                onClick={() => {
                                    if (message.length > 0 && language !== code) {
                                        // 작성 중이면 모달 띄움
                                        setPendingLang(code as 'ko' | 'en');
                                        setShowLangChangeModal(true);
                                    } else {
                                        // 작성 중이 아니면 바로 언어 전환
                                        setLanguage(code as 'ko' | 'en');
                                        setMessage('');
                                    }
                                }}
                            >
                                {language === code && (
                                    <div className="w-[7px] h-[7px] bg-[#02f5d0] rounded-full" />
                                    // ✅ 선택된 경우 안에 작은 점 표시
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 메시지 박스 */}
                <div className="w-full h-[180px] sm:h-[210px] rounded-[15px] relative">
                    <textarea
                        className={`w-full h-full p-4 pr-14 bg-[#22202A] text-sm sm:text-base resize-none rounded-[15px] placeholder:text-[#5a6570] ${
                            !isLoggedIn ? 'text-gray-500' : 'text-white'
                        }`}
                        placeholder={
                            isLoggedIn
                                ? language === 'ko'
                                    ? '한국어로 입력해주세요 😉'
                                    : 'Please type in English only 😉'
                                : '로그인 후 메시지를 작성할 수 있습니다.'
                        }
                        value={message}
                        onChange={(e) => {
                            const val = e.target.value;

                            if (val.length <= 500) {
                                setMessage(val);
                            }
                        }}
                        maxLength={500}
                        readOnly={!isLoggedIn}
                        onFocus={handleFocus}
                    />

                    {/* 입력 필드 내부 오른쪽 아래에 표시 */}
                    <div className="absolute bottom-3 right-4 text-[#444d56] text-[11px] sm:text-xs pointer-events-none">
                        {message.length} / 500
                    </div>
                </div>

                {/* 전송 버튼 */}
                <div className="flex justify-center mt-4 sm:mt-6">
                    <button
                        onClick={handleSend}
                        disabled={!isLoggedIn || isSubmitting}
                        className="w-full bg-[#02F5D0] text-[#383838] py-3 rounded-[15px] text-[15px] sm:text-base tracking-wide disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Sending...' : editingId ? 'Update Fan Radio 📻' : 'Send Fan Radio 📻'}
                    </button>
                </div>
            </div>
            
            {/* 🌟 1. 전송 성공 모달 (원래 로직으로 복구) */}
            <Modal
                isOpen={modalOpen} // modalOpen 상태 사용
                title={editingId ? 'Fan Radio updated' : 'Fan Radio sent'}
                message={
                    createdRadio
                        ? `#${createdRadio.radioSn} by ${createdRadio.writerNickname}`
                        : 'See it in the special frame ✨'
                }
                primaryText="Show me"
                secondaryText="Close"
                icon={createdRadio ? <span>🚀</span> : <span>✨</span>} // 아이콘 추가
                onPrimary={handleSuccessPrimaryClick} // 마이페이지 이동
                onSecondary={handleSuccessSecondaryClick} // 모달 닫기 및 메시지 초기화
            />

            {/* 2. 언어 변경 확인 모달 */}
            <Modal
                isOpen={showLangChangeModal}
                title="Change language?"
                message="Switching will clear your current message. Proceed?"
                primaryText="Switch"
                secondaryText="Cancel"
                onPrimary={() => {
                    if (pendingLang) {
                        setLanguage(pendingLang);
                        setMessage('');
                    }
                    setShowLangChangeModal(false);
                    setPendingLang(null);
                }}
                onSecondary={() => {
                    setShowLangChangeModal(false);
                    setPendingLang(null);
                }}
            />

            {/* 3. 이탈 확인 모달 */}
            <Modal
                isOpen={showLeaveModal}
                title="Leave this page?"
                message="Your draft will vanish if you go 👀"
                primaryText="Go"
                secondaryText="Stay"
                onPrimary={handleConfirmLeave}
                onSecondary={handleCancelLeave}
            />
            
            {/* 4. 전송 횟수 제한 모달 */}
            <Modal
                isOpen={isLimitModalOpen}
                title="Message Limit Reached"
                message={'Post limit reached (3/3). \n Please edit or delete an existing message.'}
                primaryText="OK"
                onPrimary={() => setLimitModalOpen(false)}
            />
        </div>
    );
};

FanRadioPage.title = 'FAN RADIO';
export default FanRadioPage;