import { useState, FormEvent, ChangeEvent, Fragment, ReactNode, useEffect } from 'react';
// import Head from 'next/head'; // Replaced with useEffect for compatibility
// import { useRouter } from 'next/router'; // Replaced for compatibility
import { Listbox, Transition } from '@headlessui/react';
// import Link from 'next/link'; // Replaced with <a> for compatibility
// import { signUpAPI, verifyAPI } from '@/apis/loginAPI'; // Mocked for compatibility
import axios, { type AxiosError } from 'axios';

type ApiErrorBody = { message?: string };

// --- Mock API for demonstration ---
const mockApi = (shouldSucceed = true, delay = 500, status = 200, message = 'Success') => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldSucceed) {
                resolve({ data: { message } });
            } else {
                const error = new Error(message) as AxiosError<ApiErrorBody>;
                error.isAxiosError = true;
                error.response = {
                    data: { message },
                    status,
                    statusText: 'Error',
                    headers: {},
                    config: {} as any,
                };
                reject(error);
            }
        }, delay);
    });
};

const verifyAPI = {
    checkEmailAvailable: async (email: string) => {
        if (email.includes('taken')) return mockApi(false, 500, 409, '이미 사용 중인 이메일입니다.');
        if (!email.includes('@')) return mockApi(false, 500, 400, '형식이 맞지 않는 이메일입니다.');
        return mockApi(true, 500, 200, '사용 가능한 이메일입니다.');
    },
    checkNicknameAvailable: async (nickname: string) => {
        if (nickname.includes('taken')) return mockApi(false, 500, 409, '이미 사용 중인 닉네임입니다.');
        if (nickname.length < 2) return mockApi(false, 500, 400, '형식이 맞지 않는 닉네임입니다.');
        return mockApi(true, 500, 200, '사용 가능한 닉네임입니다.');
    },
};

const signUpAPI = {
    register: async (payload: any) => mockApi(true, 1000),
};
// --- End of Mock API ---

const genderOptions = [
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
    { id: 'none', name: 'Prefer not to say' },
];

const RequiredAgreementContent = () => (
    <div className="space-y-3 text-sm text-gray-300">
        <p>서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다. 내용을 확인하시고 동의 여부를 선택해주세요.</p>
        <ul className="list-disc space-y-2 pl-5 text-xs">
            <li>
                <strong>수집·이용자(처리자):</strong> 피트스탑(pitstop_dev)
            </li>
            <li>
                <strong>수집 목적:</strong> 서비스 제공 및 운영, 회원 식별·인증, 이용자 문의 대응, 서비스 고도화를 위한
                통계·분석(국내 F1 팬덤 규모 예측 포함, 개인 식별이 불가능한 형태로 처리)
            </li>
            <li>
                <strong>수집 항목:</strong>
                <ul className="list-['-_'] space-y-1 pl-4">
                    <li>필수: 이메일, 비밀번호(암호화 저장), 생년월일</li>
                    <li>선택: 성별, 닉네임(사용시)</li>
                </ul>
            </li>
            <li>
                <strong>보유·이용기간:</strong> 수집일로부터 365일 또는 회원 탈퇴·목적 달성 시까지 중 먼저 도래하는
                시점까지 보관하며, 관계 법령에 따른 보존의무가 있는 경우 해당 기간 동안 별도 보관 후 지체없이
                파기합니다.
            </li>
            <li>
                <strong>국외 이전:</strong> 해당 없음(필요 시 사전 고지 및 별도 동의)
            </li>
        </ul>
        <p className="pt-2 text-xs font-semibold">
            ※ 귀하는 개인정보 수집·이용에 동의하지 않을 권리가 있습니다. 다만 동의하지 않을 경우{' '}
            <strong className="text-[#02F5D0]">서비스 이용(회원가입 및 로그인 등)</strong>이 제한될 수 있습니다.
        </p>
    </div>
);

