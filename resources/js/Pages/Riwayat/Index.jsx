import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import EditButton from '@/Components/EditButton';
import { Eye, Receipt } from 'lucide-react';
import PageTitle from '@/Components/PageTitle';
import DateRange from '@/Components/DateRange';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const PERIODS = [
    { key: 'hari', label: 'Hari ini' },
    { key: 'minggu', label: 'Minggu ini' },
    { key: 'semua', label: 'Semua' },
];

export default function Index({ sales, filters, totals }) {
    const [search, setSearch] = useState(filters.cari);

    function applySearch(e) {
        e.preventDefault();
        router.get(
            route('riwayat.index'),
            { periode: filters.periode === 'rentang' ? undefined : filters.periode, dari: filters.dari ?? undefined, sampai: filters.sampai ?? undefined, cari: search },
            { preserveState: true, replace: true },
        );
    }

    return (
        <TriposLayout active="Transaksi (POS)">
            <Head title="Riwayat Transaksi" />

            <PageTitle icon={Receipt}>Riwayat Transaksi</PageTitle>
            <p className="mt-1 text-sm text-[#4B5563] dark:text-slate-400">
                Daftar transaksi penjualan. Pilih transaksi untuk melihat struknya.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-lg bg-[#F3F4F6] p-1 dark:border dark:border-slate-800 dark:bg-slate-900" role="group" aria-label="Periode">
                    {PERIODS.map((p) => (
                        <Link
                            key={p.key}
                            href={route('riwayat.index', { periode: p.key, cari: filters.cari })}
                            preserveState
                            preserveScroll
                            aria-pressed={filters.periode === p.key}
                            className={`rounded-md px-3.5 py-1.5 text-sm transition-colors ${
                                filters.periode === p.key
                                    ? 'bg-white font-semibold text-[#111827] shadow-sm dark:bg-slate-800 dark:text-white'
                                    : 'text-[#4B5563] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            {p.label}
                        </Link>
                    ))}
                </div>

                <form onSubmit={applySearch} className="w-full max-w-sm">
                    <label htmlFor="cari" className="sr-only">
                        Cari nomor transaksi
                    </label>
                    <input
                        id="cari"
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nomor transaksi..."
                        className="w-full rounded-xl border border-[#6B7280] bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                    />
                </form>
            </div>

            <div className="mt-3">
                <DateRange
                    key={`${filters.dari}-${filters.sampai}`}
                    dari={filters.dari}
                    sampai={filters.sampai}
                    onApply={(dari, sampai) => router.get(route('riwayat.index'), { dari, sampai, cari: search || undefined }, { preserveState: true, replace: true })}
                    onClear={() => router.get(route('riwayat.index'), { periode: 'minggu' }, { replace: true })}
                />
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">No. transaksi</th>
                            <th scope="col" className="px-4 py-3">Waktu</th>
                            <th scope="col" className="px-4 py-3">Kasir</th>
                            <th scope="col" className="px-4 py-3">Metode</th>
                            <th scope="col" className="px-4 py-3">Jumlah item</th>
                            <th scope="col" className="px-4 py-3 text-right">Total</th>
                            <th scope="col" className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.data.map((sale) => (
                            <tr key={sale.id} className="border-b border-[#E5E7EB] last:border-b-0 dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{sale.receipt}</td>
                                <td className="px-4 py-3 text-[#4B5563] dark:text-slate-400">{sale.time}</td>
                                <td className="px-4 py-3 text-[#4B5563] dark:text-slate-400">{sale.cashier}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            sale.method_value === 'qris'
                                                ? 'bg-[#DBEAFE] text-[#1D4ED8] dark:bg-blue-950/80 dark:border dark:border-blue-800/60 dark:text-blue-300'
                                                : 'bg-[#F3F4F6] text-[#111827] dark:bg-slate-800 dark:border dark:border-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        {sale.method}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-[#4B5563] dark:text-slate-400">{sale.items} item</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{rupiah(sale.total)}</td>
                                <td className="px-4 py-3 text-right">
                                    <EditButton href={route('riwayat.show', sale.id)} label="Lihat" icon={Eye} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {sales.data.length === 0 && (
                    <p className="py-8 text-center text-sm text-[#4B5563] dark:text-slate-400">Belum ada transaksi.</p>
                )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-[#4B5563] dark:text-slate-400">{totals.count} transaksi ditampilkan</span>

                <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900 dark:text-white">Total: {rupiah(totals.total)}</span>
                    {sales.prev_page_url && (
                        <Link href={sales.prev_page_url} preserveScroll className="font-semibold text-[#1D4ED8] dark:text-blue-400 hover:underline">
                            Sebelumnya
                        </Link>
                    )}
                    {sales.next_page_url && (
                        <Link href={sales.next_page_url} preserveScroll className="font-semibold text-[#1D4ED8] dark:text-blue-400 hover:underline">
                            Berikutnya
                        </Link>
                    )}
                </div>
            </div>
        </TriposLayout>
    );
}