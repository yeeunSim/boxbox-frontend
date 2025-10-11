import { useState, FormEvent, ChangeEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signUpAPI, verifyAPI } from '@/apis/loginAPI';
import axios, { type AxiosError } from 'axios';
import Modal from '@/components/Modal';

type ApiErrorBody = { message?: string };

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

    const [showRequiredModal, setShowRequiredModal] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalMsg, setModalMsg] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nickname: '',
    });

    const [agreements, setAgreements] = useState({
        required: false,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'email') setEmailVerified(null);
        if (name === 'nickname') setNickVerified(null);
    };

    // 약관 클릭 → 필수 모달만 열림
    const handleAgreementClick = (e: React.MouseEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setShowRequiredModal(true);
    };

    // 필수 약관 모달 닫으면 자동 체크
    const handleRequiredAgree = () => {
        setShowRequiredModal(false);
        setAgreements({ required: true });
    };

    // 이메일 중복확인
    const handleEmailVerify = async () => {
        const email = formData.email?.trim();
        if (!email) return alert('아이디 입력해 주세요.');

        try {
            setEmailVerifying(true);
            setEmailVerified(null);

            await verifyAPI.checkEmailAvailable(email);
            setEmailVerified(true);
            alert('사용 가능한 아이디입니다.');
        } catch (err) {
            if (axios.isAxiosError<ApiErrorBody>(err)) {
                const status = err.response?.status;
                const msg = err.response?.data?.message;

                if (status === 409) {
                    setEmailVerified(false);
                    alert('이미 사용 중인 아이디입니다.');
                } else if (status === 400) {
                    setEmailVerified(false);
                    alert('형식이 맞지 않는 아이디입니다.');
                } else {
                    setEmailVerified(false);
                    alert(msg || '아이디 확인 중 오류가 발생했어요.');
                }
            } else {
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

            await verifyAPI.checkNicknameAvailable(nickname);
            setNickVerified(true);
            alert('사용 가능한 닉네임입니다.');
        } catch (err) {
            if (axios.isAxiosError<ApiErrorBody>(err)) {
                const status = err.response?.status;
                const msg = err.response?.data?.message;

                if (status === 409) {
                    setNickVerified(false);
                    setModalMsg('이미 사용 중인 닉네임입니다.');
                    setShowModal(true);
                } else if (status === 400) {
                    setNickVerified(false);
                    setModalMsg('형식이 맞지 않는 닉네임입니다.');
                    setShowModal(true);
                } else {
                    setNickVerified(false);
                    setModalMsg(msg || '닉네임 확인 중 오류가 발생했어요.');
                    setShowModal(true);
                }
            } else {
                setNickVerified(false);
                alert('알 수 없는 오류가 발생했어요.');
            }
        } finally {
            setNickVerifying(false);
        }
    };

    // 비밀번호 규칙 검증
    const isValidPassword = (pw: string) => {
        if (pw.length < 8 || pw.length > 12) return false;
        if (/[./-]/.test(pw)) return false;
        return true;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (emailVerified !== true) {
            setModalMsg('아이디 중복확인을 완료해 주세요.');
            setShowModal(true);
            return;
        }

        if (nickVerified !== true) {
            setModalMsg('닉네임 중복확인을 완료해 주세요.');
            setShowModal(true);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setModalMsg('비밀번호가 일치하지 않습니다.');
            setShowModal(true);
            return;
        }
        if (!isValidPassword(formData.password)) {
            setModalMsg('비밀번호는 8–12자이며 -, ., / 문자를 포함할 수 없습니다.');
            setShowModal(true);
            return;
        }
        if (!agreements.required) {
            setModalMsg('필수 약관에 동의해 주세요.');
            setShowModal(true);
            return;
        }

        const payload = {
            loginEmail: formData.email,
            loginPw: formData.password,
            userNickname: formData.nickname,
            userBirth: null,
            userGender: null,
            svcUsePcyAgmtYn: 'Y',
            psInfoProcAgmtYn: 0,
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
            setModalMsg(msg);
            setShowModal(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLoginRedirect = () => router.push('/login');

    const isPasswordMatching = formData.password && formData.password === formData.confirmPassword;

    const isFormValid =
        emailVerified === true &&
        nickVerified === true &&
        isValidPassword(formData.password) &&
        isPasswordMatching &&
        agreements.required;

    return (
        <>
            <Head>
                <title>Sign Up - Box Box</title>
            </Head>
            <main className="flex min-h-screen items-center justify-center bg-black">
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
                                        type="text"
                                        name="email"
                                        placeholder="ID"
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
                                {isPasswordMatching ? (
                                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-base text-[#02F5D0]">
                                        ✔
                                    </span>
                                ) : formData.confirmPassword ? (
                                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-base text-red-600">
                                        ✖
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
                        </div>

                        {/* 약관 (필수만 남김) */}
                        <div className="space-y-2.5 rounded-2xl border border-[#02F5D0] bg-[#18191B] p-3">
                            <label
                                onClick={handleAgreementClick}
                                className="flex cursor-pointer items-center space-x-3 text-xs"
                            >
                                <input
                                    type="checkbox"
                                    name="required"
                                    checked={agreements.required}
                                    readOnly
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
                        </div>

                        <button
                            type="submit"
                            disabled={!isFormValid}
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
                            onClick={() => setShowRequiredModal(false)}
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
                                            수집 목적: 서비스 제공 및 운영, 회원 식별·인증, 이용자 문의 대응
                                        </li>
                                        <li>수집 항목: 아이디, 비밀번호(암호화 저장), 닉네임</li>
                                        <li>
                                            보유·이용기간: 수집일로부터 365일
                                        </li>
                                    </ul>
                                    <p>
                                        ※ 귀하는 개인정보 수집·이용에 동의하지 않을 권리가 있습니다. 다만 동의하지 않을
                                        경우 서비스 이용(회원가입 및 로그인 등)이 제한될 수 있습니다.
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

                    <Modal
                        isOpen={showModal}
                        title="회원가입 오류!"
                        message={modalMsg}
                        primaryText="확인"
                        onPrimary={() => {
                            setShowModal(false);
                        }}
                    />
                </div>
            </main>
        </>
    );
}

SignUpPage.hideLayout = true;
