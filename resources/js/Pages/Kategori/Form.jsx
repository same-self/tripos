import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const inputClass = 'h-11 rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm';

export default function Form({ category }) {
    const isEdit = category !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? '',
    });

    function submit(e) {
        e.preventDefault();

        if (isEdit) {
            put(route('kategori.update', category.id));
        } else {
            post(route('kategori.store'));
        }
    }

    return (
        <TriposLayout active="Barang">
            <Head title={isEdit ? 'Ubah Kategori' : 'Tambah Kategori'} />

            <div className="max-w-xl">
                <h1 className="text-[22px] font-bold">{isEdit ? 'Ubah Kategori' : 'Tambah Kategori'}</h1>

                <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-xs font-medium text-[#4B5563]">Nama kategori</label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="misalnya Plastik atau Map"
                            className={inputClass}
                        />
                        {errors.name && <p className="text-xs text-[#B91C1C]">{errors.name}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href={route('kategori.index')}
                            className="rounded-xl border border-[#6B7280] px-4 py-2.5 text-sm font-medium"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {isEdit ? 'Simpan perubahan' : 'Tambah Kategori'}
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}
