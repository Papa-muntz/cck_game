import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'teamA' | 'teamB' | 'error';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className,
  ...props
}) => {
  const baseStyles = "min-h-[48px] px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-transparent text-[#45BCEB] border-[#45BCEB] hover:bg-[#45BCEB] hover:text-[#0B1020] hover:shadow-[0_0_15px_rgba(69,188,235,0.4)]",
    secondary: "bg-[rgba(26,32,53,0.7)] text-gray-300 border-gray-600 hover:border-gray-400 hover:text-white",
    teamA: "bg-transparent text-[#2EE6D6] border-[#2EE6D6] hover:bg-[#2EE6D6] hover:text-[#0B1020] hover:shadow-[0_0_15px_rgba(46,230,214,0.4)]",
    teamB: "bg-transparent text-[#FF8A3D] border-[#FF8A3D] hover:bg-[#FF8A3D] hover:text-[#0B1020] hover:shadow-[0_0_15px_rgba(255,138,61,0.4)]",
    error: "bg-transparent text-[#F87171] border-[#F87171] hover:bg-[#F87171] hover:text-[#0B1020] hover:shadow-[0_0_15px_rgba(248,113,113,0.4)]"
  };

  return (
    <button
      className={classNames(
        baseStyles,
        variants[variant],
        { "w-full": fullWidth, "opacity-50 cursor-not-allowed": props.disabled },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
