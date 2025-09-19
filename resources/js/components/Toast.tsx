import React, { useEffect, useState } from 'react';

type ToastProps = {
  message?: string | null;
  type?: 'success' | 'error' | 'info';
  timeout?: number;
};

export default function Toast({ message, type = 'info', timeout = 3500 }: ToastProps) {
  const [open, setOpen] = useState(Boolean(message));

  useEffect(() => {
    setOpen(Boolean(message));
    if (message) {
      const id = setTimeout(() => setOpen(false), timeout);
      return () => clearTimeout(id);
    }
  }, [message, timeout]);

  if (!open || !message) return null;

  const base = 'position-fixed top-0 start-50 translate-middle-x mt-3 px-3 py-2 rounded shadow-sm border text-white';
  const styles = {
    success: 'bg-success border-success-subtle',
    error: 'bg-danger border-danger-subtle',
    info: 'bg-primary border-primary-subtle',
  } as const;

  return (
    <div role="status" aria-live="polite" className={`${base} ${styles[type]}`}
      style={{ zIndex: 1060, minWidth: 280, textAlign: 'center' }}>
      {message}
    </div>
  );
}
