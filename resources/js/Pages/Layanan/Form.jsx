import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, useForm } from '@inertiajs/react';

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

export default function Form({ service, categories }) {
    const isEdit = service !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        service_category_id: service?.service_category_id ?? categories[0]?.id ?? '',
        name: service?.name ?? '',
        unit: service?.unit ?? '',
        unit_price: service?.unit_price ?? '',
    });

    function submit(e) {
        e.preventDefault();

        if (isEdit) {
            put(route('layanan.update', service.id));
        } else {
            post(route('layanan.store'));
        }
    }

    return (
        <TriposLayout active="Layanan">
            <Head title={isEdit ? 'Ubah Layanan' : 'Tambah Layanan'} />

            <div className="max-w-2xl">
                <h1 className="text-[22px] font-bold">{isEdit ? 'Ubah Layanan' : 'Tambah Layanan'}</h1>
                <p className="mt-1 text-[13px] text-[#4B5563]">
                    Nama, kategori, satuan, dan tarif layanan. Bahan yang dipakai diatur terpisah.
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6">
                    <Field label="Kategori" error={errors.service_category_id}>
                        <select
                            value={data.service_category_id}
                            onChange={(e) => setData('service_category_id', e.target.value)}
                            className={inputClass}
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
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
                            <input
                                type="text"
                                value={data.unit}
                                onChange={(e) => setData('unit', e.target.value)}
                                placeholder="lembar, halaman, buah"
                                className={inputClass}
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
                            className="rounded-xl border border-[#6B7280] px-4 py-2.5 text-sm font-medium"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {isEdit ? 'Simpan perubahan' : 'Tambah Layanan'}
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}