import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const baseClasses = 'px-3 py-1.5 text-sm rounded font-medium transition-colors focus:ring-2 focus:ring-offset-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-black hover:bg-gray-800 text-white focus:ring-gray-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
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
