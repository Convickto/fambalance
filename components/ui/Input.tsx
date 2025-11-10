
import React from 'react';

// Combine attributes for both input and textarea for simplicity.
// This is a common pattern, though not perfectly type-safe (e.g., `rows` on an input).
// It's pragmatic for this component.
// FIX: The original interface caused type conflicts by extending two incompatible HTML attribute types.
// It has been replaced with a discriminated union type to correctly handle props for 'input' and 'textarea'.
type InputProps = {
  label?: string;
  id: string;
  error?: string;
} & (
  | ({ as?: 'input' } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({ as: 'textarea' } & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
);

const Input: React.FC<InputProps> = ({ label, id, error, className = '', as = 'input', ...props }) => {
  const commonClassName = `w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ADD8E6] transition duration-200 text-gray-900 placeholder-gray-500 bg-white ${error ? 'border-red-500' : ''} ${className}`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-1">
          {label}
        </label>
      )}
      {as === 'textarea' ? (
        <textarea
          id={id}
          className={commonClassName}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          className={commonClassName}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;
