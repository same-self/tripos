import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import ImageField from '@/Components/ImageField';
import PageTitle from '@/Components/PageTitle';
import SearchSelect from '@/Components/SearchSelect';
import { Wrench } from 'lucide-react';
import Field from '@/Components/Field';

const inputClass = 'h-11 rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]';

export default function Form({ service, categories, units }) {
    const isEdit = service !== null;

    const { data, setData, post, transform, processing, errors } = useForm({
        service_category_id: service?.service_category_id ?? categories[0]?.id ?? '',
        name: service?.name ?? '',
        unit: service?.unit ?? '',
        unit_price: service?.unit_price ?? '',
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
            // A picture is sent as a form, and PHP does not read forms sent with PUT,
            // so the update goes out as POST with the PUT method written inside it
            transform((d) => ({ ...d, _method: 'put' }));
            post(route('layanan.update', service.id), { forceFormData: true });
        } else {
            post(route('layanan.store'), { forceFormData: true });
        }
    }

    return (
        <TriposLayout active="Layanan">
            <Head title={isEdit ? 'Ubah Layanan' : 'Tambah Layanan'} />

            <div className="max-w-2xl">
                <PageTitle icon={Wrench}>{isEdit ? 'Ubah Layanan' : 'Tambah Layanan'}</PageTitle>
                <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                    Nama, kategori, satuan, dan tarif layanan. Bahan yang dipakai diatur terpisah.
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <ImageField
                        label="Gambar layanan (opsional)"
                        initialUrl={service?.image_url ?? null}
                        placeholder={Wrench}
                        error={errors.gambar}
                        onChange={({ file, remove }) => {
                            setData('gambar', file);
                            setData('hapus_gambar', remove);
                        }}
                    />

                    <Field label="Kategori" error={errors.service_category_id}>
                        <SearchSelect
                            className="h-11"
                            invalid={!!errors.service_category_id}
                            value={data.service_category_id}
                            onChange={(v) => setData('service_category_id', v)}
                            options={categories.map((c) => ({ value: c.id, label: c.name }))}
                            placeholder="Pilih kategori"
                        />
                    </Field>

                    <Field label="Nama layanan" error={errors.name}>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
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
                        <Field label="Tarif per satuan (Rp)" error={errors.unit_price}>
                            <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={data.unit_price}
                                onChange={(e) => setData('unit_price', e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href={route('layanan.index')}
                            className="rounded-xl border border-[#6B7280] px-4 py-2.5 text-sm font-medium dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                        >
                            {isEdit ? 'Simpan perubahan' : 'Tambah Layanan'}
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}