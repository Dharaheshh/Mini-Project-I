import React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'rounded-xl border border-slate-200 bg-white/90 p-6 shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-lg relative overflow-hidden',
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
});

Card.displayName = 'Card';

export { Card };
