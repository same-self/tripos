import { ICON_MAP } from '@/Components/categoryIconMap';

/** Pilih ikon preset untuk kategori. `value` = kunci ikon atau '' (otomatis). */
export default function IconPicker({ icons, value, onChange }) {
    return (
        <div role="radiogroup" aria-label="Ikon kategori" className="grid grid-cols-7 gap-2 sm:grid-cols-9">
            {icons.map((key) => {
                const Icon = ICON_MAP[key];
                if (!Icon) return null;
                const active = value === key;
                return (
                    <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        title={key}
                        onClick={() => onChange(active ? '' : key)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all hover:scale-105 ${
                            active
                                ? 'border-[#1D4ED8] bg-[#DBEAFE] text-[#1D4ED8] ring-2 ring-[#1D4ED8]/30 dark:border-blue-500 dark:bg-blue-950/70 dark:text-blue-300'
                                : 'border-[#D1D5DB] bg-white text-[#4B5563] hover:border-[#1D4ED8] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                        }`}
                    >
                        <Icon size={18} aria-hidden="true" />
                    </button>
                );
            })}
        </div>
    );
}
