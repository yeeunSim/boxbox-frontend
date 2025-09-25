// src/pages/sign-up.tsx

import { useState, FormEvent, ChangeEvent, Fragment } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Listbox, Transition } from '@headlessui/react';

const genderOptions = [
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
    { id: 'none', name: 'Prefer not to say' },
];

export default function SignUpPage() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        dateOfBirth: '',
    });

    const [selectedGender, setSelectedGender] = useState<{ id: string; name: string } | null>(null);

    const [agreements, setAgreements] = useState({
        all: false,
        required: false,
        optional: false,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    // 생년월일 자동 서식 변환 핸들러
    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 4) {
            value = value.slice(0, 4) + '.' + value.slice(4);
        }
        if (value.length > 7) {
            value = value.slice(0, 7) + '.' + value.slice(7, 9);
        }

        setFormData((prevState) => ({
            ...prevState,
            dateOfBirth: value,
        }));
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

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fullFormData = {
            ...formData,
            gender: selectedGender?.id || '',
            agreements,
        };
        console.log(fullFormData);
        setIsModalOpen(true);
    };

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
                    style={{ backgroundImage: "url('/images/intro-bg.svg')" }}
                >
                    <div className="absolute inset-0 bg-black/70" />
                    <form
                        onSubmit={handleSubmit}
                        className="relative w-full max-w-xs space-y-4 rounded-2xl bg-[#1B1C21] p-6 text-white"
                    >
                        <div className="text-center">
                            <h1 className="text-lg font-bold tracking-tight">SIGN UP</h1>
                            <p className="mt-1 text-[11px] text-gray-300">Join the pit wall and tune into Fan Radio!</p>
                        </div>
                        <div className="space-y-3">
                            {/* 이메일, 비밀번호, 닉네임 입력란 */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="email"
                                    required
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                                />
                                <button
                                    type="button"
                                    className="h-11 flex-shrink-0 rounded-xl bg-[#02F5D0] px-5 text-xs text-black transition hover:bg-opacity-80"
                                >
                                    VERIFY
                                </button>
                            </div>
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
                                placeholder="Date Of Birth (YYYY.MM.DD)"
                                value={formData.dateOfBirth}
                                onChange={handleDateChange}
                                maxLength={10}
                                className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                            />

                            {/* 성별 드롭다운 */}
                            <Listbox value={selectedGender} onChange={setSelectedGender}>
                                <div className="relative h-11">
                                    <Listbox.Button className="relative h-full w-full cursor-default rounded-xl border border-[#02F5D0] bg-transparent px-4 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                                        <span className={selectedGender ? 'text-white' : 'text-[#444D56]'}>
                                            {selectedGender ? selectedGender.name : 'Gender (Optional)'}
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                            <svg
                                                className="h-4 w-4 fill-current text-[#02F5D0]"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                            </svg>
                                        </span>
                                    </Listbox.Button>
                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-[#2a2b31] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                            {genderOptions.map((gender) => (
                                                <Listbox.Option
                                                    key={gender.id}
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                            active ? 'bg-[#02F5D0] text-black' : 'text-white'
                                                        }`
                                                    }
                                                    value={gender}
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${
                                                                    selected ? 'font-medium' : 'font-normal'
                                                                }`}
                                                            >
                                                                {gender.name}
                                                            </span>
                                                            {selected && (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                                                                    ✓
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
                        </div>

                        {/* 약관 동의 및 회원가입 버튼 */}
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

                    {/* 성공 모달 */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
                            <div className="flex w-full max-w-sm flex-col items-center space-y-6 rounded-2xl bg-[#18191B] p-8 text-center text-white">
                                <div>
                                    <h2 className="text-xl font-bold mb-2">Registration successful🎉</h2>
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
