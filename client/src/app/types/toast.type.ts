export default interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  color?: 'primary' | 'accent' | 'warn' | "red" | "green" | "blue";
}