import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

// 사운드 파일 경로 (public 폴더 기준) - 경로를 꼭 확인해주세요.
const INTRO_SOUND_PATH = '/sounds/f1-boxbox.mp3';

// 🌟 볼륨 설정: 0.8로 설정하여 살짝 줄임 (0.0 ~ 1.0 사이 값)
const SOUND_VOLUME = 0.8; 

const IntroPage = () => {
    const [step, setStep] = useState(0); // 0: 초기, 1: 모달 등장, 2: 모달 확장
    const [isStarted, setIsStarted] = useState(false); // 애니메이션 시작 여부 플래그
    const router = useRouter();

    // 오디오 객체 및 타이머 ID를 useRef로 안전하게 관리
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRefs = useRef<number[]>([]);

    // 💡 startIntroSequence: 클릭 시 실행되는 핵심 로직
    const startIntroSequence = useCallback(() => {
        // 이미 시작된 경우 중복 실행 방지
        if (isStarted) return; 
        
        // 시작 상태로 변경
        setIsStarted(true);
        
        // 1. 오디오 객체 준비 및 재생 함수 정의
        if (typeof window !== 'undefined' && audioRef.current === null) {
            audioRef.current = new Audio(INTRO_SOUND_PATH);
            // 🌟 수정된 부분: 오디오 객체 생성 시 볼륨 설정
            audioRef.current.volume = SOUND_VOLUME; 
        }
        
        const playSound = () => {
            if (audioRef.current) {
                // 사운드가 처음부터 재생되도록 초기화
                audioRef.current.currentTime = 0; 
                audioRef.current.play().catch(error => {
                    // 브라우저 자동 재생 정책으로 인한 에러 처리
                    console.error("Audio playback failed (Autoplay policy may block it):", error);
                });
            }
        };

        // 2. 타이머 설정 (모든 타이머 로직이 여기에 있습니다)
        
        // 1.5초 후에 모달 등장 및 사운드 재생
        // window.setTimeout을 사용하여 Next.js 환경에서도 타입 오류 방지
        const timer1 = window.setTimeout(() => {
            setStep(1);
            playSound(); // 모달 등장과 동시에 효과음 재생
        }, 1500);

        // 3초 후에 모달 확장
        const timer2 = window.setTimeout(() => setStep(2), 3000);

        // 4.5초 후에 홈 화면으로 이동
        const timer3 = window.setTimeout(() => {
            sessionStorage.setItem('seenIntro', 'true');
            router.push('/');
        }, 4500);
        
        // 타이머 ID 저장 (클린업을 위해)
        timerRefs.current = [timer1, timer2, timer3];

    }, [isStarted, router]);
    
    // 💡 useEffect: 컴포넌트 언마운트 시 타이머만 정리
    useEffect(() => {
        return () => {
            // 저장된 모든 타이머 정리
            timerRefs.current.forEach(clearTimeout);
            
            // 오디오 재생 중지 (필요하다면)
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행 및 언마운트 시 정리

    return (
        <div className="min-h-screen w-full bg-[#191922]">
            <main
                // 🌟 핵심 수정: isStarted가 false일 때만 클릭 핸들러 작동
                onClick={!isStarted ? startIntroSequence : undefined}
                className="relative flex h-screen w-full max-w-[430px] mx-auto flex-col items-center justify-center bg-black font-['Formula1'] bg-center bg-cover cursor-pointer"
                style={{ backgroundImage: "url('/images/intro-bg.svg')" }}
            >
                <div
                    className={`absolute inset-0 bg-black/70 transition-opacity duration-700 ${
                        step >= 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                />

                {/* 음표 아이콘 (클릭 유도) */}
                <div className={`transition-opacity duration-500 ${step === 0 ? 'opacity-100' : 'opacity-0'}`}>
                    {/* 🌟 클릭 유도 텍스트 추가: 시작 전 상태일 때만 표시 */}
                    {!isStarted && (
                        <div className="text-white text-lg font-bold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20 animate-pulse text-center">
                            Touch to <br/> Start Radio
                        </div>
                    )}
                    <Image src="/icons/music.svg" alt="Music" width={80} height={80} />
                </div>

                {/* 라디오 모달 */}
                <div
                    className={`absolute transition-all duration-700 ease-in-out ${
                        step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                >
                    <div className="bg-[#1B1C21] rounded-xl mx-auto flex flex-col gap-1 w-[340px] transition-all duration-500">
                        <div className="p-4">
                            <h2 className="font-bold text-right text-[#02F5D0] text-[24px]">KOREA F1 FANS</h2>
                            <div className="flex justify-end items-center gap-2">
                                <Image src="/icons/mercedes-logo.svg" alt="Mercedes Logo" width={24} height={24} />
                                <span className="font-bold text-[30px] text-white">Radio</span>
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

                        <div className="p-4 pt-0">
                            <p
                                className="text-white text-[16px] text-left leading-relaxed"
                                style={{ textShadow: '0px 1px 3px rgba(104, 255, 249, 0.30)' }}
                            >
                                “WAITING FOR
                                <br/>TEAM ORDER”
                            </p>
                        </div>

                        <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out text-right px-4 ${
                                step === 2 ? 'max-h-16 pb-4' : 'max-h-0'
                            }`}
                        >
                            <p
                                className="text-[#02F5D0] text-[16px] font-normal leading-relaxed"
                                style={{ textShadow: '0px 0px 5px rgba(0, 161, 155, 0.70)' }}
                            >
                                “OK, COPY THAT”
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

IntroPage.hideLayout = true;

export default IntroPage;