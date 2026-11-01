const TONES = {
    blue: 'bg-[#DBEAFE] text-[#1D4ED8]',
    green: 'bg-[#DCFCE7] text-[#15803D]',
    amber: 'bg-[#FEF3C7] text-[#B45309]',
    red: 'bg-[#FEE2E2] text-[#B91C1C]',
    violet: 'bg-[#EDE9FE] text-[#6D28D9]',
};

/** A number card with an icon, used at the top of list pages and on the dashboard. */
export default function SummaryCard({ icon: Icon, label, value, tone = 'blue', hint, hintClassName = 'text-[#4B5563]', valueClassName = '' }) {
    return (
        <div className="flex items-start gap-3.5 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            {Icon && (
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone] ?? TONES.blue}`}>
                    <Icon size={22} strokeWidth={2} aria-hidden="true" />
                </span>
            )}
            <div className="min-w-0">
                <p className="text-xs font-medium text-[#4B5563]">{label}</p>
                <p className={`mt-0.5 truncate text-[22px] font-bold ${valueClassName}`} title={String(value)}>{value}</p>
                {hint && <p className={`mt-0.5 text-xs ${hintClassName}`}>{hint}</p>}
            </div>
        </div>
    );
}
