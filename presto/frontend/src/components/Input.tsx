import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor={inputId} className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={`px-3 py-1.5 text-sm border rounded outline-none focus:ring-1 transition-shadow bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
            error
              ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
              : 'border-gray-200 dark:border-gray-600 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
