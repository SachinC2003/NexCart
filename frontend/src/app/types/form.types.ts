export default interface FormField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'select' | 'radio' | 'textarea' | 'checkbox' | 'date' | 'number';
  placeholder?: string;
  initialValue?: any;
  options?: { label: string; value: any }[]; // For select/radio
  allowAddNew?: boolean; // For select, allow adding new option
  newFieldName?: string; // Name of the field for new value
  validations?: {
    required?: boolean;
    minLength?: number;
    pattern?: string;
  };
}