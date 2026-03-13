import React from 'react';
import { Card } from './Card';
import { cn } from '../../lib/utils';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
    const colorVariants = {
        primary: 'bg-primary-50 text-primary-600 shadow-primary-100/50',
        success: 'bg-green-50 text-green-600 shadow-green-100/50',
        warning: 'bg-amber-50 text-amber-600 shadow-amber-100/50',
        danger: 'bg-red-50 text-red-600 shadow-red-100/50',
    };

    return (
        <Card className="group flex items-center p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-default border-slate-100 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors duration-300" />
            <div className={cn("rounded-xl p-4 mr-4 shadow-md relative z-10 transition-transform duration-300 group-hover:scale-110", colorVariants[color])}>
                <Icon size={24} />
            </div>
            <div className="relative z-10">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
                {trend && (
                    <p className={cn("text-xs font-bold mt-1 flex items-center gap-1", trend === 'up' ? 'text-green-600' : 'text-red-600')}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}
                    </p>
                )}
            </div>
        </Card>
    );
};

export { StatsCard };
