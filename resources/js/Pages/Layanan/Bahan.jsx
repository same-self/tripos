import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const inputClass = 'h-11 rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]';

export default function Bahan({ service, materials, items }) {
    const { data, setData, put, processing, errors } = useForm({
        materials: materials.map((m) => ({
            item_id: String(m.item_id),
            quantity: String(m.quantity),
        })),
    });

    function addRow() {
        setData('materials', [...data.materials, { item_id: '', quantity: '' }]);
    }

    function removeRow(index) {
        setData('materials', data.materials.filter((_, i) => i !== index));
    }

    function updateRow(index, field, value) {
        setData(
            'materials',
            data.materials.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
        );
    }

    function submit(e) {
        e.preventDefault();
        put(route('layanan.bahan.update', service.id));
    }

    return (
        <TriposLayout active="Layanan">
            <Head title="Ubah Bahan" />

            <div className="max-w-3xl">
                <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Ubah Bahan</h1>
                <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">{service.name}</p>

                <form
                    onSubmit={submit}
                    className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                    <p className="text-sm text-[#4B5563] dark:text-slate-400">
                        Isi jumlah bahan yang terpakai untuk setiap {service.unit} layanan. Contoh: 0,002 rim per
                        lembar, atau 1 lembar per lembar.
                    </p>

                    {data.materials.length === 0 && (
                        <p className="rounded-xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#4B5563] dark:bg-slate-950/60 dark:text-slate-300">
                            Layanan ini belum memakai bahan.
                        </p>
                    )}

                    {data.materials.map((row, index) => (
                        <div key={index} className="grid gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-start">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-[#4B5563] dark:text-slate-300">Bahan</label>
                                <select
                                    value={row.item_id}
                                    onChange={(e) => updateRow(index, 'item_id', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Pilih bahan</option>
                                    {items.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} ({item.unit})
                                        </option>
                                    ))}
                                </select>
                                {errors[`materials.${index}.item_id`] && (
                                    <p className="text-xs text-[#B91C1C] dark:text-red-400">{errors[`materials.${index}.item_id`]}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-[#4B5563] dark:text-slate-300">Jumlah per {service.unit}</label>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    inputMode="decimal"
                                    value={row.quantity}
                                    onChange={(e) => updateRow(index, 'quantity', e.target.value)}
                                    className={inputClass}
                                />
                                {errors[`materials.${index}.quantity`] && (
                                    <p className="text-xs text-[#B91C1C] dark:text-red-400">{errors[`materials.${index}.quantity`]}</p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                className="h-11 rounded-xl border border-[#6B7280] px-4 text-sm font-medium text-[#B91C1C] dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
                            >
                                Hapus
                            </button>
                        </div>
                    ))}

                    {errors.materials && <p className="text-xs text-[#B91C1C] dark:text-red-400">{errors.materials}</p>}

                    <button
                        type="button"
                        onClick={addRow}
                        className="self-start text-sm font-semibold text-[#1D4ED8] dark:text-blue-400 hover:underline"
                    >
                        + Tambah bahan
                    </button>

                    <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] pt-4 dark:border-slate-800">
                        <Link
                            href={route('layanan.index', { pilih: service.id })}
                            className="rounded-xl border border-[#6B7280] px-4 py-2.5 text-sm font-medium dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                        >
                            Simpan bahan
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}