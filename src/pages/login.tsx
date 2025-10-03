// src/pages/login.tsx

import { useState, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/Modal';

import { AxiosError } from 'axios';
import { useRouter } from 'next/router';

import { loginAPI } from '@/apis/loginAPI';
import { useAuthStore, User } from '../../store/authStore';
//import { fanRadioAPI } from '@/apis/fanradioAPI';

export default function LoginPage() {
    const router = useRouter();

    const [loginEmail, setEmail] = useState('');
    const [loginPw, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    type ApiError = { code?: string; message?: string };
    type LoginRes = { accessToken: string; user: User };

    const [isModalOpen, setModalOpen] = useState(false);
    const [modalMsg, setModalMsg] = useState<string>('');
    const [modalTitle, setModalTitle] = useState<string>('Login Failed');
    const [secondaryText, setSecondaryText] = useState<string | undefined>(undefined);
    const [onSecondary, setOnSecondary] = useState<(() => void) | undefined>(undefined);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await loginAPI.login({ loginEmail, loginPw });
            const data: LoginRes = res.data;
            const { accessToken, user } = data;

            useAuthStore.getState().login({ user, accessToken });

            router.replace('/');
        } catch (e: unknown) {
            const ax = e as AxiosError<ApiError>;
            const code = ax.response?.data?.code;
            const msg = ax.response?.data?.message ?? ax.message ?? '로그인 중 오류가 발생했어요.';

            if (code === 'USER_NOT_FOUND' || ax.response?.status === 404) {
                setModalTitle('Account not found');
                setModalMsg('해당 이메일로 가입된 계정을 찾을 수 없어요. 회원가입을 진행해 주세요.');
                setSecondaryText('Go to Sign up');
                setOnSecondary(() => () => router.push('/sign-up'));
            } else {
                setModalTitle('Login Failed');
                setModalMsg(msg ?? '로그인 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
                setSecondaryText(undefined);
                setOnSecondary(undefined);
            }

            setModalOpen(true);
        }
    };

    return (
        <>
            <Head>
                <title>Login - Box Box</title>
            </Head>
            <main className="flex min-h-screen items-center justify-center bg-black font-['Formula1']">
                <div
                    className="relative flex h-screen w-full max-w-[430px] items-center justify-center bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/intro-bg.svg')" }}
                >
                    <div className="absolute inset-0 bg-black/70" />

                    <form
                        onSubmit={handleSubmit}
                        className="relative w-full max-w-xs space-y-6 rounded-2xl bg-[#1B1C21] p-8 text-white"
                    >
                        <div className="text-left">
                            <h1 className="text-2xl font-bold">Login</h1>
                            <p className="mt-2 text-xs">Join the pit wall and tune into Fan Radio!</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={loginEmail}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-white placeholder:text-gray-500 focus:border-[#02F5D0] focus:outline-none focus:ring-1 focus:ring-[#02F5D0]"
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Password"
                                    value={loginPw}
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
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
                            <div className="text-left text-xs">
                                <Link href="/reset-password">
                                    <span className="text-sm text-[#02F5D0] hover:brightness-75">Forgot Password?</span>
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <button
                                type="submit"
                                className="h-12 w-full rounded-xl bg-[#02F5D0] text-base text-black transition hover:bg-opacity-80"
                            >
                                Login
                            </button>
                            <div className="text-center text-xs text-gray-500">
                                {"Don't have an account?"}{' '}
                                <Link href="/sign-up">
                                    <span className=" text-[#02F5D0] hover:brightness-75">Sign up</span>
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </main>

            <Modal
                isOpen={isModalOpen}
                title={modalTitle}
                message={modalMsg}
                primaryText="OK"
                onPrimary={() => setModalOpen(false)}
                secondaryText={secondaryText}
                onSecondary={onSecondary}
            />
        </>
    );
}

LoginPage.hideLayout = true;
