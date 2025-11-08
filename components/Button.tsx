import React, { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth = false, className = '', ...props }) => {
  const baseClasses = "flex items-center justify-center font-sans font-bold py-3 px-6 rounded-full text-base transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-verde-mata";

  const variantClasses = {
    primary: 'bg-dourado-suave text-verde-mata hover:opacity-90 focus:ring-dourado-suave',
    secondary: 'bg-marrom-seiva/10 text-marrom-seiva dark:bg-creme-velado/10 dark:text-creme-velado hover:bg-marrom-seiva/20 dark:hover:bg-creme-velado/20 focus:ring-marrom-seiva/50'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  
  const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);