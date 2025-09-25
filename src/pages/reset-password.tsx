// src/pages/reset-password.tsx

import { useState, FormEvent, ChangeEvent, KeyboardEvent, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState('enterEmail');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleEmailSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Password reset request for:', email);
        setStep('verifyCode');
    };

    const handleCodeChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (/^[0-9]$/.test(value) || value === '') {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && code[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleCodeSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const finalCode = code.join('');
        console.log('Verification code:', finalCode);
        if (finalCode.length === 6) {
            setStep('resetPassword');
        } else {
            alert('Please enter the 6-digit code.');
        }
    };

    const handleResetSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        console.log('New password set for:', email);
        alert('Password has been reset successfully!');
        router.push('/login');
    };

    return (
        <>
            <Head>
                <title>Reset Password - Box Box</title>
            </Head>
            <main className="flex min-h-screen items-center justify-center bg-black font-['Formula1']">
                <div
                    className="relative flex h-screen w-full max-w-[430px] items-center justify-center bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/intro-bg.svg')" }}
                >
                    <div className="absolute inset-0 bg-black/70" />

                    {step === 'enterEmail' && (
                        <form
                            onSubmit={handleEmailSubmit}
                            className="relative w-full max-w-xs space-y-6 rounded-2xl bg-[#1B1C21] p-8 text-white"
                        >
                            <div className="text-left">
                                <h1 className="text-2xl font-bold">Forgot Password?</h1>
                                <p className="mt-2 text-xs">Join the pit wall and tune into Fan Radio!</p>
                            </div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-white placeholder:text-gray-500 focus:border-[#02F5D0] focus:outline-none focus:ring-1 focus:ring-[#02F5D0]"
                            />
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="h-12 w-full rounded-xl bg-[#02F5D0] text-base text-black transition hover:bg-opacity-80"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'verifyCode' && (
                        <form
                            onSubmit={handleCodeSubmit}
                            className="relative w-full max-w-xs space-y-6 rounded-2xl bg-[#1B1C21] p-6 text-white"
                        >
                            <div className="text-left">
                                <h1 className="text-2xl font-bold">Check Your Email</h1>
                                <p className="mt-2 text-xs">Join the pit wall and tune into Fan Radio!</p>
                            </div>
                            <div className="flex justify-center gap-1.5 sm:gap-2">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(e, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        className="h-10 w-10 rounded-lg border border-[#02F5D0] bg-[#18191B] text-center text-2xl text-white focus:border-[#02F5D0] focus:outline-none focus:ring-1 focus:ring-[#02F5D0]"
                                    />
                                ))}
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="h-12 w-full rounded-xl bg-[#02F5D0] text-base text-black transition hover:bg-opacity-80"
                                >
                                    Verify Code
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'resetPassword' && (
                        <form
                            onSubmit={handleResetSubmit}
                            className="relative w-full max-w-xs space-y-6 rounded-2xl bg-[#1B1C21] p-8 text-white"
                        >
                            <div className="text-left">
                                <h1 className="text-2xl font-bold">Reset Password</h1>
                                <p className="mt-2 text-xs">Join the pit wall and tune into Fan Radio!</p>
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="h-12 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-white placeholder:text-gray-500 focus:border-[#02F5D0] focus:outline-none focus:ring-1 focus:ring-[#02F5D0]"
                                />
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-12 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-white placeholder:text-gray-500 focus:border-[#02F5D0] focus:outline-none focus:ring-1 focus:ring-[#02F5D0]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <Image
                                            src={showPassword ? '/icons/pw-hide.svg' : '/icons/pw-show.svg'}
                                            alt="Toggle password visibility"
                                            width={20}
                                            height={20}
                                        />
                                    </button>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="h-12 w-full rounded-xl bg-[#02F5D0] text-base text-black transition hover:bg-opacity-80"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </>
    );
}

ForgotPasswordPage.hideLayout = true;
