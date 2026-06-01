import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <input ref={ref} className={`input-field ${error ? 'ring-2 ring-red-500' : ''} ${className}`} {...props} />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';
