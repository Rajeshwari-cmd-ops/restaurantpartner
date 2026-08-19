import React, { createContext, useContext, useCallback } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  addToast: (title: string, message?: string, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * ToastProvider — no-op stub.
 * The bottom-right notification system has been removed by design.
 * All addToast() call sites are preserved for type safety but do nothing.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const addToast = useCallback((_title: string, _message?: string, _variant?: ToastVariant) => {}, []);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const removeToast = useCallback((_id: string) => {}, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container intentionally removed — no notification UI rendered */}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
