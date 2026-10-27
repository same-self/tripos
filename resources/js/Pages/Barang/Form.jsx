import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const inputClass = 'h-11 rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm';

function Field({ label, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#4B5563]">{label}</label>
            {children}
            {error && <p className="text-xs text-[#B91C1C]">{error}</p>}
        </div>
    );
}

export default function Form({ item, categories }) {
    const isEdit = item !== null;
    const [preview, setPreview] = useState(item?.image_url ?? null);

    const { data, setData, post, transform, processing, errors } = useForm({
        item_category_id: item?.item_category_id ?? categories[0]?.id ?? '',
        name: item?.name ?? '',
        unit: item?.unit ?? '',
        cost_price: item?.cost_price ?? '',
        sell_price: item?.sell_price ?? '',
        min_stock: item?.min_stock ?? 0,
        gambar: null,
        hapus_gambar: false,
    });

    function chooseFile(e) {
        const file = e.target.files?.[0] ?? null;
        setData('gambar', file);
        setData('hapus_gambar', false);
        setPreview(file ? URL.createObjectURL(file) : (item?.image_url ?? null));
    }

    function removeImage() {
        setData('gambar', null);
        setData('hapus_gambar', true);
        setPreview(null);
    }

    function submit(e) {
        e.preventDefault();

        if (isEdit) {
            // Pictures are sent as a form, so updates use POST with the PUT method spoofed
            transform((d) => ({ ...d, _method: 'put' }));
            post(route('barang.update', item.id), { forceFormData: true });
        } else {
            post(route('barang.store'), { forceFormData: true });
        }
    }

    return (
        <TriposLayout active="Barang">
            <Head title={isEdit ? 'Ubah Barang' : 'Tambah Barang'} />

            <div className="max-w-2xl">
                <h1 className="text-[22px] font-bold">{isEdit ? 'Ubah Barang' : 'Tambah Barang'}</h1>
                <p className="mt-1 text-[13px] text-[#4B5563]">
                    {isEdit
                        ? 'Perbarui nama, satuan, harga, gambar, atau stok minimum.'
                        : 'Isi data barang baru. Stok awal dimulai dari 0 dan diisi lewat menu Restok.'}
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6">
                    <Field label="Gambar barang (opsional)" error={errors.gambar}>
                        <div className="flex items-center gap-4">
                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F3F4F6]">
                                {preview ? (
                                    <img src={preview} alt="Pratinjau gambar" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[#9CA3AF]">
                                        <ImagePlus size={28} aria-hidden="true" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={chooseFile}
                                    className="text-sm"
                                />
                                {preview && (
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-[#B91C1C]"
                                    >
                                        <Trash2 size={14} aria-hidden="true" />
                                        Hapus gambar
                                    </button>
                                )}
                                <p className="text-xs text-[#4B5563]">JPG, PNG, atau WEBP, maksimal 2 MB.</p>
                            </div>
                        </div>
                    </Field>

                    <Field label="Kategori" error={errors.item_category_id}>
                        <select
                            value={data.item_category_id}
                            onChange={(e) => setData('item_category_id', e.target.value)}
                            className={inputClass}
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Nama barang" error={errors.name}>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Satuan" error={errors.unit}>
                        <input
                            type="text"
                            value={data.unit}
                            onChange={(e) => setData('unit', e.target.value)}
                            placeholder="buah, rim, lembar"
                            className={inputClass}
                        />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Harga modal (Rp)" error={errors.cost_price}>
                            <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={data.cost_price}
                                onChange={(e) => setData('cost_price', e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Harga jual (Rp)" error={errors.sell_price}>
                            <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={data.sell_price}
                                onChange={(e) => setData('sell_price', e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                    </div>

                    <Field label="Stok minimum (peringatan menipis)" error={errors.min_stock}>
                        <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={data.min_stock}
                            onChange={(e) => setData('min_stock', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    {isEdit && (
                        <p className="rounded-xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#4B5563]">
                            Stok saat ini: <strong className="text-[#111827]">{item.stock}</strong>. Stok berubah lewat
                            penjualan dan restok.
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href={route('barang.index')}
                            className="rounded-xl border border-[#6B7280] px-4 py-2.5 text-sm font-medium"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {isEdit ? 'Simpan perubahan' : 'Tambah Barang'}
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}
