import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Tag } from 'lucide-react';
import PageTitle from '@/Components/PageTitle';
import { ErrorMark } from '@/Components/Field';
import IconPicker from '@/Components/IconPicker';
import ImageField from '@/Components/ImageField';
import CategoryBadge from '@/Components/CategoryBadge';

const inputClass = 'h-11 rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]';

export default function Form({ category, icons = [] }) {
    const isEdit = category !== null;

    const { data, setData, post, transform, processing, errors } = useForm({
        name: category?.name ?? '',
        icon: category?.icon ?? '',
        gambar: null,
        hapus_gambar: false,
    });

    function submit(e) {
        e.preventDefault();

        // Berkas hanya bisa dikirim lewat POST; edit memakai _method=put.
        if (isEdit) {
            transform((d) => ({ ...d, _method: 'put' }));
            post(route('kategori.update', category.id), { forceFormData: true });
        } else {
            post(route('kategori.store'), { forceFormData: true });
        }
    }

    return (
        <TriposLayout active="Barang">
            <Head title={isEdit ? 'Ubah Kategori' : 'Tambah Kategori'} />

            <div className="max-w-xl">
                <PageTitle icon={Tag}>{isEdit ? 'Ubah Kategori' : 'Tambah Kategori'}</PageTitle>

                <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-xs font-medium text-[#4B5563] dark:text-slate-300">Nama kategori<ErrorMark show={!!errors.name} /></label>
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

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-[#4B5563] dark:text-slate-300">Ikon preset</span>
                        <IconPicker icons={icons} value={data.icon} onChange={(v) => setData('icon', v)} />
                        {errors.icon && <p className="text-xs text-[#B91C1C] dark:text-red-400">{errors.icon}</p>}
                        <p className="text-xs text-[#4B5563] dark:text-slate-400">Klik ikon yang dipilih sekali lagi untuk membatalkan (ikon otomatis dipakai).</p>
                    </div>

                    <ImageField
                        label="Atau unggah ikon sendiri (opsional, menggantikan ikon preset)"
                        initialUrl={category?.image_url ?? null}
                        error={errors.gambar}
                        onChange={({ file, remove }) => {
                            setData('gambar', file);
                            setData('hapus_gambar', remove);
                        }}
                    />

                    <div className="flex items-center gap-3 rounded-xl bg-[#F3F4F6] p-3 dark:bg-slate-950/60">
                        <span className="text-xs text-[#4B5563] dark:text-slate-400">Pratinjau:</span>
                        <CategoryBadge name={data.name || 'Kategori'} icon={data.icon || null} />
                        <span className="text-sm font-medium dark:text-white">{data.name || 'Nama kategori'}</span>
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
