import { useState } from 'react';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
}

const MAX_ACTIVE = 3; // ✅ limite máximo na tela

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const id = `${Date.now()}-${Math.random()}`;
        const newNotification = { ...notification, id };

        setNotifications(prev => {
            // mantém somente as últimas MAX_ACTIVE
            const next = [...prev, newNotification];
            return next.length > MAX_ACTIVE ? next.slice(next.length - MAX_ACTIVE) : next;
        });

        setTimeout(() => {
            removeNotification(id);
        }, notification.duration || 5000);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return {
        notifications,
        addNotification,
        removeNotification
    };
};
