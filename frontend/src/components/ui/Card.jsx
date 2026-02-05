import React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'rounded-2xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/80 dark:bg-slate-900/60 dark:border-white/10 dark:hover:bg-slate-800/80',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';

export { Card };
