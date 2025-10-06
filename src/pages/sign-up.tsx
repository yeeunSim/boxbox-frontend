import { useState, FormEvent, ChangeEvent, Fragment } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Listbox, Transition } from '@headlessui/react';
import Link from 'next/link';
import { signUpAPI, verifyAPI } from '@/apis/loginAPI';
import axios, { type AxiosError } from 'axios';

type ApiErrorBody = { message?: string };

const genderOptions = [
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
    { id: 'none', name: 'Prefer not to say' },
];

export default function SignUpPage() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [emailVerifying, setEmailVerifying] = useState(false);
    const [emailVerified, setEmailVerified] = useState<null | boolean>(null);
    const [nickVerifying, setNickVerifying] = useState(false);
    const [nickVerified, setNickVerified] = useState<null | boolean>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 상태추가
    const [showRequiredModal, setShowRequiredModal] = useState(false);
    const [showOptionalModal, setShowOptionalModal] = useState(false);
    const [agreementTrigger, setAgreementTrigger] = useState<null | 'all' | 'required' | 'optional'>(null);

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
        setFormData((prev) => ({ ...prev, [name]: value }));
        // 입력 바뀔 때 이전 검증표시 리셋(선택)
        if (name === 'email') setEmailVerified(null);
        if (name === 'nickname') setNickVerified(null);
    };

    // 생년월일 자동 서식 변환
    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4) + '.' + value.slice(4);
        if (value.length > 7) value = value.slice(0, 7) + '.' + value.slice(7, 9);
        setFormData((prev) => ({ ...prev, dateOfBirth: value }));
    };

    // 버그수정 추가
    const handleAgreementClick = (e: React.MouseEvent<HTMLLabelElement>, name: 'all' | 'required' | 'optional') => {
        // 기본 체크박스 동작을 막기
        e.preventDefault();
        const isCurrentlyChecked = agreements[name];

        // 이미 체크된 항목을 다시 클릭하면 체크를 해제
        if (isCurrentlyChecked) {
            if (name === 'all') {
                setAgreements({ all: false, required: false, optional: false });
            } else {
                setAgreements((prev) => ({ ...prev, [name]: false, all: false }));
            }
        } else {
            // 체크되지 않은 항목을 클릭하면 모달 플로우를 시작
            setAgreementTrigger(name); // 어떤 버튼으로 시작했는지 기억
            setShowRequiredModal(true); // 필수 모달
        }
    };

    // 필수 약관 모달의 '확인' 버튼을 눌렀을 때 실행
    const handleRequiredAgree = () => {
        setShowRequiredModal(false); // 필수 모달을 닫고
        setShowOptionalModal(true); // 선택 모달
    };

    // 선택 약관 모달의 '확인' 버튼을 눌렀을 때 실행
    const handleOptionalAgree = () => {
        setShowOptionalModal(false); // 선택 모달을 닫기

        // 어떤 버튼으로 플로우를 시작했는지에 따라 state를 업데이트
        if (agreementTrigger) {
            if (agreementTrigger === 'all') {
                setAgreements({ all: true, required: true, optional: true });
            } else if (agreementTrigger === 'required') {
                setAgreements((prev) => ({ ...prev, required: true, all: prev.optional && true }));
            } else if (agreementTrigger === 'optional') {
                setAgreements((prev) => ({ ...prev, optional: true, all: prev.required && true }));
            }
        }
        setAgreementTrigger(null); // 트리거 상태를 초기화
    };

    // 모달 바깥의 어두운 영역을 클릭했을 때 모든 모달을 닫기
    const closeAllModalsAndReset = () => {
        setShowRequiredModal(false);
        setShowOptionalModal(false);
        setAgreementTrigger(null);
    };

    // 이메일 중복확인
    const handleEmailVerify = async () => {
        const email = formData.email?.trim();
        if (!email) return alert('이메일을 입력해 주세요.');

        try {
            setEmailVerifying(true);
            setEmailVerified(null);

            await verifyAPI.checkEmailAvailable(email); // 2xx => 사용 가능
            setEmailVerified(true);
            alert('사용 가능한 이메일입니다.');
        } catch (err) {
            if (axios.isAxiosError<ApiErrorBody>(err)) {
                const status = err.response?.status;
                const msg = err.response?.data?.message;

                if (status === 409) {
                    setEmailVerified(false);
                    alert('이미 사용 중인 이메일입니다.');
                } else if (status === 400) {
                    setEmailVerified(false);
                    alert('형식이 맞지 않는 이메일입니다.');
                } else {
                    setEmailVerified(false);
                    alert(msg || '이메일 확인 중 오류가 발생했어요.');
                }
            } else {
                // Axios 외 에러
                setEmailVerified(false);
                alert('알 수 없는 오류가 발생했어요.');
            }
        } finally {
            setEmailVerifying(false);
        }
    };

    // 닉네임 중복확인
    const handleNicknameVerify = async () => {
        const nickname = formData.nickname?.trim();
        if (!nickname) return alert('닉네임을 입력해 주세요.');

        try {
            setNickVerifying(true);
            setNickVerified(null);

            await verifyAPI.checkNicknameAvailable(nickname); // 2xx => 사용 가능
            setNickVerified(true);
            alert('사용 가능한 닉네임입니다.');
        } catch (err) {
            if (axios.isAxiosError<ApiErrorBody>(err)) {
                const status = err.response?.status;
                const msg = err.response?.data?.message;

                if (status === 409) {
                    setNickVerified(false);
                    alert('이미 사용 중인 닉네임입니다.');
                } else if (status === 400) {
                    setNickVerified(false);
                    alert('형식이 맞지 않는 닉네임입니다.');
                } else {
                    setNickVerified(false);
                    alert(msg || '닉네임 확인 중 오류가 발생했어요.');
                }
            } else {
                // Axios 외 에러
                setNickVerified(false);
                alert('알 수 없는 오류가 발생했어요.');
            }
        } finally {
            setNickVerifying(false);
        }
    };

    // 비밀번호 규칙 검증 (8–12, - . / 금지)
    const isValidPassword = (pw: string) => {
        if (pw.length < 8 || pw.length > 12) return false;
        if (/[./-]/.test(pw)) return false;
        return true;
    };

    const mapGender = (id?: string): 'M' | 'F' | 'N' | '' => {
        if (id === 'male') return 'M';
        if (id === 'female') return 'F';
        if (id === 'none') return 'N';
        return '';
    };

    const toApiBirth = (dob: string) => dob.replaceAll('.', '-'); // "YYYY.MM.DD" -> "YYYY-MM-DD"

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (emailVerified !== true) return alert('이메일 중복확인을 완료해 주세요.');
        if (nickVerified !== true) return alert('닉네임 중복확인을 완료해 주세요.');

        if (formData.password !== formData.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!isValidPassword(formData.password)) {
            alert('비밀번호는 8–12자이며 -, ., / 문자를 포함할 수 없습니다.');
            return;
        }
        if (!agreements.required) {
            alert('필수 약관에 동의해 주세요.');
            return;
        }

        const payload = {
            loginEmail: formData.email,
            loginPw: formData.password,
            userNickname: formData.nickname,

            // 값이 있을 때만 포맷을 변경하고, 없으면 null을 전송
            userBirth: formData.dateOfBirth ? toApiBirth(formData.dateOfBirth) : null,
            userGender: mapGender(selectedGender?.id) || null,

            svcUsePcyAgmtYn: agreements.required ? 'Y' : 'N',
            psInfoProcAgmtYn: agreements.optional ? 'Y' : 0,
        } as const;

        try {
            setSubmitting(true);
            await signUpAPI.register(payload);
            setIsModalOpen(true);
        } catch (err) {
            const axiosErr = err as AxiosError<ApiErrorBody>;
            const msg =
                axiosErr.response?.data?.message ??
                axiosErr.message ??
                '회원가입 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLoginRedirect = () => router.push('/login');

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
                        <Link href="/" passHref>
                            <button
                                type="button"
                                aria-label="Close"
                                className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-white"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </Link>
                        <div className="text-center">
                            <h1 className="text-lg font-bold tracking-tight">SIGN UP</h1>
                            <p className="mt-1 text-[11px] text-gray-300">Join the pit wall and tune into Fan Radio!</p>
                        </div>
                        <div className="space-y-3">
                            {/* 이메일 */}
                            <div className="flex items-center gap-2">
                                <div className="relative w-full">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="email"
                                        required
                                        onChange={handleChange}
                                        className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                                    />
                                    {emailVerified === true && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#02F5D0]">
                                            ✓
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleEmailVerify}
                                    disabled={emailVerifying || !formData.email}
                                    className="h-11 flex-shrink-0 rounded-xl bg-[#02F5D0] px-5 text-xs text-black transition hover:bg-opacity-80 disabled:opacity-60"
                                >
                                    {emailVerifying ? 'CHECKING…' : emailVerified === true ? 'OK' : 'VERIFY'}
                                </button>
                            </div>

                            {/* 비밀번호 */}
                            <div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Password"
                                        required
                                        onChange={handleChange}
                                        className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 pr-10 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        aria-label="Toggle password visibility"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-5 w-5 text-white"
                                        >
                                            {showPassword ? (
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243"
                                                />
                                            ) : (
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            )}
                                        </svg>
                                    </button>
                                </div>
                                <p className="mt-1.5 pr-1 text-right text-[8px] text-gray-300">
                                    Password (8–12 characters, no -, ., /)
                                </p>
                            </div>

                            {/* 비밀번호 확인 */}
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    required
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 pr-16 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                                />
                                {/* 불일치 X 아이콘 */}
                                {isPasswordMatching ? (
                                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-base text-[#02F5D0]">
                                        ✓
                                    </span>
                                ) : formData.confirmPassword ? (
                                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-base text-red-600">
                                        X
                                    </span>
                                ) : null}

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    aria-label="Toggle confirm password visibility"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-5 w-5 text-white"
                                    >
                                        {showConfirmPassword ? (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243"
                                            />
                                        ) : (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        )}
                                    </svg>
                                </button>
                            </div>

                            {/* 닉네임 */}
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
                                    <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                        {formData.nickname.length} / 10
                                    </span>
                                    {nickVerified === true && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#02F5D0]">
                                            ✓
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNicknameVerify}
                                    disabled={nickVerifying || !formData.nickname}
                                    className="h-11 flex-shrink-0 rounded-xl bg-[#02F5D0] px-5 text-xs text-black transition hover:bg-opacity-80 disabled:opacity-60"
                                >
                                    {nickVerifying ? 'CHECKING…' : nickVerified === true ? 'OK' : 'VERIFY'}
                                </button>
                            </div>

                            {/* 생년월일 */}
                            <input
                                type="text"
                                name="dateOfBirth"
                                placeholder="Date Of Birth (YYYY.MM.DD)"
                                value={formData.dateOfBirth}
                                onChange={handleDateChange}
                                maxLength={10}
                                className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                            />

                            {/* 성별 */}
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
                        {/* 약관 */}ㄴ
                        <div className="space-y-2.5 rounded-2xl border border-[#02F5D0] bg-[#18191B] p-3">
                            <label
                                onClick={(e) => handleAgreementClick(e, 'all')}
                                className="flex cursor-pointer items-center space-x-3 text-xs"
                            >
                                <input
                                    type="checkbox"
                                    name="all"
                                    checked={agreements.all}
                                    readOnly
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
                            <label
                                onClick={(e) => handleAgreementClick(e, 'required')}
                                className="flex cursor-pointer items-center space-x-3 text-xs"
                            >
                                <input
                                    type="checkbox"
                                    name="required"
                                    checked={agreements.required}
                                    readOnly
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
                            <label
                                onClick={(e) => handleAgreementClick(e, 'optional')}
                                className="flex cursor-pointer items-center space-x-3 text-xs"
                            >
                                <input
                                    type="checkbox"
                                    name="optional"
                                    checked={agreements.optional}
                                    readOnly
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
                            disabled={submitting}
                            className="h-11 w-full rounded-xl bg-[#02F5D0] text-sm text-black transition hover:bg-opacity-80 disabled:opacity-60"
                        >
                            {submitting ? 'Registering…' : 'Register'}
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
                    {/* --- 필수 약관 모달 --- */}
                    {showRequiredModal && (
                        <div
                            className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
                            onClick={closeAllModalsAndReset}
                        >
                            <div
                                className="flex w-full max-w-sm flex-col space-y-4 rounded-2xl bg-[#18191B] p-6 text-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-lg font-bold text-center">개인정보 수집·이용 동의 (필수)</h2>
                                <div className="max-h-60 space-y-2 overflow-y-auto pr-2 text-xs text-gray-300">
                                    <p>
                                        서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다. 내용을 확인하시고
                                        동의 여부를 선택해주세요.
                                    </p>
                                    <ul className="list-disc space-y-1 pl-4">
                                        <li>수집·이용자(처리자): 피트스탑(pitstop_dev)</li>
                                        <li>
                                            수집 목적: 서비스 제공 및 운영, 회원 식별·인증, 이용자 문의 대응, 서비스
                                            고도화를 위한 통계·분석(국내 F1 팬덤 규모 예측 포함, 개인 식별이 불가능한
                                            형태로 처리)
                                        </li>
                                        <li>
                                            수집 항목:
                                            <ul className="list-['-_'] space-y-1 pl-4">
                                                <li>필수: 이메일, 비밀번호(암호화 저장), 생년월일</li>
                                                <li>선택: 성별, 닉네임(사용시)</li>
                                            </ul>
                                        </li>
                                        <li>
                                            보유·이용기간: 수집일로부터 365일 또는 회원 탈퇴·목적 달성 시까지 중 먼저
                                            도래하는 시점까지 보관하며, 관계 법령에 따른 보존 의무가 있는 경우 해당 기간
                                            동안 별도 보관 후 지체 없이 파기합니다.
                                        </li>
                                        <li>국외 이전: 해당 없음(필요 시 사전 고지 및 별도 동의)</li>
                                    </ul>
                                    <p>
                                        ※ 귀하는 개인정보 수집·이용에 동의하지 않을 권리가 있습니다. 다만 동의하지 않을
                                        경우 <strong>서비스 이용(회원가입 및 로그인 등)</strong>이 제한될 수 있습니다.
                                    </p>
                                </div>
                                <button
                                    onClick={handleRequiredAgree}
                                    className="h-11 w-full rounded-xl bg-[#02F5D0] text-sm text-black transition hover:bg-opacity-80"
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- 선택 약관 모달 --- */}
                    {showOptionalModal && (
                        <div
                            className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
                            onClick={closeAllModalsAndReset}
                        >
                            <div
                                className="flex w-full max-w-sm flex-col space-y-4 rounded-2xl bg-[#18191B] p-6 text-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-lg font-bold text-center">
                                    (선택) 가명·통계 데이터 외부 공유 동의
                                </h2>
                                <div className="max-h-60 space-y-2 overflow-y-auto pr-2 text-xs text-gray-300">
                                    <p>
                                        국내 F1 관련 행사 기획 및 팬덤 규모 예측을 위해, 아래와 같이 개인 식별이
                                        불가능한 형태의 정보를 외부에 제공할 수 있습니다. 내용을 확인하시고 동의 여부를
                                        선택해주세요.
                                    </p>
                                    <ul className="list-disc space-y-1 pl-4">
                                        <li>
                                            제공받는 자의 범위: 국내 F1 관련 행사 주최·운영사 및 그 파트너(최신 목록은
                                            당사 홈페이지의 ‘협력사 안내’ 페이지에서 고지)
                                        </li>
                                        <li>
                                            제공 목적: 행사 수요 예측, 운영 계획 수립, 팬덤 규모·트렌드 분석 등
                                            통계·연구 목적
                                        </li>
                                        <li>
                                            제공 항목: 가명 처리 또는 집계·통계 형태의 정보(예: 연령대/성별 비율, 관심사
                                            분포, 기능 이용 통계 등)
                                        </li>
                                        <li>
                                            제공 제외: 이메일, 비밀번호, 생년월일 등 개인을 직접 식별할 수 있는 정보는
                                            제공하지 않습니다.
                                        </li>
                                        <li>
                                            보유·이용기간(제공받는 자 기준): 제공일로부터 365일 또는 목적 달성 시까지 중
                                            먼저 도래하는 시점까지 보관 후 지체 없이 파기
                                        </li>
                                        <li>국외 이전: 해당 없음(필요 시 사전 고지 및 별도 동의)</li>
                                    </ul>
                                    <p>
                                        ※ 본 동의는 선택사항이며, 동의하지 않아도 기본 서비스 이용에는 영향이 없습니다.
                                    </p>
                                </div>
                                <button
                                    onClick={handleOptionalAgree}
                                    className="h-11 w-full rounded-xl bg-[#02F5D0] text-sm text-black transition hover:bg-opacity-80"
                                >
                                    확인
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
