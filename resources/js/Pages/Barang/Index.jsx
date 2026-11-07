import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Info, Plus, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CategoryBadge from '@/Components/CategoryBadge';
import EditButton from '@/Components/EditButton';
import ItemThumb from '@/Components/ItemThumb';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

function CategoryButton({ active, label, count, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                active
                    ? 'bg-[#DBEAFE] font-semibold text-[#1D4ED8] dark:bg-blue-600 dark:text-white'
                    : 'font-medium text-[#111827] hover:bg-[#F3F4F6] dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
        >
            <span className="flex min-w-0 items-center gap-2.5 text-left">
                <CategoryBadge name={label} size="sm" />
                <span className="truncate">{label}</span>
            </span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                active ? 'bg-white text-[#1D4ED8] dark:bg-blue-800 dark:text-white' : 'bg-white text-[#4B5563] dark:bg-slate-800 dark:text-slate-300'
            }`}>
                {count}
            </span>
        </button>
    );
}

function SummaryCard({ label, value, tone }) {
    // If digits are long (e.g. large currency string), scale text size down smoothly
    const isLongText = typeof value === 'string' && value.length > 13;
    const isVeryLongText = typeof value === 'string' && value.length > 17;
    const textSize = isVeryLongText
        ? 'text-base sm:text-lg'
        : isLongText
          ? 'text-lg sm:text-xl'
          : 'text-xl sm:text-[22px]';

    return (
        <div className="flex flex-col justify-between gap-1 rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium text-[#4B5563] dark:text-slate-400">{label}</p>
            <p
                title={String(value)}
                className={`truncate font-bold tracking-tight ${textSize} ${
                    tone === 'danger' ? 'text-[#B91C1C] dark:text-red-400' : 'text-[#111827] dark:text-white'
                }`}
            >
                {value}
            </p>
        </div>
    );
}

export default function Index({ items, categories, total, filters, summary }) {
    const [search, setSearch] = useState(filters.cari);

    // Every filter change reloads the list from the server with the other filters kept
    function go(changes) {
        router.get(
            route('barang.index'),
            { kategori: filters.kategori, cari: filters.cari, ...changes },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const { errors: pageErrors } = usePage().props;

    function remove(item) {
        if (window.confirm(`Hapus barang "${item.name}"? Riwayat penjualannya tetap tersimpan.`)) {
            router.delete(route('barang.destroy', item.id), { preserveScroll: true });
        }
    }

    return (
        <TriposLayout active="Barang">
            <Head title="Barang" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Barang</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">Kelola data barang ATK, harga jual, dan kategorinya.</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('kategori.index')}
                            className="inline-flex items-center gap-2 rounded-[10px] border border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] shadow-sm hover:bg-[#F3F4F6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Tag size={16} strokeWidth={2.25} aria-hidden="true" />
                            Kelola Kategori
                        </Link>
                        <Link
                            href={route('barang.create')}
                            className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E40AF] dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                        >
                            <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                            Tambah Barang
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard label="Total barang" value={summary.total} />
                    <SummaryCard label="Stok menipis" value={summary.low_stock} tone="danger" />
                    <SummaryCard label="Nilai stok (modal)" value={rupiah(summary.stock_value)} />
                    <SummaryCard label="Kategori" value={summary.categories} />
                </div>

                <div className="flex flex-col gap-5 lg:flex-row">
                    {/* Category panel */}
                    <aside className="flex w-full shrink-0 flex-col gap-1 rounded-2xl border border-[#E5E7EB] bg-white p-4 lg:w-[220px] dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-2 text-[15px] font-semibold text-gray-900 dark:text-white">Kategori</h2>
                        <CategoryButton
                            active={filters.kategori === null}
                            label="Semua"
                            count={total}
                            onClick={() => go({ kategori: null })}
                        />
                        {categories.map((c) => (
                            <CategoryButton
                                key={c.id}
                                active={filters.kategori === c.id}
                                label={c.name}
                                count={c.count}
                                onClick={() => go({ kategori: c.id })}
                            />
                        ))}
                        <Link href={route('kategori.index')} className="mt-3 px-3 text-left text-[13px] font-semibold text-[#1D4ED8] dark:text-blue-400">
                            Kelola kategori
                        </Link>

                        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                            <div className="flex items-center gap-1.5 font-semibold text-[#374151] dark:text-slate-200">
                                <Info size={14} className="text-[#1D4ED8] dark:text-blue-400" />
                                Ambang Status Stok
                            </div>
                            <p className="mt-1 text-[11px] text-[#6B7280] dark:text-slate-400">Perputaran 30 hari terakhir:</p>
                            <ul className="mt-2 flex flex-col gap-1.5 text-[11px] dark:text-slate-300">
                                <li className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#16A34A]" />
                                    <span><strong>Cepat:</strong> &ge; 80 unit</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#9CA3AF]" />
                                    <span><strong>Normal:</strong> 10–79 unit</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#D97706]" />
                                    <span><strong>Lambat:</strong> &lt; 10 unit</span>
                                </li>
                            </ul>
                            <Link href={route('stok.index')} className="mt-2.5 block font-semibold text-[#1D4ED8] hover:underline dark:text-blue-400">
                                Analisis lengkap di Stok &rarr;
                            </Link>
                        </div>
                    </aside>

                    {/* Product table */}
                    <section className="min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        {pageErrors.hapus && (
                            <p className="mb-4 rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C] dark:bg-red-950/60 dark:text-red-300">{pageErrors.hapus}</p>
                        )}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                go({ cari: search });
                            }}
                        >
                            <label htmlFor="cari" className="sr-only">
                                Cari nama barang
                            </label>
                            <input
                                id="cari"
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama barang..."
                                className="w-full rounded-[10px] border border-[#6B7280] px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                            />
                        </form>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                                    <tr>
                                        <th scope="col" className="px-2 py-3">Nama barang</th>
                                        <th scope="col" className="px-2 py-3">Kategori</th>
                                        <th scope="col" className="px-2 py-3">Satuan</th>
                                        <th scope="col" className="px-2 py-3">Harga modal</th>
                                        <th scope="col" className="px-2 py-3">Harga jual</th>
                                        <th scope="col" className="px-2 py-3">Stok</th>
                                        <th scope="col" className="px-2 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b border-[#E5E7EB] last:border-b-0 dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                            <td className="px-2 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <ItemThumb src={item.image_url} name={item.name} />
                                                    <span className="font-medium text-gray-900 dark:text-slate-100">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-3.5 text-[#4B5563] dark:text-slate-400">{item.category}</td>
                                            <td className="px-2 py-3.5 text-[#4B5563] dark:text-slate-400">{item.unit}</td>
                                            <td className="px-2 py-3.5 text-gray-900 dark:text-slate-200">{rupiah(item.cost_price)}</td>
                                            <td className="px-2 py-3.5 font-semibold text-gray-900 dark:text-slate-100">{rupiah(item.sell_price)}</td>
                                            <td className={`px-2 py-3.5 ${item.low_stock ? 'font-semibold text-[#B91C1C] dark:text-red-400' : 'text-gray-900 dark:text-slate-200'}`}>
                                                {item.stock}
                                            </td>
                                            <td className="px-2 py-3.5">
                                                {/* Connected to the edit form in the next step */}
                                                <div className="flex items-center gap-2">
                                                    <EditButton href={route('barang.edit', item.id)} />
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(item)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-2.5 py-1.5 text-[13px] font-semibold text-[#B91C1C] hover:bg-[#FECACA] dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                                    >
                                                        <Trash2 size={14} strokeWidth={2.25} aria-hidden="true" />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {items.length === 0 && (
                                <p className="py-8 text-center text-sm text-[#4B5563] dark:text-slate-400">Tidak ada barang yang cocok.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </TriposLayout>
    );
}