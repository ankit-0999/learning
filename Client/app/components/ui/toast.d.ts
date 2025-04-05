// Type declarations for toast component
export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

export function ToastProvider({ children }: { children: React.ReactNode }): JSX.Element;
export function useToast(): ToastContextType; 