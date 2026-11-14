import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    ChevronDown,
    ChevronRight,
    History,
    Package,
    PackagePlus,
    ReceiptText,
    Search,
    TrendingUp,
    Truck,
    User,
} from 'lucide-react';
import { useState } from 'react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Riwayat({ purchases, filters }) {
    const [search, setSearch] = useState(filters.cari || '');
    const [expandedIds, setExpandedIds] = useState(new Set());

    const shownTotal = purchases.reduce((sum, p) => sum + p.total, 0);
    const avgTotal = purchases.length > 0 ? Math.round(shownTotal / purchases.length) : 0;

    function applySearch(e) {
        e.preventDefault();
        router.get(route('restok.riwayat'), { cari: search }, { preserveState: true, replace: true });
    }

    function toggleExpand(id) {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    return (
        <TriposLayout active="Restok">
            <Head title="Riwayat Restok" />

            <div className="flex flex-col gap-6">
                {/* Header with Segmented Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">Riwayat Restok</h1>
                        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                            Daftar semua faktur pembelian barang dan restok dari supplier.
                        </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800">
                        <Link
                            href={route('restok.create')}
                            className="flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all"
                        >
                            <PackagePlus size={14} />
                            Catat Restok
                        </Link>
                        <span className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white">
                            <History size={14} className="text-blue-600 dark:text-blue-400" />
                            Riwayat Restok
                        </span>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                    <div className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pembelian</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <ReceiptText size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {rupiah(shownTotal)}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">Dari {purchases.length} faktur restok</p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Jumlah Transaksi</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                <History size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {purchases.length} Transaksi
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">Tercatat di sistem</p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Rata-rata per Restok</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <TrendingUp size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {rupiah(avgTotal)}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">Rata-rata nilai faktur</p>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90 overflow-hidden">
                    {/* Search toolbar */}
                    <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                        <form onSubmit={applySearch} className="relative max-w-sm">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <input
                                id="cari"
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama supplier..."
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 transition-all"
                            />
                        </form>
                    </div>

                    {/* Purchases Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                                <tr>
                                    <th scope="col" className="px-4 py-3 w-10"></th>
                                    <th scope="col" className="px-4 py-3">Tanggal</th>
                                    <th scope="col" className="px-4 py-3">Supplier</th>
                                    <th scope="col" className="px-4 py-3">Variasi Barang</th>
                                    <th scope="col" className="px-4 py-3 text-right">Total Pembelian</th>
                                    <th scope="col" className="px-4 py-3">Dicatat Oleh</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {purchases.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                                            Belum ada riwayat restok yang cocok dengan pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    purchases.map((p) => {
                                        const isExpanded = expandedIds.has(p.id);

                                        return (
                                            <>
                                                <tr
                                                    key={p.id}
                                                    onClick={() => toggleExpand(p.id)}
                                                    className="cursor-pointer transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                                                >
                                                    <td className="px-4 py-3.5 text-slate-400 dark:text-slate-500">
                                                        {isExpanded ? (
                                                            <ChevronDown size={16} className="text-blue-600 dark:text-blue-400" />
                                                        ) : (
                                                            <ChevronRight size={16} />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        <span className="font-semibold text-slate-900 dark:text-white">
                                                            {p.date}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                                                <Truck size={14} />
                                                            </div>
                                                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                                                {p.supplier}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                            <Package size={12} className="shrink-0" />
                                                            {p.kinds} jenis barang
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                                                            {rupiah(p.total)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <User size={13} className="text-slate-400" />
                                                            <span>{p.by}</span>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded Details Sub-table */}
                                                {isExpanded && p.items && p.items.length > 0 && (
                                                    <tr className="bg-slate-50/80 dark:bg-slate-950/40">
                                                        <td colSpan={6} className="px-6 py-4">
                                                            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
                                                                <p className="text-xs font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-1.5">
                                                                    <ReceiptText size={14} className="text-blue-600 dark:text-blue-400" />
                                                                    Rincian Barang yang Diterima
                                                                </p>
                                                                <table className="w-full text-xs">
                                                                    <thead>
                                                                        <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
                                                                            <th className="pb-1.5 text-left font-medium">Nama Barang</th>
                                                                            <th className="pb-1.5 text-right font-medium">Jumlah</th>
                                                                            <th className="pb-1.5 text-right font-medium">Harga Beli</th>
                                                                            <th className="pb-1.5 text-right font-medium">Subtotal</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                                                        {p.items.map((it, idx) => (
                                                                            <tr key={idx} className="text-slate-700 dark:text-slate-300">
                                                                                <td className="py-2 font-medium">{it.name}</td>
                                                                                <td className="py-2 text-right tabular-nums">
                                                                                    {it.qty} {it.unit}
                                                                                </td>
                                                                                <td className="py-2 text-right tabular-nums text-slate-500 dark:text-slate-400">
                                                                                    {rupiah(it.price)}
                                                                                </td>
                                                                                <td className="py-2 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                                                                                    {rupiah(it.subtotal)}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {purchases.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 px-5 py-3.5 text-xs dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">
                                Menampilkan {purchases.length} transaksi restok
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                                Total Akumulasi: <span className="tabular-nums font-bold">{rupiah(shownTotal)}</span>
                            </span>
                        </div>
                    )}
                </section>
            </div>
        </TriposLayout>
    );
}
