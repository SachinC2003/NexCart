export type Theme = 'light' | 'dark';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}