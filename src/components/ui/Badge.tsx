import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'indigo' | 'outline';
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  dot = false,
  pulse = false,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide';

  const variants = {
    default:
      'bg-zinc-900/80 text-zinc-300 border border-zinc-800 shadow-sm',
    success:
      'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40',
    indigo:
      'bg-indigo-950/40 text-indigo-300 border border-indigo-800/40',
    outline:
      'bg-transparent text-zinc-400 border border-zinc-800',
  };

  const dotColors = {
    default: 'bg-zinc-400',
    success: 'bg-emerald-400',
    indigo: 'bg-indigo-400',
    outline: 'bg-zinc-500',
  };

  return (
    <div
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={clsx(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant]
              )}
            />
          )}
          <span
            className={clsx(
              'relative inline-flex rounded-full h-2 w-2',
              dotColors[variant]
            )}
          />
        </span>
      )}
      <span>{children}</span>
    </div>
  );
};
