import React from 'react';
import { Card } from './Card';
import { cn } from '../../lib/utils';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
    const colorVariants = {
        primary: 'bg-primary-50 text-primary-600',
        success: 'bg-green-50 text-green-600',
        warning: 'bg-amber-50 text-amber-600',
        danger: 'bg-red-50 text-red-600',
    };

    return (
        <Card className="flex items-center p-6 transition-all hover:-translate-y-1">
            <div className={cn("rounded-full p-4 mr-4", colorVariants[color])}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
                {trend && (
                    <p className={cn("text-xs font-medium mt-1", trend === 'up' ? 'text-green-600' : 'text-red-600')}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}
                    </p>
                )}
            </div>
        </Card>
    );
};

export { StatsCard };
