'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface DropdownOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string;
    disabled?: boolean;
}

interface CustomDropdownProps {
    value?: string;
    onChange: (value: string) => void;
    options: Array<DropdownOption | string>;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    buttonClassName?: string;
    menuClassName?: string;
    icon?: React.ReactNode;
    searchable?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    placement?: 'auto' | 'top' | 'bottom';
}

export default function CustomDropdown({
    value,
    onChange,
    options,
    placeholder = 'Select option...',
    disabled = false,
    className = 'w-full',
    buttonClassName = '',
    menuClassName = '',
    icon,
    searchable = false,
    name,
    id,
    placement = 'auto'
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [openUpward, setOpenUpward] = useState(placement === 'top');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Calculate upward/downward placement based on viewport space
    const updatePlacement = useCallback(() => {
        if (placement === 'top') {
            setOpenUpward(true);
            return;
        }
        if (placement === 'bottom') {
            setOpenUpward(false);
            return;
        }
        if (dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            // If space below is less than 320px and there is more space above, open upward
            if (spaceBelow < 320 && spaceAbove > 200) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }
        }
    }, [placement]);

    // Check placement immediately when opening
    const handleToggle = () => {
        if (disabled) return;
        if (!isOpen) {
            updatePlacement();
        }
        setIsOpen(prev => !prev);
    };

    // Auto-update placement on scroll or resize while open
    useEffect(() => {
        if (!isOpen) return;
        updatePlacement();
        window.addEventListener('scroll', updatePlacement, true);
        window.addEventListener('resize', updatePlacement);
        return () => {
            window.removeEventListener('scroll', updatePlacement, true);
            window.removeEventListener('resize', updatePlacement);
        };
    }, [isOpen, updatePlacement]);

    // Normalize options into standard format
    const normalizedOptions: DropdownOption[] = options.map(opt => {
        if (typeof opt === 'string') {
            return { value: opt, label: opt };
        }
        return opt;
    });

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const filteredOptions = searchable && searchQuery
        ? normalizedOptions.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : normalizedOptions;

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div ref={dropdownRef} className={`relative inline-block ${isOpen ? 'z-30' : ''} ${className}`} id={id}>
            {/* Trigger Button */}
            <button
                type="button"
                name={name}
                disabled={disabled}
                onClick={handleToggle}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black outline-none focus:border-black focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isOpen ? 'border-black bg-white ring-2 ring-black/5' : ''
                } ${buttonClassName}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2 truncate text-left">
                    {icon && <span className="text-slate-500 shrink-0">{icon}</span>}
                    {selectedOption ? (
                        <div className="flex items-center gap-2 truncate">
                            {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
                            <span className="font-bold text-black truncate">{selectedOption.label}</span>
                            {selectedOption.badge && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                                    {selectedOption.badge}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-slate-500 font-medium">{placeholder}</span>
                    )}
                </div>

                <ChevronDown
                    size={15}
                    className={`text-slate-600 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-black' : ''}`}
                />
            </button>

            {/* Dropdown Menu Popover */}
            {isOpen && (
                <div
                    className={`absolute z-50 ${openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} w-full min-w-[200px] bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden py-1.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
                    role="listbox"
                >
                    {searchable && (
                        <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                            <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-black placeholder:text-slate-400 outline-none focus:border-black"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    <div className="p-1 space-y-0.5">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const isSelected = opt.value === value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        disabled={opt.disabled}
                                        onClick={() => !opt.disabled && handleSelect(opt.value)}
                                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-left ${
                                            isSelected
                                                ? 'bg-slate-100 text-black font-black'
                                                : 'text-slate-900 hover:bg-slate-50 hover:text-black'
                                        } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        role="option"
                                        aria-selected={isSelected}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                                            <span className="truncate">{opt.label}</span>
                                            {opt.badge && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                                                    {opt.badge}
                                                </span>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <Check size={14} className="text-black shrink-0 font-bold" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-3 text-center text-xs font-semibold text-slate-500">
                                No matching options
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
