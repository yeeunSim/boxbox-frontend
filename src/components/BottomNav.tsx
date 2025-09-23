// src/components/BottomNav.tsx

import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'; // 1. useAuth 훅 import

const navItems = [
    { href: '/', iconName: 'home', alt: 'Home' },
    { href: '/podium', iconName: 'trophy', alt: 'Trophy' },
    { href: '/fan-radio', iconName: 'radio', alt: 'Radio' },
    { href: '/my-page', iconName: 'user', alt: 'User' },
];

const BottomNav = () => {
    const router = useRouter();
    // 2. AuthContext에서 필요한 기능 가져오기
    const { isLoggedIn, openLoginModal } = useAuth();

    // 3. 'My Page' 아이콘 클릭 시 실행될 함수
    const handleMyPageClick = () => {
        if (isLoggedIn) {
            router.push('/my-page'); // 로그인 상태이면 페이지 이동
        } else {
            openLoginModal(); // 로그아웃 상태이면 모달 띄우기
        }
    };

    return (
        <div className="fixed bottom-0 w-full bg-[#22202A] z-30 safe-area-padding">
            <div className="max-w-md mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = router.pathname === item.href;
                    const iconSrc = `/icons/${item.iconName}${isActive ? '-active' : ''}.svg`;

                    // 4. 'my-page'일 경우 특별 처리
                    if (item.href === '/my-page') {
                        return (
                            <button
                                key={item.href}
                                onClick={handleMyPageClick}
                                className="flex items-center justify-center"
                            >
                                <Image
                                    src={iconSrc}
                                    alt={item.alt}
                                    width={28}
                                    height={28}
                                    className={item.iconName === 'radio' ? 'translate-y-[5px]' : ''}
                                />
                            </button>
                        );
                    }

                    // 5. 그 외 아이템들은 기존과 동일하게 Link로 처리
                    return (
                        <Link href={item.href} key={item.href} className="flex items-center justify-center">
                            <Image
                                src={iconSrc}
                                alt={item.alt}
                                width={28}
                                height={28}
                                className={item.iconName === 'radio' ? 'translate-y-[5px]' : ''}
                            />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
