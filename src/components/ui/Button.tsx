import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'right',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none rounded-full cursor-pointer';

    const variants = {
      primary:
        'bg-white text-zinc-950 hover:bg-zinc-200 shadow-md shadow-white/10 active:scale-[0.98]',
      secondary:
        'bg-zinc-900/90 text-zinc-200 hover:bg-zinc-800 hover:text-white border border-zinc-800 active:scale-[0.98]',
      outline:
        'border border-zinc-700/60 text-zinc-300 hover:text-white hover:border-zinc-500 bg-transparent active:scale-[0.98]',
      ghost:
        'text-zinc-400 hover:text-white hover:bg-zinc-800/50 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5',
      md: 'text-sm px-5 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(baseStyles, variants[variant], sizes[size], className)
        )}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
