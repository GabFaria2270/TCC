import { useEffect, useRef, useState } from 'react';

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
    const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const clearNotificationTimeout = (id: string) => {
        if (timeoutsRef.current[id]) {
            clearTimeout(timeoutsRef.current[id]);
            delete timeoutsRef.current[id];
        }
    };

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const id = `${Date.now()}-${Math.random()}`;
        const newNotification = { ...notification, id };

        setNotifications((prev) => {
            // mantém somente as últimas MAX_ACTIVE
            const next = [...prev, newNotification];
            return next.length > MAX_ACTIVE ? next.slice(next.length - MAX_ACTIVE) : next;
        });

        const timeoutId = setTimeout(() => {
            removeNotification(id);
        }, notification.duration || 5000);

        timeoutsRef.current[id] = timeoutId;
    };

    const removeNotification = (id: string) => {
        clearNotificationTimeout(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    useEffect(() => {
        return () => {
            Object.keys(timeoutsRef.current).forEach(clearNotificationTimeout);
        };
    }, []);

    return {
        notifications,
        addNotification,
        removeNotification,
    };
};
