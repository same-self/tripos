import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Picture picker with a preview, used on the Barang and Layanan forms.
 *
 * It reports changes through onChange({ file, remove }):
 *   - file:   the newly chosen File, or null
 *   - remove: true when the picture that was saved before should be deleted
 * The server decides the rest (see HasImage on the Laravel side).
 */
export default function ImageField({
    label = 'Gambar (opsional)',
    initialUrl = null,
    onChange,
    error,
    maxMb = 2,
    placeholder: Placeholder = ImagePlus,
}) {
    const [preview, setPreview] = useState(initialUrl);
    const [localError, setLocalError] = useState(null);
    const [inputKey, setInputKey] = useState(0); // changing the key clears the file input
    const objectUrl = useRef(null);

    function release() {
        if (objectUrl.current) {
            URL.revokeObjectURL(objectUrl.current);
            objectUrl.current = null;
        }
    }

    useEffect(() => release, []);

    function pick(e) {
        const file = e.target.files?.[0] ?? null;
        setLocalError(null);

        if (!file) return;

        // The same limit the server enforces, checked first so nobody waits for a big upload to fail
        if (file.size > maxMb * 1024 * 1024) {
            setLocalError(`Ukuran gambar maksimal ${maxMb} MB.`);
            setInputKey((k) => k + 1);
            return;
        }

        release();
        objectUrl.current = URL.createObjectURL(file);
        setPreview(objectUrl.current);
        onChange({ file, remove: false });
    }

    function remove() {
        release();
        setPreview(null);
        setLocalError(null);
        setInputKey((k) => k + 1);
        onChange({ file: null, remove: initialUrl !== null });
    }

    const message = localError ?? error;

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#4B5563] dark:text-slate-400">{label}</span>

            <div className="flex items-center gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] dark:border-slate-700 dark:bg-slate-800">
                    {preview ? (
                        <img src={preview} alt="Pratinjau gambar" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#9CA3AF]">
                            <Placeholder size={28} aria-hidden="true" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-start gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#93C5FD] bg-[#DBEAFE] px-3 py-2 text-[13px] font-semibold text-[#1D4ED8] hover:bg-[#BFDBFE] dark:border-blue-700/60 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/50 focus-within:outline focus-within:outline-2 focus-within:outline-[#1D4ED8]">
                        <ImagePlus size={16} strokeWidth={2.25} aria-hidden="true" />
                        {preview ? 'Ganti gambar' : 'Pilih gambar'}
                        <input
                            key={inputKey}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={pick}
                            className="sr-only"
                        />
                    </label>

                    {preview && (
                        <button
                            type="button"
                            onClick={remove}
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#B91C1C] dark:text-red-400"
                        >
                            <Trash2 size={14} aria-hidden="true" />
                            Hapus gambar
                        </button>
                    )}

                    <p className="text-xs text-[#4B5563] dark:text-slate-400">JPG, PNG, atau WEBP, maksimal {maxMb} MB.</p>
                </div>
            </div>

            {message && <p className="text-xs text-[#B91C1C]">{message}</p>}
        </div>
    );
}
