import React from 'react';
// Define the Notification type here if not exported elsewhere
export interface Notification {
    id: string;
    type: string;
    title?: string;
    message: string;
    count?: number;
}

interface NotificationContainerProps {
    notifications: Notification[];
    onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
    if (notifications.length === 0) return null;

    return (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className={`alert notification-modern alert-${n.type} notification-enter mb-2`}
                    role="alert"
                >
                    <div className="d-flex align-items-start">
                        <div className="flex-grow-1">
                            {n.title && <div className="fw-bold mb-1">{n.title}</div>}
                            <div className="small">{n.message}</div>
                        </div>

                        {/* ✅ contador de agrupadas */}
                        {n.count && n.count > 1 && (
                            <span className="badge rounded-pill text-bg-secondary ms-2" title="Agrupadas">
                                x{n.count}
                            </span>
                        )}

                        <button
                            type="button"
                            className="btn-close ms-2"
                            aria-label="Fechar"
                            onClick={() => onRemove(n.id)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationContainer;
