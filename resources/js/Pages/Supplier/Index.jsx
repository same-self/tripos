import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import EditButton from '@/Components/EditButton';
import { Plus, Trash2 } from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Index({ suppliers, detail, filters }) {
    const [search, setSearch] = useState(filters.cari);

    function go(changes) {
        router.get(
            route('supplier.index'),
            { cari: filters.cari, pilih: filters.pilih, ...changes },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function remove(supplier) {
        if (window.confirm(`Hapus supplier "${supplier.name}"? Riwayat pembelian tetap tersimpan.`)) {
            router.delete(route('supplier.destroy', supplier.id), { preserveScroll: true });
        }
    }

    return (
        <TriposLayout active="Supplier">
            <Head title="Supplier" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Supplier</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                            Kelola data pemasok barang ATK, termasuk kontak dan riwayat pembelian.
                        </p>
                    </div>
                    <Link
                        href={route('supplier.create')}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E40AF] dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                    >
                        <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                        Tambah Supplier
                    </Link>
                </div>

                <div className="flex flex-col gap-5 lg:flex-row">
                    {/* Supplier list */}
                    <section className="min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                go({ cari: search });
                            }}
                        >
                            <label htmlFor="cari" className="sr-only">
                                Cari nama supplier
                            </label>
                            <input
                                id="cari"
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama supplier..."
                                className="w-full rounded-[10px] border border-[#6B7280] px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                            />
                        </form>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                                    <tr>
                                        <th scope="col" className="px-2 py-3">Nama supplier</th>
                                        <th scope="col" className="px-2 py-3">Telepon</th>
                                        <th scope="col" className="px-2 py-3">Pembelian terakhir</th>
                                        <th scope="col" className="px-2 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.map((s) => {
                                        const selected = s.id === filters.pilih;
                                        return (
                                            <tr
                                                key={s.id}
                                                className={`border-b border-[#E5E7EB] last:border-b-0 dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors ${
                                                    selected ? 'bg-[#DBEAFE] dark:bg-blue-950/50' : ''
                                                }`}
                                            >
                                                <td className="px-2 py-3.5">
                                                    <Link
                                                        href={route('supplier.index', { cari: filters.cari, pilih: s.id })}
                                                        preserveScroll
                                                        className={`font-medium ${selected ? 'text-[#1D4ED8] dark:text-blue-400' : 'text-[#111827] dark:text-slate-100'}`}
                                                    >
                                                        {s.name}
                                                    </Link>
                                                </td>
                                                <td className="px-2 py-3.5 text-[#4B5563] dark:text-slate-400">{s.phone ?? '-'}</td>
                                                <td className="px-2 py-3.5 text-gray-900 dark:text-slate-200">{s.last_purchase ?? 'Belum ada'}</td>
                                                <td className="px-2 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <EditButton href={route('supplier.edit', s.id)} />
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(s)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-2.5 py-1.5 text-[13px] font-semibold text-[#B91C1C] hover:bg-[#FECACA] dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                                        >
                                                            <Trash2 size={14} strokeWidth={2.25} aria-hidden="true" />
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {suppliers.length === 0 && (
                                <p className="py-8 text-center text-sm text-[#4B5563] dark:text-slate-400">Tidak ada supplier yang cocok.</p>
                            )}
                        </div>
                    </section>

                    {/* Selected supplier details */}
                    <aside className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-[320px] dark:border-slate-800 dark:bg-slate-900">
                        {detail ? (
                            <>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{detail.name}</h2>

                                <div className="flex flex-col gap-2.5 text-sm">
                                    <div>
                                        <p className="text-xs text-[#4B5563] dark:text-slate-400">Telepon</p>
                                        <p className="text-gray-900 dark:text-slate-200">{detail.phone ?? '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#4B5563] dark:text-slate-400">Alamat</p>
                                        <p className="text-gray-900 dark:text-slate-200">{detail.address ?? '-'}</p>
                                    </div>
                                </div>

                                <div className="h-px bg-[#E5E7EB] dark:bg-slate-800" />

                                <p className="text-[13px] font-semibold text-gray-900 dark:text-slate-200">Riwayat pembelian</p>

                                {detail.purchases.length === 0 && (
                                    <p className="text-sm text-[#4B5563] dark:text-slate-400">Belum ada pembelian dari supplier ini.</p>
                                )}

                                {detail.purchases.map((p, i) => (
                                    <div key={i} className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{p.date}</p>
                                            <p className="text-xs text-[#4B5563] dark:text-slate-400">{p.kinds} jenis barang</p>
                                        </div>
                                        <p className="whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-slate-100">{rupiah(p.total)}</p>
                                    </div>
                                ))}

                                <Link
                                    href={route('supplier.edit', detail.id)}
                                    className="rounded-[10px] border border-[#6B7280] py-2.5 text-center text-sm font-medium dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Ubah Data
                                </Link>
                            </>
                        ) : (
                            <p className="text-sm text-[#4B5563] dark:text-slate-400">
                                Pilih supplier di daftar untuk melihat kontak dan riwayat pembeliannya.
                            </p>
                        )}
                    </aside>
                </div>
            </div>
        </TriposLayout>
    );
}