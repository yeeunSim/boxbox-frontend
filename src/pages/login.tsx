// src/pages/login.tsx

import { useState, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ email, password });
    };

    return (
        <>
            <Head>
                <title>Login - Box Box</title>
            </Head>
            <main className="flex min-h-screen items-center justify-center bg-black font-['Formula1']">
                <div
                    className="relative flex h-screen w-full max-w-[430px] items-center justify-center bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/auth-bg.svg')" }}
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
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-white placeholder:text-gray-500 focus:border-[#02F5D0] focus:outline-none focus:ring-1 focus:ring-[#02F5D0]"
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Password"
                                    value={password}
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
        </>
    );
}

LoginPage.hideLayout = true;
