import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

/**
 * A dropdown you can type into: pick from the list, or type to narrow it down.
 *
 * options: [{ value, label, hint? }]. `value` is the chosen option's value ('' for none).
 * Keyboard: ↑ ↓ move, Enter picks, Esc closes. The list is positioned with `fixed`, so it is
 * not cut off inside scrolling tables.
 */
export default function SearchSelect({
    options,
    value,
    onChange,
    placeholder = 'Pilih…',
    emptyText = 'Tidak ada hasil',
    id,
    className = '',
    invalid = false,
}) {
    const wrapRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const [box, setBox] = useState(null);

    const selected = options.find((o) => String(o.value) === String(value)) ?? null;

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, query]);

    function place() {
        const r = inputRef.current?.getBoundingClientRect();
        if (r) setBox({ left: r.left, top: r.bottom + 4, width: r.width });
    }

    function openList() {
        place();
        setQuery('');
        setActive(Math.max(0, options.findIndex((o) => String(o.value) === String(value))));
        setOpen(true);
    }

    function close() {
        setOpen(false);
        setQuery('');
    }

    function choose(option) {
        onChange(option.value);
        close();
    }

    // Close on outside click; keep the list under the box while the page scrolls or resizes
    useEffect(() => {
        if (!open) return undefined;

        const onDown = (e) => {
            const inWrap = wrapRef.current?.contains(e.target);
            const inList = listRef.current?.contains(e.target);
            if (!inWrap && !inList) close();
        };
        document.addEventListener('mousedown', onDown);
        window.addEventListener('scroll', place, true);
        window.addEventListener('resize', place);

        return () => {
            document.removeEventListener('mousedown', onDown);
            window.removeEventListener('scroll', place, true);
            window.removeEventListener('resize', place);
        };
    }, [open]);

    // Keep the highlighted row in view
    useEffect(() => {
        if (open) listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
    }, [active, open, shown.length]);

    function onKeyDown(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open) return openList();
            setActive((a) => Math.min(a + 1, Math.max(shown.length - 1, 0)));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!open) return openList();
            setActive((a) => Math.max(a - 1, 0));
        } else if (e.key === 'Enter') {
            // Never submit the surrounding form from here
            e.preventDefault();
            if (open && shown[active]) choose(shown[active]);
            else if (!open) openList();
        } else if (e.key === 'Escape' && open) {
            e.preventDefault();
            close();
        } else if (e.key === 'Tab') {
            close();
        }
    }

    return (
        <div ref={wrapRef} className={`relative ${className}`}>
            <div
                className={`flex h-full min-h-10 w-full items-center gap-2 rounded-[10px] border bg-white px-3 text-sm dark:bg-slate-950 dark:text-white focus-within:ring-2 focus-within:ring-[#2563EB]/30 ${
                    invalid ? 'border-[#B91C1C]' : 'border-[#6B7280] dark:border-slate-700'
                }`}
            >
                {open && <Search size={15} className="shrink-0 text-[#6B7280] dark:text-slate-400" aria-hidden="true" />}
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    autoComplete="off"
                    value={open ? query : (selected?.label ?? '')}
                    placeholder={open ? (selected?.label ?? placeholder) : placeholder}
                    onFocus={() => !open && openList()}
                    onClick={() => !open && openList()}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setActive(0);
                        if (!open) {
                            place();
                            setOpen(true);
                        }
                    }}
                    onKeyDown={onKeyDown}
                    className="h-full min-w-0 flex-1 truncate border-0 bg-transparent p-0 text-sm outline-none ring-0 placeholder:text-gray-400 focus:ring-0 dark:text-white dark:placeholder-slate-500"
                />
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-[#6B7280] dark:text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </div>

            {open && box && (
                <ul
                    ref={listRef}
                    role="listbox"
                    style={{ position: 'fixed', left: box.left, top: box.top, width: box.width }}
                    className="z-50 max-h-60 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                >
                    {shown.length === 0 && <li className="px-3 py-2 text-sm text-[#6B7280] dark:text-slate-400">{emptyText}</li>}
                    {shown.map((o, i) => (
                        <li
                            key={o.value}
                            role="option"
                            aria-selected={String(o.value) === String(value)}
                            data-active={i === active}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => choose(o)}
                            onMouseEnter={() => setActive(i)}
                            className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${
                                i === active ? 'bg-[#DBEAFE] dark:bg-blue-950/70' : 'dark:text-slate-200'
                            } ${String(o.value) === String(value) ? 'font-semibold text-[#1D4ED8] dark:text-blue-400' : ''}`}
                        >
                            <span className="truncate">{o.label}</span>
                            {o.hint && <span className="shrink-0 text-xs text-[#6B7280] dark:text-slate-400">{o.hint}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
