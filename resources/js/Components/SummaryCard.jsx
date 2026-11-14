const TONES = {
    blue: 'bg-[#DBEAFE] text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-400',
    green: 'bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-400',
    amber: 'bg-[#FEF3C7] text-[#B45309] dark:bg-amber-950/60 dark:text-amber-400',
    red: 'bg-[#FEE2E2] text-[#B91C1C] dark:bg-red-950/60 dark:text-red-400',
    violet: 'bg-[#EDE9FE] text-[#6D28D9] dark:bg-purple-950/60 dark:text-purple-400',
};

/** A number card with an icon, used at the top of list pages and on the dashboard. */
// Long numbers (a big rupiah total) shrink instead of being cut off, so they stay readable
function sizeFor(value) {
    const length = String(value).length;
    if (length > 17) return 'text-[15px]';
    if (length > 13) return 'text-lg';
    return 'text-[22px]';
}

export default function SummaryCard({ icon: Icon, label, value, tone = 'blue', hint, hintClassName = 'text-[#4B5563] dark:text-slate-400', valueClassName = 'text-gray-900 dark:text-white' }) {
    return (
        <div className="flex items-start gap-3.5 rounded-2xl border border-[#E5E7EB] bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            {Icon && (
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone] ?? TONES.blue}`}>
                    <Icon size={22} strokeWidth={2} aria-hidden="true" />
                </span>
            )}
            <div className="min-w-0">
                <p className="text-xs font-medium text-[#4B5563] dark:text-slate-400">{label}</p>
                <p className={`mt-0.5 break-words font-bold leading-tight tracking-tight ${sizeFor(value)} ${valueClassName}`} title={String(value)}>{value}</p>
                {hint && <p className={`mt-0.5 text-xs ${hintClassName}`}>{hint}</p>}
            </div>
        </div>
    );
}
