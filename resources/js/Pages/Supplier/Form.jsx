import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, MapPin, Phone, Plus, Save, Truck } from 'lucide-react';

const inputClass =
    'h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 transition-all';

function getInitials(name) {
    if (!name) return 'SP';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
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
            <Head title={isEdit ? `Ubah ${supplier.name}` : 'Tambah Supplier Baru'} />

            <div className="max-w-2xl mx-auto flex flex-col gap-6">
                {/* Back Link */}
                <div>
                    <Link
                        href={route('supplier.index', isEdit ? { pilih: supplier.id } : {})}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Kembali ke Data Supplier
                    </Link>
                </div>

                {/* Header Profile / Title */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-bold text-white shadow-md shadow-blue-500/20">
                            {isEdit ? getInitials(supplier.name) : <Truck size={22} />}
                        </div>
                        <div>
                            <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">
                                {isEdit ? 'Ubah Data Supplier' : 'Tambah Supplier Baru'}
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {isEdit
                                    ? `Perbarui kontak dan alamat untuk mitra #${supplier.id}`
                                    : 'Daftarkan mitra distributor atau supplier barang ATK ke dalam sistem'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <form
                    onSubmit={submit}
                    className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90"
                >
                    {/* Nama Supplier */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="name"
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                            <Building2 size={14} className="text-slate-400" />
                            Nama Perusahaan / Supplier <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Toko Grosir ATK Cileungsi / CV Sumber Kertas"
                            className={`${inputClass} ${errors.name ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
                            autoFocus={!isEdit}
                        />
                        {errors.name ? (
                            <p className="text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                        ) : (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                Nama resmi rekanan yang akan ditampilkan pada dropdown restok dan laporan belanja.
                            </p>
                        )}
                    </div>

                    {/* Nomor Telepon / WhatsApp */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="phone_number"
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                            <Phone size={14} className="text-slate-400" />
                            Nomor Telepon / WhatsApp
                        </label>
                        <input
                            id="phone_number"
                            type="text"
                            inputMode="tel"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            placeholder="Contoh: 081200000000"
                            className={`${inputClass} ${
                                errors.phone_number ? 'border-red-500 ring-2 ring-red-500/20' : ''
                            }`}
                        />
                        {errors.phone_number ? (
                            <p className="text-xs text-red-600 dark:text-red-400">{errors.phone_number}</p>
                        ) : (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                Digunakan untuk tombol panggilan cepat dan chat WhatsApp langsung dari aplikasi.
                            </p>
                        )}
                    </div>

                    {/* Alamat Lengkap */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="address"
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                            <MapPin size={14} className="text-slate-400" />
                            Alamat Gudang / Kantor
                        </label>
                        <textarea
                            id="address"
                            rows={3}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Contoh: Jl. Raya Cileungsi No. 45, Kab. Bogor..."
                            className={`rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 transition-all ${
                                errors.address ? 'border-red-500 ring-2 ring-red-500/20' : ''
                            }`}
                        />
                        {errors.address && (
                            <p className="text-xs text-red-600 dark:text-red-400">{errors.address}</p>
                        )}
                    </div>

                    {/* Actions Bar */}
                    <div className="mt-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href={route('supplier.index', isEdit ? { pilih: supplier.id } : {})}
                            className="h-11 inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 active:scale-95 disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all"
                        >
                            {isEdit ? <Save size={16} /> : <Plus size={16} strokeWidth={2.5} />}
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}
