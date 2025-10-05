// src/pages/sign-up.tsx

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
    setEmailVerifying(true);
    setEmailVerified(null);

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
    setNickVerified(false);
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
      userBirth: toApiBirth(formData.dateOfBirth),
      userGender: mapGender(selectedGender?.id),
      svcUsePcyAgmtYn: agreements.required ? 'Y' : 'N',
      psInfoProcAgmtYn: agreements.optional ? 'Y' : 'N',
    } as const;

    try {
      setSubmitting(true);
      await signUpAPI.register(payload);
      setIsModalOpen(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || '회원가입 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
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
          <form onSubmit={handleSubmit} className="relative w-full max-w-xs space-y-4 rounded-2xl bg-[#1B1C21] p-6 text-white">
            <Link href="/" passHref>
              <button type="button" aria-label="Close" className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                  {emailVerified === true && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#02F5D0]">✓</span>}
                </div>
                <button
                  type="button"
                  onClick={handleEmailVerify}
                  disabled={emailVerifying || !formData.email}
                  className="h-11 flex-shrink-0 rounded-xl bg-[#02F5D0] px-5 text-xs text-black transition hover:bg-opacity-80 disabled:opacity-60"
                >
                  {emailVerifying ? 'CHECKING…' : emailVerified === true ? 'OK ✓' : 'VERIFY'}
                </button>
              </div>

              {/* 비밀번호 */}
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                />
                <p className="mt-1.5 pr-1 text-right text-[8px] text-gray-300">Password (8–12 characters, no -, ., /)</p>
              </div>

              {/* 비밀번호 확인 */}
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-[#02F5D0] bg-transparent px-4 text-sm text-white placeholder:text-[#444D56] focus:outline-none focus:ring-2 focus:ring-[#02F5D0]/50"
                />
                {isPasswordMatching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-[#02F5D0]">✓</span>}
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
                  {nickVerified === true && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#02F5D0]">✓</span>}
                </div>
                <button
                  type="button"
                  onClick={handleNicknameVerify}
                  disabled={nickVerifying || !formData.nickname}
                  className="h-11 flex-shrink-0 rounded-xl bg-[#02F5D0] px-5 text-xs text-black transition hover:bg-opacity-80 disabled:opacity-60"
                >
                  {nickVerifying ? 'CHECKING…' : nickVerified === true ? 'OK ✓' : 'VERIFY'}
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
                    <span className={selectedGender ? 'text-white' : 'text-[#444D56]'}>{selectedGender ? selectedGender.name : 'Gender (Optional)'}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="h-4 w-4 fill-current text-[#02F5D0]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-[#2a2b31] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                      {genderOptions.map((gender) => (
                        <Listbox.Option
                          key={gender.id}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-[#02F5D0] text-black' : 'text-white'}`
                          }
                          value={gender}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{gender.name}</span>
                              {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">✓</span>}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>

            {/* 약관 */}
            <div className="space-y-2.5 rounded-2xl border border-[#02F5D0] bg-[#18191B] p-3">
              <label htmlFor="all" className="flex cursor-pointer items-center space-x-3 text-xs">
                <input id="all" type="checkbox" name="all" checked={agreements.all} onChange={handleAgreementChange} className="peer sr-only" />
                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[#02F5D0] peer-checked:bg-[#02F5D0]">
                  <svg className={`h-2.5 w-2.5 fill-current ${agreements.all ? 'text-black' : 'text-transparent'}`} viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                </div>
                <span>아래 약관에 모두 동의합니다.</span>
              </label>
              <hr className="border-gray-700" />
              <label htmlFor="required" className="flex cursor-pointer items-center space-x-3 text-xs">
                <input id="required" type="checkbox" name="required" checked={agreements.required} onChange={handleAgreementChange} required className="peer sr-only" />
                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[#02F5D0] peer-checked:bg-[#02F5D0]">
                  <svg className={`h-2.5 w-2.5 fill-current ${agreements.required ? 'text-black' : 'text-transparent'}`} viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                </div>
                <span>[필수] 개인정보 수집 및 이용 동의</span>
              </label>
              <label htmlFor="optional" className="flex cursor-pointer items-center space-x-3 text-xs">
                <input id="optional" type="checkbox" name="optional" checked={agreements.optional} onChange={handleAgreementChange} className="peer sr-only" />
                <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[#02F5D0] peer-checked:bg-[#02F5D0]">
                  <svg className={`h-2.5 w-2.5 fill-current ${agreements.optional ? 'text-black' : 'text-transparent'}`} viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                </div>
                <span>[선택] 개인정보 수집 및 이용 동의</span>
              </label>
            </div>

            <button type="submit" disabled={submitting} className="h-11 w-full rounded-xl bg-[#02F5D0] text-sm text-black transition hover:bg-opacity-80 disabled:opacity-60">
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
                <button onClick={handleLoginRedirect} className="h-12 w-full max-w-xs rounded-xl bg-[#02F5D0] text-black transition hover:bg-opacity-80">
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
