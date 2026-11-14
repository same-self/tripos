import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import ImageField from '@/Components/ImageField';
import PageTitle from '@/Components/PageTitle';
import SearchSelect from '@/Components/SearchSelect';
import { Package } from 'lucide-react';
import Field from '@/Components/Field';

const inputClass = 'h-11 rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]';

export default function Form({ item, categories, units }) {
    const isEdit = item !== null;

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

    // A unit saved before the fixed list existed stays selectable, so editing doesn't lose it
    const unitOptions = [...(units ?? [])];
    if (data.unit && !unitOptions.some((u) => u.toLowerCase() === String(data.unit).toLowerCase())) {
        unitOptions.unshift(data.unit);
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
                <PageTitle icon={Package}>{isEdit ? 'Ubah Barang' : 'Tambah Barang'}</PageTitle>
                <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                    {isEdit
                        ? 'Perbarui nama, satuan, harga, gambar, atau stok minimum.'
                        : 'Isi data barang baru. Stok awal dimulai dari 0 dan diisi lewat menu Restok.'}
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <ImageField
                        label="Gambar barang (opsional)"
                        initialUrl={item?.image_url ?? null}
                        error={errors.gambar}
                        onChange={({ file, remove }) => {
                            setData('gambar', file);
                            setData('hapus_gambar', remove);
                        }}
                    />


                    <Field label="Kategori" error={errors.item_category_id}>
                        <SearchSelect
                            className="h-11"
                            invalid={!!errors.item_category_id}
                            value={data.item_category_id}
                            onChange={(v) => setData('item_category_id', v)}
                            options={categories.map((c) => ({ value: c.id, label: c.name }))}
                            placeholder="Pilih kategori"
                        />
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
                        <SearchSelect
                            className="h-11"
                            invalid={!!errors.unit}
                            value={data.unit}
                            onChange={(v) => setData('unit', v)}
                            options={unitOptions.map((u) => ({ value: u, label: u }))}
                            placeholder="Pilih satuan"
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
                        <p className="rounded-xl bg-[#F3F4F6] px-4 py-3 text-sm text-[#4B5563] dark:bg-slate-950/60 dark:text-slate-300">
                            Stok saat ini: <strong className="text-[#111827] dark:text-white">{item.stock}</strong>. Stok berubah lewat
                            penjualan dan restok.
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href={route('barang.index')}
                            className="rounded-xl border border-[#6B7280] px-4 py-2.5 text-sm font-medium dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                        >
                            {isEdit ? 'Simpan perubahan' : 'Tambah Barang'}
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}
