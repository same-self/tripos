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

export default function Form({ supplier }) {
    const isEdit = supplier !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name: supplier?.name ?? '',
        phone_number: supplier?.phone_number ?? '',
        address: supplier?.address ?? '',
    });

    function submit(e) {
        e.preventDefault();

        if (isEdit) {
            put(route('supplier.update', supplier.id));
        } else {
            post(route('supplier.store'));
        }
    }

    return (
        <TriposLayout active="Supplier">
            <Head title={isEdit ? 'Ubah Supplier' : 'Tambah Supplier'} />

            <div className="max-w-2xl">
                <h1 className="text-[22px] font-bold">{isEdit ? 'Ubah Supplier' : 'Tambah Supplier'}</h1>
                <p className="mt-1 text-[13px] text-[#4B5563]">
                    Nama, telepon, dan alamat supplier. Riwayat pembelian diisi lewat menu Restok.
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6">
                    <Field label="Nama supplier" error={errors.name}>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Telepon" error={errors.phone_number}>
                        <input
                            type="text"
                            inputMode="tel"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Alamat" error={errors.address}>
                        <textarea
                            rows={3}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="rounded-xl border border-[#6B7280] bg-white px-3.5 py-2.5 text-sm"
                        />
                    </Field>

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href={route('supplier.index')}
                            className="rounded-xl border border-[#6B7280] px-4 py-2.5 text-sm font-medium"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {isEdit ? 'Simpan perubahan' : 'Tambah Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}