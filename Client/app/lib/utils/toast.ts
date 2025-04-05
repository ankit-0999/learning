// Simple toast utility for debugging that doesn't rely on React context
// This is a fallback in case the toast component is having issues

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title: string;
  message: string;
  type: ToastType;
}

// Create a console-based toast for debugging
export function showToast(options: ToastOptions): void {
  const { title, message, type } = options;
  
  // Log to console with appropriate styling
  const styles = {
    success: 'color: green; font-weight: bold;',
    error: 'color: red; font-weight: bold;',
    warning: 'color: orange; font-weight: bold;',
    info: 'color: blue; font-weight: bold;'
  };
  
  console.group(`%c${title}`, styles[type]);
  console.log(message);
  console.groupEnd();
  
  // You could also show browser notifications if needed
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
      }
    } catch (e) {
      // Ignore notification errors
    }
  }
} 