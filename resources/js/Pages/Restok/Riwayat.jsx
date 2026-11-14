import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Receipt } from 'lucide-react';
import PageTitle from '@/Components/PageTitle';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Riwayat({ purchases, filters }) {
    const [search, setSearch] = useState(filters.cari);

    const shownTotal = purchases.reduce((sum, p) => sum + p.total, 0);

    function applySearch(e) {
        e.preventDefault();
        router.get(route('restok.riwayat'), { cari: search }, { preserveState: true, replace: true });
    }

    return (
        <TriposLayout active="Restok">
            <Head title="Riwayat Restok" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <PageTitle icon={Receipt}>Riwayat Restok</PageTitle>
                        <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">Daftar semua pembelian barang dari supplier.</p>
                    </div>
                    <Link
                        href={route('restok.create')}
                        className="rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E40AF] dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                    >
                        Kembali ke Restok
                    </Link>
                </div>

                <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <form onSubmit={applySearch}>
                        <label htmlFor="cari" className="sr-only">Cari nama supplier</label>
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
                                    <th scope="col" className="px-2 py-3">Tanggal</th>
                                    <th scope="col" className="px-2 py-3">Supplier</th>
                                    <th scope="col" className="px-2 py-3">Jenis barang</th>
                                    <th scope="col" className="px-2 py-3 text-right">Total</th>
                                    <th scope="col" className="px-2 py-3">Dicatat oleh</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map((p) => (
                                    <tr key={p.id} className="border-b border-[#E5E7EB] last:border-b-0 dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                        <td className="px-2 py-3.5 text-gray-900 dark:text-slate-200">{p.date}</td>
                                        <td className="px-2 py-3.5 font-medium text-gray-900 dark:text-slate-100">{p.supplier}</td>
                                        <td className="px-2 py-3.5 text-[#4B5563] dark:text-slate-400">{p.kinds} jenis</td>
                                        <td className="px-2 py-3.5 text-right font-semibold text-gray-900 dark:text-slate-100">{rupiah(p.total)}</td>
                                        <td className="px-2 py-3.5 text-[#4B5563] dark:text-slate-400">{p.by}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {purchases.length === 0 && (
                            <p className="py-8 text-center text-sm text-[#4B5563] dark:text-slate-400">Belum ada riwayat restok.</p>
                        )}
                    </div>

                    {purchases.length > 0 && (
                        <div className="mt-4 flex justify-between border-t border-[#E5E7EB] pt-4 text-sm dark:border-slate-800">
                            <span className="text-[#4B5563] dark:text-slate-400">{purchases.length} pembelian ditampilkan</span>
                            <span className="font-semibold text-gray-900 dark:text-white">Total: {rupiah(shownTotal)}</span>
                        </div>
                    )}
                </section>
            </div>
        </TriposLayout>
    );
}