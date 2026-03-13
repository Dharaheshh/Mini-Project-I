import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const variants = {
    primary: 'bg-gradient-to-r from-slate-800 to-cyan-700 text-white shadow-lg shadow-cyan-900/20 hover:shadow-cyan-900/40 border border-transparent',
    secondary: 'bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200/60 hover:bg-slate-50 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 border border-transparent',
    outline: 'border-2 border-cyan-700 text-cyan-700 hover:bg-cyan-50'
};

const sizes = {
    sm: 'h-8 px-3 text-xs rounded-lg',
    md: 'h-10 px-4 text-sm rounded-xl',
    lg: 'h-12 px-6 text-base rounded-xl',
    icon: 'h-10 w-10 p-2 flex items-center justify-center rounded-xl'
};

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    disabled,
    ...props
}, ref) => {
    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={cn(
                'relative inline-flex items-center justify-center font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5 active:translate-y-0',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };
