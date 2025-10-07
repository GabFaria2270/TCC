import React from 'react';
import type { Notification } from '../hooks/useNotifications';

interface NotificationContainerProps {
    notifications: Notification[];
    onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return 'bi-check-circle-fill text-success';
            case 'error':
                return 'bi-x-circle-fill text-danger';
            case 'warning':
                return 'bi-exclamation-triangle-fill text-warning';
            case 'info':
                return 'bi-info-circle-fill text-info';
            default:
                return 'bi-bell-fill text-primary';
        }
    };

    const getAlertClass = (type: string) => {
        switch (type) {
            case 'success':
                return 'alert-success';
            case 'error':
                return 'alert-danger';
            case 'warning':
                return 'alert-warning';
            case 'info':
                return 'alert-info';
            default:
                return 'alert-primary';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`alert ${getAlertClass(notification.type)} alert-dismissible fade show notification-modern mb-2 shadow-sm`}
                    role="alert"
                >
                    <div className="d-flex align-items-start">
                        <i className={`bi ${getIcon(notification.type)} fs-5 me-2 mt-1`}></i>
                        <div className="flex-grow-1">
                            <div className="fw-bold mb-1">{notification.title}</div>
                            <div className="small">{notification.message}</div>
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-sm ms-2"
                            onClick={() => onRemove(notification.id)}
                            style={{ fontSize: '0.8rem' }}
                        ></button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationContainer;
