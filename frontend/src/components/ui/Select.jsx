import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * A modern, styled Dropdown replacement for native <select>
 * @param {Array} options - [{ value: string, label: string, icon: ReactNode? }]
 * @param {string} value - Current selected value
 * @param {Function} onChange - Callback with (selectedValue)
 * @param {string} placeholder - Default text when none selected
 */
const Select = ({ options, value, onChange, placeholder = "Select an option", className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full h-10 px-3 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-xl shadow-sm text-sm text-slate-700 transition-all hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500",
                    isOpen && "ring-2 ring-cyan-500 border-transparent shadow-md bg-white"
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption?.icon && <span className="text-slate-500">{selectedOption.icon}</span>}
                    <span className={cn("truncate", !selectedOption && "text-slate-400 font-medium")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-300", isOpen && "rotate-180 text-cyan-500")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-scale-up origin-top">
                    <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                        {options.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left font-medium",
                                        isSelected 
                                            ? "bg-cyan-50 text-cyan-700" 
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        {option.icon && <span className={cn(isSelected ? "text-cyan-500" : "text-slate-400")}>{option.icon}</span>}
                                        <span className="truncate">{option.label}</span>
                                    </div>
                                    {isSelected && <Check size={16} className="text-cyan-600 flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export { Select };
