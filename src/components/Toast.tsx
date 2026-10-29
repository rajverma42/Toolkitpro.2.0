import React from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '12px 18px',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 12px 30px var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'toastIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            minWidth: 260,
            maxWidth: 380,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor:
                toast.type === 'error'
                  ? 'var(--danger)'
                  : toast.type === 'info'
                  ? 'var(--accent)'
                  : 'var(--success)',
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.text}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};
