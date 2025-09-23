// src/pages/sign-up.tsx

import { useState, FormEvent, ChangeEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function SignUpPage() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        dateOfBirth: '',
        gender: '',
    });

    const [agreements, setAgreements] = useState({
        all: false,
        required: false,
        optional: false,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleAgreementChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        if (name === 'all') {
            setAgreements({ all: checked, required: checked, optional: checked });
        } else {
            const newAgreements = { ...agreements, [name]: checked };
            const allChecked = newAgreements.required && newAgreements.optional;
            setAgreements({ ...newAgreements, all: allChecked });
        }
    };

    // 폼 제출 시 실행되는 함수
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ formData, agreements });

        setIsModalOpen(true);
    };

    // 'Login' 버튼 클릭 시 실행되는 함수
    const handleLoginRedirect = () => {
        router.push('/login');
    };

    const isPasswordMatching = formData.password && formData.password === formData.confirmPassword;

    return (
        <>
            <Head>
                <title>Sign Up - Box Box</title>
            </Head>
            <main className="flex min-h-screen items-center justify-center bg-black font-['Formula1']">
                <div
                    className="relative flex h-screen w-full max-w-[430px] items-center justify-center bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/auth-bg.svg')" }}
                >
                    <div className="absolute inset-0 bg-black/70" />

                    {/* 회원가입 폼 */}
                    <form
                        onSubmit={handleSubmit}
                        className="relative w-full max-w-xs space-y-4 rounded-2xl bg-[#1B1C21] p-6 text-white"
                    >
                        {/* 폼 내용은 이전과 동일 */}
                        <div className="text-center">
                            <h1 className="text-lg font-bold tracking-tight">SIGN UP</h1>
                            <p className="mt-1 text-[11px] text-gray-300">Join the pit wall and tune into Fan Radio!</p>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="email"
                                name="email"
                                placeholder="email"
                                required
                                onChange={handleChange}
                                className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                            />
                            <div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    required
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                                />
                                <p className="mt-1.5 pr-1 text-right text-[8px] text-gray-300">
                                    Password (8–12 characters, no -, ., /)
                                </p>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    required
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                                />
                                {isPasswordMatching && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-[#02F5D0]">
                                        ✓
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        name="nickname"
                                        placeholder="Nickname"
                                        maxLength={10}
                                        required
                                        onChange={handleChange}
                                        className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                        {formData.nickname.length} / 10
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="h-11 flex-shrink-0 rounded-xl bg-[#02F5D0] px-5 text-xs text-black transition hover:bg-opacity-80"
                                >
                                    VERIFY
                                </button>
                            </div>
                            <input
                                type="text"
                                name="dateOfBirth"
                                placeholder="Date Of Birth"
                                onChange={handleChange}
                                onFocus={(e) => (e.target.type = 'date')}
                                onBlur={(e) => (e.target.type = 'text')}
                                className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                            />
                            <div className="flex h-11 items-center justify-between rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-[#444D56]">
                                <label className="text-xs">
                                    Gender <span className="text-[10px]">( Optional )</span>
                                </label>
                                <div className="h-2.5 border-r border-[#02F5D0]"></div>
                                <select
                                    name="gender"
                                    onChange={handleChange}
                                    value={formData.gender}
                                    className="w-20 appearance-none bg-transparent text-center text-xs text-white focus:outline-none"
                                >
                                    <option value="" className="bg-[#1B1C21]"></option>
                                    <option value="male" className="bg-[#1B1C21]">
                                        Male
                                    </option>
                                    <option value="female" className="bg-[#1B1C21]">
                                        Female
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2.5 rounded-2xl border border-[#02F5D0] bg-[#18191B] p-3">
                            <label htmlFor="all" className="flex cursor-pointer items-center space-x-3 text-xs">
                                <input
                                    id="all"
                                    type="checkbox"
                                    name="all"
                                    checked={agreements.all}
                                    onChange={handleAgreementChange}
                                    className="peer sr-only"
                                />
                                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[#02F5D0] peer-checked:bg-[#02F5D0]">
                                    <svg
                                        className={`h-2.5 w-2.5 fill-current ${
                                            agreements.all ? 'text-black' : 'text-transparent'
                                        }`}
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                    </svg>
                                </div>
                                <span>아래 약관에 모두 동의합니다.</span>
                            </label>
                            <hr className="border-gray-700" />
                            <label htmlFor="required" className="flex cursor-pointer items-center space-x-3 text-xs">
                                <input
                                    id="required"
                                    type="checkbox"
                                    name="required"
                                    checked={agreements.required}
                                    onChange={handleAgreementChange}
                                    required
                                    className="peer sr-only"
                                />
                                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[#02F5D0] peer-checked:bg-[#02F5D0]">
                                    <svg
                                        className={`h-2.5 w-2.5 fill-current ${
                                            agreements.required ? 'text-black' : 'text-transparent'
                                        }`}
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                    </svg>
                                </div>
                                <span>[필수] 개인정보 수집 및 이용 동의</span>
                            </label>
                            <label htmlFor="optional" className="flex cursor-pointer items-center space-x-3 text-xs">
                                <input
                                    id="optional"
                                    type="checkbox"
                                    name="optional"
                                    checked={agreements.optional}
                                    onChange={handleAgreementChange}
                                    className="peer sr-only"
                                />
                                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[#02F5D0] peer-checked:bg-[#02F5D0]">
                                    <svg
                                        className={`h-2.5 w-2.5 fill-current ${
                                            agreements.optional ? 'text-black' : 'text-transparent'
                                        }`}
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                    </svg>
                                </div>
                                <span>[선택] 개인정보 수집 및 이용 동의</span>
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="h-11 w-full rounded-xl bg-[#02F5D0] text-sm text-black transition hover:bg-opacity-80"
                        >
                            Register
                        </button>
                    </form>

                    {/* 성공 모달 UI */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
                            <div className="flex w-full max-w-sm flex-col items-center space-y-6 rounded-2xl bg-[#18191B] p-8 text-center text-white">
                                <div>
                                    {' '}
                                    <h2 className="text-xl font-bold mb-2">Registration successful 🎉</h2>
                                    <p className="text-gray-300">Please log in to continue!</p>
                                </div>
                                <button
                                    onClick={handleLoginRedirect}
                                    className="h-12 w-full max-w-xs rounded-xl bg-[#02F5D0] text-black transition hover:bg-opacity-80"
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

SignUpPage.hideLayout = true;
