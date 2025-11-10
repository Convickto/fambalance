
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'flex items-center justify-center font-semibold rounded-full transition duration-300 ease-in-out';
  let variantStyles = '';
  let sizeStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles = 'bg-[#3CB371] text-white hover:bg-green-700 focus:ring-4 focus:ring-green-300';
      break;
    case 'secondary':
      variantStyles = 'bg-[#87CEFA] text-white hover:bg-blue-500 focus:ring-4 focus:ring-blue-300';
      break;
    case 'outline':
      variantStyles = 'border-2 border-[#3CB371] text-[#3CB371] hover:bg-green-100 focus:ring-4 focus:ring-green-300';
      break;
    case 'ghost':
      variantStyles = 'text-gray-600 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200';
      break;
  }

  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1 text-sm';
      break;
    case 'md':
      sizeStyles = 'px-6 py-2 text-base';
      break;
    case 'lg':
      sizeStyles = 'px-8 py-3 text-lg';
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className} ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner className="mr-2 h-4 w-4 text-white" />}
      {children}
    </button>
  );
};

export default Button;
