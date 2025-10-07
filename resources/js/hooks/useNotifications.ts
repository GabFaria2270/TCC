import { useState } from 'react';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const id = Date.now().toString();
        const newNotification = { ...notification, id };

        setNotifications(prev => [...prev, newNotification]);

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
