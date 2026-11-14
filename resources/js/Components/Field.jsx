/** Tanda "*" merah di samping label saat isian salah. */
export function ErrorMark({ show }) {
    if (!show) return null;
    return (
        <span className="ml-0.5 font-bold text-[#DC2626] dark:text-red-400" aria-hidden="true" title="Isian ini salah">
            *
        </span>
    );
}

/** Label + isian + pesan galat. Bila `error` ada: label diberi "*" merah dan isian berbingkai merah. */
export default function Field({ label, error, hint, children }) {
    return (
        <div className={`flex flex-col gap-1.5 ${error ? 'field-invalid' : ''}`}>
            <label className="text-xs font-medium text-[#4B5563] dark:text-slate-300">
                {label}
                <ErrorMark show={!!error} />
            </label>
            {children}
            {hint && !error && <p className="text-xs text-[#4B5563] dark:text-slate-400">{hint}</p>}
            {error && <p className="text-xs text-[#B91C1C] dark:text-red-400" role="alert">{error}</p>}
        </div>
    );
}
