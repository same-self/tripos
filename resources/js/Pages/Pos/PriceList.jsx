import CashierLayout from '@/Layouts/CashierLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const FILTERS = [
    { key: 'semua', label: 'Semua' },
    { key: 'barang', label: 'Barang ATK' },
    { key: 'jasa', label: 'Jasa Fotokopi' },
];

export default function PriceList({ rows }) {
    const [filter, setFilter] = useState('semua');
    const [search, setSearch] = useState('');
    const searchRef = useRef(null);

    // Pressing "/" anywhere jumps to the search box, as the design hint says
    useEffect(() => {
        function handleKey(event) {
            const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
            if (event.key === '/' && !typing) {
                event.preventDefault();
                searchRef.current?.focus();
            }
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const keyword = search.trim().toLowerCase();
    const shown = rows.filter(
        (row) =>
            (filter === 'semua' || row.kind === filter) &&
            (row.name.toLowerCase().includes(keyword) || row.category.toLowerCase().includes(keyword)),
    );

    return (
        <CashierLayout active="Price List">
            <Head title="Price List" />

            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Price List</h1>
                    <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                        Cari harga jual dan ketersediaan stok barang atau jasa dengan cepat saat melayani pelanggan.
                    </p>
                </div>

                <label className="flex items-center justify-between gap-3 rounded-[14px] border-2 border-[#1D4ED8] bg-white px-[18px] py-4 shadow-sm dark:bg-slate-900">
                    <span className="sr-only">Cari nama barang atau jasa</span>
                    <input
                        ref={searchRef}
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ketik nama barang, jasa, atau kategori..."
                        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-white dark:placeholder-slate-500"
                    />
                    <kbd className="rounded-md bg-[#EEF2F7] px-2 py-1 text-xs font-medium text-[#4B5563] dark:bg-slate-800 dark:text-slate-300">Tekan /</kbd>
                </label>

                <div className="flex gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            type="button"
                            onClick={() => setFilter(f.key)}
                            aria-pressed={filter === f.key}
                            className={`rounded-full px-4 py-2 text-[13px] transition-colors ${
                                filter === f.key
                                    ? 'bg-[#1D4ED8] font-semibold text-white shadow-sm'
                                    : 'border border-[#E5E7EB] bg-white font-medium text-[#4B5563] hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white px-5 py-2 dark:border-slate-800 dark:bg-slate-900">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                                <th scope="col" className="px-2 py-3.5">Nama barang / jasa</th>
                                <th scope="col" className="px-2 py-3.5">Kategori</th>
                                <th scope="col" className="px-2 py-3.5">Satuan</th>
                                <th scope="col" className="px-2 py-3.5">Sisa stok</th>
                                <th scope="col" className="px-2 py-3.5 text-right">Harga jual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shown.map((row) => (
                                <tr key={row.kind + row.name} className="border-b border-[#E5E7EB] last:border-b-0 dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                    <td className="px-2 py-3.5 font-medium text-[#111827] dark:text-white">{row.name}</td>
                                    <td className="px-2 py-3.5 text-[#4B5563] dark:text-slate-400">{row.category}</td>
                                    <td className="px-2 py-3.5 text-[#4B5563] dark:text-slate-400">{row.unit}</td>
                                    <td className="px-2 py-3.5">
                                        {row.kind === 'barang' ? (
                                            row.stock <= 0 ? (
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-400">
                                                    Habis (0)
                                                </span>
                                            ) : row.low_stock ? (
                                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                                                    Sisa {row.stock}
                                                </span>
                                            ) : (
                                                <span className="font-semibold text-gray-900 dark:text-slate-100">
                                                    {row.stock}
                                                </span>
                                            )
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                                                Layanan
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-2 py-3.5 text-right font-bold text-[#1D4ED8] dark:text-blue-400">{rupiah(row.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {shown.length === 0 && (
                        <p className="py-8 text-center text-sm text-[#4B5563] dark:text-slate-400">Tidak ada barang atau jasa yang cocok.</p>
                    )}
                </div>
            </div>
        </CashierLayout>
    );
}