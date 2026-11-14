import { CalendarDays } from 'lucide-react';
import { useState } from 'react';

const inputClass =
    'h-9 rounded-lg border border-[#6B7280] bg-white px-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:[color-scheme:dark] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]';

/** Pilih rentang tanggal lewat kalender bawaan browser. onApply(dari, sampai) dipanggil saat "Terapkan". */
export default function DateRange({ dari = '', sampai = '', onApply, onClear }) {
    const [from, setFrom] = useState(dari ?? '');
    const [to, setTo] = useState(sampai ?? '');
    const today = new Date().toISOString().slice(0, 10);

    function submit(e) {
        e.preventDefault();
        if (from || to) onApply(from, to);
    }

    return (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2 print:hidden">
            <CalendarDays size={16} className="text-[#4B5563] dark:text-slate-400" aria-hidden="true" />
            <label className="sr-only" htmlFor="dari">Dari tanggal</label>
            <input id="dari" type="date" value={from} max={to || today} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
            <span className="text-sm text-[#4B5563] dark:text-slate-400">s/d</span>
            <label className="sr-only" htmlFor="sampai">Sampai tanggal</label>
            <input id="sampai" type="date" value={to} min={from || undefined} max={today} onChange={(e) => setTo(e.target.value)} className={inputClass} />
            <button type="submit" disabled={!from && !to} className="h-9 rounded-lg bg-[#1D4ED8] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF] disabled:opacity-50 dark:bg-blue-600">
                Terapkan
            </button>
            {(dari || sampai) && (
                <button type="button" onClick={onClear} className="h-9 rounded-lg border border-[#6B7280] px-3 text-sm font-medium dark:border-slate-700 dark:text-slate-300">
                    Hapus
                </button>
            )}
        </form>
    );
}
