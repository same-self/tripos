import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus, Search, Sparkles, Warehouse } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageTitle from '@/Components/PageTitle';
import Pagination, { usePagination } from '@/Components/Pagination';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const STATUS = {
    cepat: { label: 'Cepat laku', cls: 'bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300', dot: 'bg-[#16A34A]' },
    normal: { label: 'Normal', cls: 'bg-[#F3F4F6] text-[#4B5563] dark:bg-slate-800 dark:text-slate-300', dot: 'bg-[#9CA3AF]' },
    lambat: { label: 'Lambat', cls: 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300', dot: 'bg-[#D97706]' },
};

const FILTERS = [
    { key: 'semua', label: 'Semua' },
    { key: 'cepat', label: 'Cepat laku' },
    { key: 'normal', label: 'Normal' },
    { key: 'lambat', label: 'Lambat' },
    { key: 'habis', label: 'Stok habis' },
];

function daysText(item) {
    if (item.out_of_stock) return 'stok habis';
    if (item.days_left === 0) return 'habis hari ini';
    return `sisa ±${item.days_left} hari`;
}

function RestokCard({ tag, tagClass, description, items, emptyText }) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${tagClass}`}>{tag}</span>
            <p className="text-xs text-[#4B5563] dark:text-slate-400">{description}</p>

            {items.length === 0 && <p className="text-sm text-[#4B5563] dark:text-slate-400">{emptyText}</p>}

            {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-0.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-gray-900 dark:text-slate-100">{item.name}</span>
                        <span
                            className={`whitespace-nowrap text-xs ${
                                item.out_of_stock ? 'font-semibold text-[#B91C1C] dark:text-red-400' : 'text-[#4B5563] dark:text-slate-400'
                            }`}
                        >
                            {daysText(item)}
                        </span>
                    </div>
                    <span className="text-xs text-[#4B5563] dark:text-slate-400">
                        Terjual ±{item.per_day}/hari · saran beli{' '}
                        <strong className="text-[#1D4ED8] dark:text-blue-400">
                            {item.suggested_qty} {item.unit}
                        </strong>
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function Index({ items, restokSegera, restokNanti, window, segeraDays, thresholds }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('semua');

    const counts = useMemo(
        () => ({
            cepat: items.filter((i) => i.status === 'cepat').length,
            normal: items.filter((i) => i.status === 'normal').length,
            lambat: items.filter((i) => i.status === 'lambat').length,
        }),
        [items],
    );

    const shown = useMemo(() => {
        const q = search.trim().toLowerCase();

        return items.filter((i) => {
            if (q && !i.name.toLowerCase().includes(q)) return false;
            if (filter === 'habis') return i.out_of_stock;
            return filter === 'semua' || i.status === filter;
        });
    }, [items, search, filter]);

    const pager = usePagination(shown.length, 15);
    useEffect(() => pager.setPage(1), [search, filter]);

    // One click opens the restock form already filled with the suggested quantities
    const suggestion = [...restokSegera, ...restokNanti]
        .filter((i) => i.suggested_qty > 0)
        .map((i) => `${i.id}:${i.suggested_qty}`)
        .join(',');

    return (
        <TriposLayout active="Stok">
            <Head title="Stok" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <PageTitle icon={Warehouse}>Stok Barang</PageTitle>
                        <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                            Stok, penjualan, dan rekomendasi {window} hari terakhir.
                        </p>
                    </div>
                    <Link
                        href={route('restok.create')}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1E40AF] dark:bg-blue-600 dark:hover:bg-blue-500"
                    >
                        <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                        Tambah Restok
                    </Link>
                </div>

                <div className="flex flex-col gap-5 lg:flex-row">
                    {/* Restock recommendations */}
                    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[310px]">
                        <div className="flex items-start gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDE9FE] text-[#6D28D9] dark:bg-purple-950/60 dark:text-purple-300">
                                <Sparkles size={16} aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Rekomendasi AI</h2>
                                <p className="text-xs text-[#4B5563] dark:text-slate-400">
                                    Dihitung dari penjualan {window} hari terakhir. Saran beli = cukup untuk {window} hari.
                                </p>
                            </div>
                        </div>

                        <RestokCard
                            tag="Restok segera"
                            tagClass="bg-[#FEE2E2] text-[#B91C1C] dark:bg-red-950/60 dark:text-red-300"
                            description={`Stok habis atau sisa sampai ${segeraDays} hari. Segera restok.`}
                            items={restokSegera}
                            emptyText="Tidak ada barang yang perlu direstok segera."
                        />

                        <RestokCard
                            tag="Restok nanti"
                            tagClass="bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300"
                            description={`Sisa stok ${segeraDays + 1} sampai ${window} hari.`}
                            items={restokNanti}
                            emptyText="Tidak ada barang untuk direstok nanti."
                        />

                        {suggestion && (
                            <Link
                                href={route('restok.create', { isi: suggestion })}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#93C5FD] bg-[#DBEAFE] px-4 py-2.5 text-sm font-semibold text-[#1D4ED8] transition-colors hover:bg-[#BFDBFE] dark:border-blue-700/60 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/50"
                            >
                                <Plus size={16} aria-hidden="true" />
                                Restok sesuai saran
                            </Link>
                        )}

                        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-[13px] font-semibold text-[#111827] dark:text-white">Ambang Batas Status ({window} Hari)</h3>
                            <p className="mt-1 text-xs text-[#4B5563] dark:text-slate-400">
                                Dilihat dari jumlah terjual selama {window} hari. Angkanya bisa diubah di pengaturan.
                            </p>
                            <ul className="mt-3 flex flex-col gap-2 text-xs">
                                <li className="flex items-center justify-between">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS.cepat.cls}`}>Cepat laku</span>
                                    <span className="font-medium text-[#4B5563] dark:text-slate-300">&ge; {thresholds.fast} unit</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS.normal.cls}`}>Normal</span>
                                    <span className="font-medium text-[#4B5563] dark:text-slate-300">
                                        {thresholds.slow} – {thresholds.fast - 1} unit
                                    </span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS.lambat.cls}`}>Lambat</span>
                                    <span className="font-medium text-[#4B5563] dark:text-slate-300">&lt; {thresholds.slow} unit</span>
                                </li>
                            </ul>
                        </div>
                    </aside>

                    {/* Stock table */}
                    <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Status barang">
                                {FILTERS.map((f) => (
                                    <button
                                        key={f.key}
                                        type="button"
                                        onClick={() => setFilter(f.key)}
                                        aria-pressed={filter === f.key}
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                                            filter === f.key
                                                ? 'bg-[#1D4ED8] font-semibold text-white dark:bg-blue-600'
                                                : 'border border-[#E5E7EB] bg-white font-medium text-[#4B5563] hover:bg-[#F3F4F6] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {STATUS[f.key] && <span className={`h-2 w-2 rounded-full ${STATUS[f.key].dot}`} />}
                                        {f.label}
                                        {STATUS[f.key] && <span className="opacity-70">{counts[f.key]}</span>}
                                    </button>
                                ))}
                            </div>

                            <label className="flex items-center gap-2 rounded-[10px] border border-[#6B7280] bg-white px-3 focus-within:border-[#1D4ED8] focus-within:ring-1 focus-within:ring-[#1D4ED8] dark:border-slate-700 dark:bg-slate-950">
                                <Search size={15} className="text-[#6B7280] dark:text-slate-400" aria-hidden="true" />
                                <span className="sr-only">Cari barang</span>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari barang..."
                                    className="w-40 border-0 bg-transparent py-2 text-sm focus:ring-0 dark:text-white dark:placeholder-slate-500"
                                />
                            </label>
                        </div>

                        <table className="mt-4 w-full text-left text-sm">
                            <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                                <tr>
                                    <th scope="col" className="px-2 py-3">Barang</th>
                                    <th scope="col" className="px-2 py-3">Stok</th>
                                    <th scope="col" className="px-2 py-3">Terjual {window} hari</th>
                                    <th scope="col" className="px-2 py-3">Status</th>
                                    <th scope="col" className="px-2 py-3">Harga modal</th>
                                    <th scope="col" className="px-2 py-3">Harga jual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shown.map((item, i) => (
                                    <tr key={item.id} className={`${pager.rowClass(i)} border-b border-[#E5E7EB] transition-colors last:border-b-0 hover:bg-gray-50/50 dark:border-slate-800/80 hover:dark:bg-slate-800/40`}>
                                        <td className="px-2 py-3.5 font-medium text-gray-900 dark:text-slate-100">{item.name}</td>
                                        <td className="px-2 py-3.5">
                                            {item.out_of_stock ? (
                                                <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-xs font-semibold text-[#B91C1C] dark:bg-red-950/60 dark:text-red-300">
                                                    Habis
                                                </span>
                                            ) : (
                                                <span className={item.low_stock ? 'font-semibold text-[#B45309] dark:text-amber-400' : 'text-gray-900 dark:text-slate-200'}>
                                                    {item.stock} {item.unit}
                                                    {item.low_stock && <span className="ml-1.5 text-xs">menipis</span>}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-3.5 text-gray-900 dark:text-slate-200">{item.sold}</td>
                                        <td className="px-2 py-3.5">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[item.status].cls}`}>
                                                {STATUS[item.status].label}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3.5 text-gray-900 dark:text-slate-200">{rupiah(item.cost_price)}</td>
                                        <td className="px-2 py-3.5 font-semibold text-gray-900 dark:text-slate-100">{rupiah(item.sell_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {shown.length === 0 && (
                            <p className="py-8 text-center text-sm text-[#4B5563] dark:text-slate-400">
                                {items.length === 0 ? 'Belum ada barang.' : 'Tidak ada barang yang cocok.'}
                            </p>
                        )}
                        <Pagination pager={pager} />
                    </section>
                </div>
            </div>
        </TriposLayout>
    );
}
