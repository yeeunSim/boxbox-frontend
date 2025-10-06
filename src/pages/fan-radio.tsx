// src/pages/fan-radio.tsx
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
import { fanRadioAPI } from '@/apis/fanradioAPI';
import { useTranslations } from '@/hooks/useTranslations';

const FanRadioPage = () => {
    const isLoggedIn = useAuthStore((s) => s.isAuthed());
    const openLoginModal = useUiStore((s) => s.openLoginModal);
    const router = useRouter();
    const lang = useAuthStore((state) => state.lang);
    const t = useTranslations();
    const defaultBanners = [t.banner1, t.banner2];

    const [message, setMessage] = useState('');
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');
    const [modalOpen, setModalOpen] = useState(false);
    const [isLimitModalOpen, setLimitModalOpen] = useState(false);

    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [nextPath, setNextPath] = useState('');
    const confirmedNavigation = useRef(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [bannerItems, setBannerItems] = useState<string[]>(defaultBanners);

    useEffect(() => {
        const fetchBannerData = async () => {
            const driverRadios = await fanRadioAPI.getDriverNumberRadios();
            if (driverRadios && driverRadios.length > 0) {
                const formattedApiBanners = driverRadios.map(
                    (radio) => `#${radio.radioSn} Message by ${radio.radioNickname}\n“${radio.radioTextEng}”`
                );
                setBannerItems([...defaultBanners, ...formattedApiBanners]);
            } else {
                setBannerItems(defaultBanners); // 데이터 없으면 기본 배너만 설정
            }
        };
        fetchBannerData();
    }, [lang, t.banner1, t.banner2]);

    /** 전송 진행 상태 & 서버 응답 저장 */
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdRadio, setCreatedRadio] = useState<{
        radioSn: number;
        radioTextKor: string;
        radioTextEng: string;
        writerNickname: string;
    } | null>(null);

    // URL 파라미터(editId, editText)로 수정 모드 진입
    useEffect(() => {
        if (!router.isReady) return;
        const { editId, editText } = router.query;
        if (editId) setEditingId(Number(editId));
        if (editText) setMessage(String(editText));
    }, [router.isReady, router.query]);
    //페이지 로드 시 '드라이버 넘버' 라디오를 가져오는 useEffect를 추가
    useEffect(() => {
        const fetchBannerData = async () => {
            const driverRadios = await fanRadioAPI.getDriverNumberRadios();

            if (driverRadios && driverRadios.length > 0) {
                // API로부터 받은 데이터를 배너 텍스트 형식으로 변환
                const formattedApiBanners = driverRadios.map(
                    (radio) => `#${radio.radioSn} Message by ${radio.radioNickname}\n“${radio.radioTextEng}”`
                );

                // 기본 안내 문구 뒤에 API 배너를 추가하여 상태를 업데이트
                setBannerItems([...defaultBanners, ...formattedApiBanners]);
            }
            // 데이터가 없으면, 상태는 defaultBanners로 유지
        };

        fetchBannerData();
    }, []); // 최초 1회만 실행

    //  텍스트 입력 시도 시 로그인 모달을 띄우는 함수
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

            // 성공적으로 생성/수정되면 모달 오픈 & 응답 저장
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

                {/*  배너 */}
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
                <div className="w-full h-[180px] sm:h-[210px] rounded-[15px] relative">
                    <textarea
                        className={`w-full h-full p-4 bg-[#22202A] text-sm sm:text-base resize-none rounded-[15px] placeholder:text-[#5a6570] ${
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
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={500}
                        readOnly={!isLoggedIn}
                        onFocus={handleFocus}
                    />
                    <div className="absolute bottom-4 right-4 text-[#444d56] text-[11px] sm:text-xs">
                        {message.length} / 500
                    </div>

                    {!isLoggedIn && (
                        <div className="absolute inset-0 z-10 cursor-pointer rounded-[15px]" onClick={openLoginModal} />
                    )}
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

            {/* 완료 모달 */}
            <Modal
                isOpen={modalOpen}
                title={editingId ? 'Fan Radio updated' : 'Fan Radio sent'}
                message={
                    createdRadio
                        ? `#${createdRadio.radioSn} by ${createdRadio.writerNickname}\n“${createdRadio.radioTextEng}”`
                        : 'See it in the special frame ✨'
                }
                primaryText="Show me"
                secondaryText="Close"
                icon={<span>🚀</span>}
                onPrimary={() => {
                    setModalOpen(false);
                    setMessage('');
                    confirmedNavigation.current = true;
                    const msg = createdRadio?.radioTextEng ?? message;
                    router.push(`/my-page?modal=fan-radio&message=${encodeURIComponent(msg)}`);
                }}
                onSecondary={() => {
                    setModalOpen(false);
                    setMessage('');
                }}
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
