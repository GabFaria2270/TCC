import React from 'react';
import { createPortal } from 'react-dom';

export default function ModalPortal({ children }: { children: React.ReactNode }) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;
    return createPortal(children, document.body);
}
