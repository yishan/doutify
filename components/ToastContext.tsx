'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';

interface ToastContextType {
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [message, setMessage] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    const showToast = useCallback((msg: string) => {
        setMessage(msg);
        setIsVisible(true);
    }, []);

    const closeToast = useCallback(() => {
        setIsVisible(false);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast message={message} isVisible={isVisible} onClose={closeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
