import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const inputClass = 'h-11 rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]';

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
                <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">{isEdit ? 'Ubah Kategori' : 'Tambah Kategori'}</h1>

                <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-xs font-medium text-[#4B5563] dark:text-slate-300">Nama kategori</label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="misalnya Plastik atau Map"
                            className={inputClass}
                        />
                        {errors.name && <p className="text-xs text-[#B91C1C] dark:text-red-400">{errors.name}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href={route('kategori.index')}
                            className="rounded-xl border border-[#6B7280] px-4 py-2.5 text-sm font-medium dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                        >
                            {isEdit ? 'Simpan perubahan' : 'Tambah Kategori'}
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}
