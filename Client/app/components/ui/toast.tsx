'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast interface
interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

// Toast context interface
interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

// Create toast context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show toast function
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }]);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  // Hide toast function
  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              rounded-lg shadow-lg p-4 flex items-start space-x-3 transform transition-all duration-300 ease-in-out
              ${toast.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-800' : ''}
              ${toast.type === 'error' ? 'bg-red-50 border-l-4 border-red-500 text-red-800' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-800' : ''}
            `}
          >
            <div className="flex-grow">
              <h4 className="font-semibold">{toast.title}</h4>
              <p className="text-sm">{toast.message}</p>
            </div>
            <button
              onClick={() => hideToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Custom hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
} 