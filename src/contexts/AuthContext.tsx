// src/contexts/AuthContext.tsx

import { createContext, useState, useContext, ReactNode } from 'react';

// Context가 가지게 될 값들의 타입을 정의
interface AuthContextType {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
    isLoginModalOpen: boolean; // 모달이 열렸는지 여부
    openLoginModal: () => void; // 모달을 여는 함수
    closeLoginModal: () => void; // 모달을 닫는 함수
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const login = () => setIsLoggedIn(true);
    const logout = () => setIsLoggedIn(false);
    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    const value = { isLoggedIn, login, logout, isLoginModalOpen, openLoginModal, closeLoginModal };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
