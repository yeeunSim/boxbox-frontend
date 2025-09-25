import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

const IntroPage = () => {
    const [step, setStep] = useState(0);
    const router = useRouter();

    useEffect(() => {
        // 1.5초 후에 모달 등장
        const timer1 = setTimeout(() => setStep(1), 1500);
        // 3초 후에 모달 확장
        const timer2 = setTimeout(() => setStep(2), 3000);
        // 4.5초 후에 홈 화면으로 이동
        const timer3 = setTimeout(() => router.push('/'), 4500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [router]);

    return (
        <div className="min-h-screen w-full bg-[#191922]">
            <main
                className="relative flex h-screen w-full max-w-[430px] mx-auto flex-col items-center justify-center bg-black font-['Formula1'] bg-center bg-cover"
                style={{ backgroundImage: "url('/images/intro-bg.svg')" }}
            >
                <div
                    className={`absolute inset-0 bg-black/70 transition-opacity duration-700 ${
                        step >= 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                />

                {/* 음표 아이콘  */}
                <div className={`transition-opacity duration-500 ${step === 0 ? 'opacity-100' : 'opacity-0'}`}>
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
                                “WATING FOR
                                <br />
                                TEAM ORDER”
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
