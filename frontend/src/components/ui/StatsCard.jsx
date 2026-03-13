import React from 'react';
import { Card } from './Card';
import { cn } from '../../lib/utils';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary', colorClass }) => {
    const colorVariants = {
        primary: 'bg-blue-50 text-blue-600 border-blue-100',
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        warning: 'bg-amber-50 text-amber-600 border-amber-100',
        danger: 'bg-red-50 text-red-600 border-red-100',
    };

    const activeColorClass = colorClass || colorVariants[color];

    return (
        <Card className="group flex flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default border-slate-200">
            <div className={cn("inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4 border transition-transform duration-300 group-hover:scale-110", activeColorClass)}>
                <Icon size={20} />
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
            <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
            {trend && (
                <p className={cn("text-xs font-bold mt-2 flex items-center gap-1", trend === 'up' ? 'text-emerald-600' : 'text-red-600')}>
                    {trend === 'up' ? '↑' : '↓'} {trendValue}
                </p>
            )}
        </Card>
    );
};

export { StatsCard };
