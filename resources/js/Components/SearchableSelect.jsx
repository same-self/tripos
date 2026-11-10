import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X, AlertCircle } from 'lucide-react';

/**
 * High-craft searchable select component with zero-clipping portal popover,
 * instant query filtering, keyboard navigation, and dark mode support.
 */
export default function SearchableSelect({
    value,
    onChange,
    options = [],
    placeholder = 'Pilih...',
    searchPlaceholder = 'Cari...',
    filterFields = ['name'],
    renderOption,
    renderSelected,
    disabled = false,
    hasError = false,
    id,
    name,
    className = '',
    emptyMessage = 'Tidak ada pilihan ditemukan',
    allowClear = true,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(-1);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false });

    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const searchInputRef = useRef(null);
    const listRef = useRef(null);

    // Find currently selected option
    const selectedOption = useMemo(() => {
        if (value === null || value === undefined || value === '') return null;
        return options.find((opt) => String(opt.id) === String(value)) || null;
    }, [options, value]);

    // Filter options based on query and filterFields
    const filteredOptions = useMemo(() => {
        if (!query.trim()) return options;
        const q = query.toLowerCase().trim();
        return options.filter((item) => {
            return filterFields.some((field) => {
                const val = item[field];
                return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
            });
        });
    }, [options, query, filterFields]);

    // Compute popover coordinates relative to viewport
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const estimatedHeight = 320;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

        const minWidth = Math.max(rect.width, 280);
        const maxLeft = window.innerWidth - minWidth - 12;
        const left = Math.max(12, Math.min(rect.left, maxLeft));

        setPosition({
            top: openUpward ? rect.top - 6 : rect.bottom + 6,
            left,
            width: Math.min(minWidth, window.innerWidth - 24),
            openUpward,
        });
    }, []);

    // Toggle open state
    const openDropdown = () => {
        if (disabled) return;
        updatePosition();
        setIsOpen(true);
        // Set active index to currently selected or first item
        const selectedIdx = filteredOptions.findIndex((opt) => String(opt.id) === String(value));
        setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
    };

    const closeDropdown = () => {
        setIsOpen(false);
        setQuery('');
        setActiveIndex(-1);
    };

    // Update position on scroll and resize while open
    useEffect(() => {
        if (!isOpen) return;

        updatePosition();

        const handleScrollOrResize = () => {
            updatePosition();
        };

        window.addEventListener('resize', handleScrollOrResize);
        window.addEventListener('scroll', handleScrollOrResize, true);

        return () => {
            window.removeEventListener('resize', handleScrollOrResize);
            window.removeEventListener('scroll', handleScrollOrResize, true);
        };
    }, [isOpen, updatePosition]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(event.target) &&
                popoverRef.current &&
                !popoverRef.current.contains(event.target)
            ) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Auto-focus search input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Auto-scroll active item into view
    useEffect(() => {
        if (isOpen && listRef.current && activeIndex >= 0 && listRef.current.children[activeIndex]) {
            listRef.current.children[activeIndex].scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex, isOpen]);

    // Select option handler
    const selectOption = (opt) => {
        onChange(opt ? opt.id : '', opt);
        closeDropdown();
        triggerRef.current?.focus();
    };

    // Clear handler
    const handleClear = (e) => {
        e.stopPropagation();
        onChange('', null);
        setQuery('');
        triggerRef.current?.focus();
    };

    // Keyboard navigation
    const handleTriggerKeyDown = (e) => {
        if (disabled) return;

        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openDropdown();
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                // If user starts typing alphanumeric keys, open and populate search query
                e.preventDefault();
                openDropdown();
                setQuery(e.key);
            }
            return;
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeDropdown();
            triggerRef.current?.focus();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % Math.max(1, filteredOptions.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + Math.max(1, filteredOptions.length)) % Math.max(1, filteredOptions.length));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredOptions.length > 0 && activeIndex >= 0 && activeIndex < filteredOptions.length) {
                selectOption(filteredOptions[activeIndex]);
            }
        } else if (e.key === 'Tab') {
            closeDropdown();
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Hidden input for HTML form validation / data binding if needed */}
            {name && <input type="hidden" name={name} value={value || ''} />}

            {/* Trigger Button */}
            <button
                ref={triggerRef}
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => (isOpen ? closeDropdown() : openDropdown())}
                onKeyDown={handleTriggerKeyDown}
                className={`group flex h-10 w-full items-center justify-between gap-2 rounded-xl border px-3 text-left text-xs transition-all ${
                    hasError
                        ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-500 dark:bg-red-950/20 dark:text-red-200'
                        : isOpen
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-slate-900 dark:border-blue-500'
                        : 'border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                } ${
                    disabled
                        ? 'cursor-not-allowed opacity-60 bg-slate-50 dark:bg-slate-800/50'
                        : 'cursor-pointer'
                }`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    {selectedOption ? (
                        renderSelected ? (
                            renderSelected(selectedOption)
                        ) : (
                            <span className="truncate font-medium text-slate-900 dark:text-white">
                                {selectedOption.name}
                            </span>
                        )
                    ) : (
                        <span className="truncate text-slate-400 dark:text-slate-500">
                            {placeholder}
                        </span>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5 pl-1">
                    {allowClear && selectedOption && !disabled && (
                        <span
                            role="button"
                            tabIndex={-1}
                            onClick={handleClear}
                            title="Hapus pilihan"
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                            <X size={13} strokeWidth={2.25} />
                        </span>
                    )}
                    <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-200 dark:text-slate-500 ${
                            isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                        }`}
                    />
                </div>
            </button>

            {/* Portal Dropdown Popover */}
            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={popoverRef}
                        style={{
                            position: 'fixed',
                            top: position.openUpward ? undefined : `${position.top}px`,
                            bottom: position.openUpward ? `${window.innerHeight - position.top}px` : undefined,
                            left: `${position.left}px`,
                            width: `${position.width}px`,
                            zIndex: 9999,
                        }}
                        className="animate-popover flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/15 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/70"
                    >
                        {/* Search Input Box */}
                        <div className="border-b border-slate-100 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-950/70">
                            <div className="relative flex items-center">
                                <Search
                                    size={14}
                                    className="pointer-events-none absolute left-2.5 text-slate-400 dark:text-slate-500"
                                />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setActiveIndex(0);
                                    }}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder={searchPlaceholder}
                                    className="h-8 w-full rounded-lg border border-slate-200/90 bg-white pl-8 pr-7 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery('');
                                            searchInputRef.current?.focus();
                                        }}
                                        className="absolute right-2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Options List */}
                        <div
                            ref={listRef}
                            role="listbox"
                            className="max-h-60 overflow-y-auto overscroll-contain p-1 divide-y divide-slate-100/60 dark:divide-slate-800/40"
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt, idx) => {
                                    const isSelected = String(opt.id) === String(value);
                                    const isActive = idx === activeIndex;

                                    return (
                                        <div
                                            key={opt.id}
                                            role="option"
                                            aria-selected={isSelected}
                                            onClick={() => selectOption(opt)}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            className={`group flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-xs transition-colors cursor-pointer ${
                                                isSelected
                                                    ? 'bg-blue-50/90 text-blue-900 font-medium dark:bg-blue-950/70 dark:text-blue-100'
                                                    : isActive
                                                    ? 'bg-slate-100/90 text-slate-900 dark:bg-slate-800/80 dark:text-white'
                                                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                {renderOption ? (
                                                    renderOption(opt, { isSelected, isActive })
                                                ) : (
                                                    <span className="truncate">{opt.name}</span>
                                                )}
                                            </div>

                                            {isSelected && (
                                                <Check
                                                    size={14}
                                                    strokeWidth={2.5}
                                                    className="shrink-0 text-blue-600 dark:text-blue-400"
                                                />
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
                                    <AlertCircle size={20} className="text-slate-300 dark:text-slate-600" />
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {emptyMessage}
                                    </p>
                                    {query && (
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                            Tidak ada hasil untuk &quot;<span className="font-semibold text-slate-600 dark:text-slate-300">{query}</span>&quot;
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Status Bar */}
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-3 py-1.5 text-[10px] text-slate-400 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-500">
                            <span>{filteredOptions.length} pilihan</span>
                            <span className="hidden sm:inline">Gunakan ↑ ↓ untuk navigasi, Enter untuk memilih</span>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}
