import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const baseClasses = 'px-3 py-1.5 text-sm rounded font-medium transition-colors focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900 outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white focus:ring-gray-500 dark:focus:ring-blue-500',
    secondary: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 focus:ring-gray-300 dark:focus:ring-gray-600',
    danger: 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white focus:ring-red-400 dark:focus:ring-red-500',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
