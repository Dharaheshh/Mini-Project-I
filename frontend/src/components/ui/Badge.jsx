import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200 shadow-sm',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100/50',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100/50',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm shadow-rose-100/50',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200 shadow-sm',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm shadow-yellow-100/50',
    orange: 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm shadow-orange-100/50',
};

const Badge = ({ className, variant = 'default', children, ...props }) => {
    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export { Badge };