const OptionalAgreementContent = () => (
    <div className="space-y-3 text-sm text-gray-300">
        <p>
            국내 F1 관련 행사 기획 및 팬덤 규모 예측을 위해, 아래와 같이 개인 식별이 불가능한 형태의 정보를 외부에
            제공할 수 있습니다. 내용을 확인하시고 동의 여부를 선택해주세요.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-xs">
            <li>
                <strong>제공받는 자의 범위:</strong> 국내 F1 관련 행사 주최·운영사 및 그 파트너(최신 목록은 당사
                홈페이지의 ‘협력사 안내’ 페이지에서 고지)
            </li>
            <li>
                <strong>제공 목적:</strong> 행사 수요 예측, 운영 계획 수립, 팬덤 규모·트렌드 분석 등 통계·연구 목적
            </li>
            <li>
                <strong>제공 항목:</strong> 가명처리 또는 집계·통계 형태의 정보(예: 연령대/성별 비율, 관심사 분포, 기능
                이용 통계 등)
            </li>
            <li>
                <strong>제공 제외:</strong> 이메일, 비밀번호, 생년월일 등 개인을 직접 식별할 수 있는 정보는 제공하지
                않습니다.
            </li>
            <li>
                <strong>보유·이용기간(제공받는 자 기준):</strong> 제공일로부터 365일 또는 목적 달성 시까지 중 먼저
                도래하는 시점까지 보관 후 지체없이 파기
            </li>
            <li>
                <strong>국외 이전:</strong> 해당 없음(필요 시 사전 고지 및 별도 동의)
            </li>
        </ul>
        <p className="pt-2 text-xs font-semibold">
            ※ 본 동의는 선택사항이며, 동의하지 않아도 기본 서비스 이용에는 영향이 없습니다.
        </p>
    </div>
);

export default function SignUpPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [emailVerifying, setEmailVerifying] = useState(false);
    const [emailVerified, setEmailVerified] = useState<null | boolean>(null);
    const [nickVerifying, setNickVerifying] = useState(false);
    const [nickVerified, setNickVerified] = useState<null | boolean>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        dateOfBirth: '',
    });
    const [selectedGender, setSelectedGender] = useState<{ id: string; name: string } | null>(null);
    const [agreements, setAgreements] = useState({ all: false, required: false, optional: false });
    const [modalContent, setModalContent] = useState<{ title: string; content: ReactNode } | null>(null);
    const [actionAfterModal, setActionAfterModal] = useState<(() => void) | null>(null);
    const [viewedAgreements, setViewedAgreements] = useState({ required: false, optional: false });

    useEffect(() => {
        document.title = 'Sign Up - Box Box';
    }, []);

    useEffect(() => {
        const allShouldBeChecked = agreements.required && agreements.optional;
        if (agreements.all !== allShouldBeChecked) {
            setAgreements((prev) => ({ ...prev, all: allShouldBeChecked }));
        }
    }, [agreements.required, agreements.optional]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'email') setEmailVerified(null);
        if (name === 'nickname') setNickVerified(null);
    };

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4) + '.' + value.slice(4);
        if (value.length > 7) value = value.slice(0, 7) + '.' + value.slice(7, 9);
        setFormData((prev) => ({ ...prev, dateOfBirth: value }));
    };

    const handleEmailVerify = async () => {
        const email = formData.email?.trim();
        if (!email) return alert('이메일을 입력해 주세요.');
        setEmailVerifying(true);
        setEmailVerified(null);
        try {
            await verifyAPI.checkEmailAvailable(email);
            setEmailVerified(true);
            alert('사용 가능한 이메일입니다.');
        } catch (err) {
            if (axios.isAxiosError<ApiErrorBody>(err)) {
                const msg = err.response?.data?.message;
                setEmailVerified(false);
                alert(msg || '이메일 확인 중 오류가 발생했어요.');
            } else {
                setEmailVerified(false);
                alert('알 수 없는 오류가 발생했어요.');
            }
        } finally {
            setEmailVerifying(false);
        }
    };

    const handleNicknameVerify = async () => {
        const nickname = formData.nickname?.trim();
        if (!nickname) return alert('닉네임을 입력해 주세요.');
        setNickVerifying(true);
        setNickVerified(null);
        try {
            await verifyAPI.checkNicknameAvailable(nickname);
            setNickVerified(true);
            alert('사용 가능한 닉네임입니다.');
        } catch (err) {
            if (axios.isAxiosError<ApiErrorBody>(err)) {
                const msg = err.response?.data?.message;
                setNickVerified(false);
                alert(msg || '닉네임 확인 중 오류가 발생했어요.');
            } else {
                setNickVerified(false);
                alert('알 수 없는 오류가 발생했어요.');
            }
        } finally {
            setNickVerifying(false);
        }
    };

    const showAgreementModal = (type: 'required' | 'optional', onConfirm?: () => void) => {
        const content = type === 'required' ? <RequiredAgreementContent /> : <OptionalAgreementContent />;
        const title = type === 'required' ? '개인정보 수집·이용 동의 (필수)' : '(선택) 가명·통계데이터 외부 공유 동의';
        setViewedAgreements((prev) => ({ ...prev, [type]: true }));
        if (onConfirm) {
            setActionAfterModal(() => () => onConfirm());
        }
        setModalContent({ title, content });
    };

    const handleAgreementAreaClick = (type: 'all' | 'required' | 'optional') => {
        const targetState = !agreements[type];

        if (!targetState) {
            if (type === 'all') setAgreements({ all: false, required: false, optional: false });
            else setAgreements((prev) => ({ ...prev, [type]: false }));
            return;
        }

        const actions = {
            all: () => setAgreements({ all: true, required: true, optional: true }),
            required: () => setAgreements((prev) => ({ ...prev, required: true })),
            optional: () => setAgreements((prev) => ({ ...prev, optional: true })),
        };

        const finalAction = actions[type];
        const modalsToView: ('required' | 'optional')[] = [];

        if (type === 'all' || (type === 'required' && !agreements.required)) {
            if (!viewedAgreements.required) modalsToView.push('required');
            if (!viewedAgreements.optional) modalsToView.push('optional');
        } else if (type === 'optional' && !agreements.optional) {
            if (!viewedAgreements.optional) modalsToView.push('optional');
        }

        const processModalQueue = () => {
            if (modalsToView.length === 0) {
                finalAction();
                return;
            }
            const nextModal = modalsToView.shift();
            if (nextModal) {
                showAgreementModal(nextModal, processModalQueue);
            }
        };
        processModalQueue();
    };

    const handleModalConfirm = () => {
        setModalContent(null);
        if (actionAfterModal) {
            actionAfterModal();
            setActionAfterModal(null);
        }
    };

    const isValidPassword = (pw: string) => pw.length >= 8 && pw.length <= 12 && !/[./-]/.test(pw);
    const mapGender = (id?: string): 'M' | 'F' | 'N' | '' =>
        id === 'male' ? 'M' : id === 'female' ? 'F' : id === 'none' ? 'N' : '';
    const toApiBirth = (dob: string) => dob.replaceAll('.', '-');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!viewedAgreements.required || !viewedAgreements.optional) {
            alert('필수 및 선택 약관의 내용을 모두 확인해주세요.');
            return;
        }
        if (emailVerified !== true) return alert('이메일 중복확인을 완료해 주세요.');
        if (nickVerified !== true) return alert('닉네임 중복확인을 완료해 주세요.');
        if (formData.password !== formData.confirmPassword) return alert('비밀번호가 일치하지 않습니다.');
        if (!isValidPassword(formData.password))
            return alert('비밀번호는 8–12자이며 -, ., / 문자를 포함할 수 없습니다.');
        if (!agreements.required) return alert('필수 약관에 동의해 주세요.');

        const payload = {
            loginEmail: formData.email,
            loginPw: formData.password,
            userNickname: formData.nickname,
            userBirth: toApiBirth(formData.dateOfBirth),
            userGender: mapGender(selectedGender?.id),
            svcUsePcyAgmtYn: agreements.required ? 'Y' : 'N',
            psInfoProcAgmtYn: agreements.optional ? 'Y' : 'N',
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

    const handleLoginRedirect = () => {
        window.location.href = '/login';
    };
    const isPasswordMatching = formData.password && formData.password === formData.confirmPassword;

    return (
        <>
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
                        <a href="/" className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-white">
                            <button type="button" aria-label="Close">
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
                        </a>

                        <div className="text-center">
                            <h1 className="text-lg font-bold tracking-tight">SIGN UP</h1>
                            <p className="mt-1 text-[11px] text-gray-300">Join the pit wall and tune into Fan Radio!</p>
                        </div>

                        <div className="space-y-3">
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
                                    {emailVerified && (
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
                                    {emailVerifying ? 'CHECKING…' : emailVerified ? 'OK' : 'VERIFY'}
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
                                    <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                        {formData.nickname.length} / 10
                                    </span>
                                    {nickVerified && (
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
                                    {nickVerifying ? 'CHECKING…' : nickVerified ? 'OK' : 'VERIFY'}
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

                        <div className="space-y-1 rounded-2xl border border-[#02F5D0] bg-[#18191B] p-3 text-xs">
                            <div className="pb-2">
                                <div
                                    onClick={() => handleAgreementAreaClick('all')}
                                    className="flex cursor-pointer items-center space-x-3"
                                >
                                    <div
                                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[#02F5D0] ${
                                            agreements.all && 'bg-[#02F5D0]'
                                        }`}
                                    >
                                        <svg
                                            className={`h-2.5 w-2.5 fill-current ${
                                                agreements.all ? 'text-black' : 'text-transparent'
                                            }`}
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                        </svg>
                                    </div>
                                    <span className="font-semibold">아래 약관에 모두 동의합니다.</span>
                                </div>
                            </div>
                            <hr className="border-gray-700" />
                            <div className="flex items-center justify-between pt-2">
                                <div
                                    onClick={() => handleAgreementAreaClick('required')}
                                    className="flex flex-1 items-center space-x-3 cursor-pointer"
                                >
                                    <div
                                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[#02F5D0] ${
                                            agreements.required && 'bg-[#02F5D0]'
                                        }`}
                                    >
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
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        showAgreementModal('required');
                                    }}
                                    className="text-gray-400 underline hover:text-white"
                                >
                                    보기
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div
                                    onClick={() => handleAgreementAreaClick('optional')}
                                    className="flex flex-1 items-center space-x-3 cursor-pointer"
                                >
                                    <div
                                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[#02F5D0] ${
                                            agreements.optional && 'bg-[#02F5D0]'
                                        }`}
                                    >
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
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        showAgreementModal('optional');
                                    }}
                                    className="text-gray-400 underline hover:text-white"
                                >
                                    보기
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-11 w-full rounded-xl bg-[#02F5D0] text-sm text-black transition hover:bg-opacity-80 disabled:opacity-60"
                        >
                            {submitting ? 'Registering…' : 'Register'}
                        </button>
                    </form>

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

                    {modalContent && (
                        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-4">
                            <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-[#18191B] border border-gray-700">
                                <div className="p-6 border-b border-gray-700">
                                    <h2 className="text-lg font-bold text-white">{modalContent.title}</h2>
                                    <button
                                        onClick={handleModalConfirm}
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
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto p-6">{modalContent.content}</div>
                                <div className="p-4 border-t border-gray-700 text-right">
                                    <button
                                        onClick={handleModalConfirm}
                                        className="h-11 rounded-xl bg-[#02F5D0] px-6 text-sm text-black transition hover:bg-opacity-80"
                                    >
                                        확인
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

SignUpPage.hideLayout = true;
