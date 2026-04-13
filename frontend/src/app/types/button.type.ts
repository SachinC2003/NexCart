export default interface ButtonConfig {
  label: string;
  type: 'button' | 'submit' | 'reset';
  color?: 'primary' | 'accent' | 'warn' | "red";
  disabled?: boolean;
}