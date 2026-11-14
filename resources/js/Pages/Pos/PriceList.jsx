import CashierLayout from '@/Layouts/CashierLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown, Plus, RotateCcw } from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const formatNumber = (n) => Number(n || 0).toLocaleString('id-ID');

function SortIcon({ active, direction }) {
    if (!active) {
        return <ArrowUpDown size={13} className="text-gray-400 opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return direction === 'asc' ? (
        <ArrowUp size={13} className="text-blue-600 dark:text-blue-400" />
    ) : (
        <ArrowDown size={13} className="text-blue-600 dark:text-blue-400" />
    );
}

export default function PriceList({ rows = [] }) {
    const [kindFilter, setKindFilter] = useState('semua');
    const [categoryFilter, setCategoryFilter] = useState('semua');
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const searchRef = useRef(null);

    // Pressing "/" anywhere jumps to search box; pressing "Escape" clears and blurs
    useEffect(() => {
        function handleKey(event) {
            const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
            if (event.key === '/' && !typing) {
                event.preventDefault();
                searchRef.current?.focus();
            } else if (event.key === 'Escape' && document.activeElement === searchRef.current) {
                event.preventDefault();
                setSearch('');
                searchRef.current?.blur();
            }
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    // Extract unique categories from rows
    const availableCategories = useMemo(() => {
        const set = new Set();
        rows.forEach((r) => {
            if (r.category) set.add(r.category);
        });
        return Array.from(set).sort();
    }, [rows]);

    // Filtering logic
    const filtered = useMemo(() => {
        const kw = search.trim().toLowerCase();
        return rows.filter((r) => {
            if (kindFilter !== 'semua' && r.kind !== kindFilter) return false;
            if (categoryFilter !== 'semua' && r.category !== categoryFilter) return false;
            if (kw) {
                const nameMatch = r.name?.toLowerCase().includes(kw);
                const catMatch = r.category?.toLowerCase().includes(kw);
                if (!nameMatch && !catMatch) return false;
            }
            return true;
        });
    }, [rows, search, kindFilter, categoryFilter]);

    // Sorting logic
    const sorted = useMemo(() => {
        const list = [...filtered];
        list.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'name') {
                cmp = (a.name || '').localeCompare(b.name || '', 'id-ID');
            } else if (sortField === 'stock') {
                const stockA = a.stock !== null && a.stock !== undefined ? a.stock : -1;
                const stockB = b.stock !== null && b.stock !== undefined ? b.stock : -1;
                cmp = stockA - stockB;
            } else if (sortField === 'price') {
                cmp = (a.price || 0) - (b.price || 0);
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        });
        return list;
    }, [filtered, sortField, sortDirection]);

    function handleSort(field) {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection(field === 'name' ? 'asc' : 'desc');
        }
    }

    function handleAddToPos(row) {
        if (row.kind === 'barang' && (row.stock <= 0 || row.stock === null)) {
            return;
        }
        const payload = {
            key: `${row.kind}-${row.id}`,
            name: row.name,
            price: row.price,
            unit: row.unit,
            qty: 1,
        };
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('tripos_pending_add', JSON.stringify(payload));
        }
        router.visit(route('kasir.pos'));
    }

    function resetFilters() {
        setSearch('');
        setKindFilter('semua');
        setCategoryFilter('semua');
        setSortField('name');
        setSortDirection('asc');
        searchRef.current?.focus();
    }

    const hasActiveFilters = search !== '' || kindFilter !== 'semua' || categoryFilter !== 'semua';

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

                {/* Search Bar with Clear Button */}
                <div className="relative flex items-center rounded-xl border-2 border-[#1D4ED8] bg-white px-4 py-3 shadow-sm dark:border-blue-500 dark:bg-slate-900">
                    <Search size={18} className="text-[#1D4ED8] shrink-0 dark:text-blue-400 mr-3" aria-hidden="true" />
                    <input
                        ref={searchRef}
                        type="text"
                        autoComplete="off"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ketik nama barang, jasa, atau kategori..."
                        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder-slate-500"
                    />
                    {search ? (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                searchRef.current?.focus();
                            }}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors mr-2"
                            aria-label="Bersihkan pencarian"
                        >
                            <X size={16} />
                        </button>
                    ) : (
                        <kbd className="rounded-md bg-[#EEF2F7] px-2 py-1 text-xs font-medium text-[#4B5563] dark:bg-slate-800 dark:text-slate-300">
                            Tekan /
                        </kbd>
                    )}
                </div>

                {/* Filter Chips: Type and Category */}
                <div className="flex flex-col gap-2.5">
                    {/* Primary Kind Filter */}
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { key: 'semua', label: 'Semua' },
                            { key: 'barang', label: 'Barang ATK' },
                            { key: 'jasa', label: 'Jasa Fotokopi' },
                        ].map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => {
                                    setKindFilter(f.key);
                                    if (f.key === 'jasa') setCategoryFilter('semua');
                                }}
                                aria-pressed={kindFilter === f.key}
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                                    kindFilter === f.key
                                        ? 'bg-[#1D4ED8] text-white shadow-sm dark:bg-blue-600'
                                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}

                        {/* Specific category chips if kind is not jasa */}
                        {kindFilter !== 'jasa' && availableCategories.length > 0 && (
                            <>
                                <div className="h-4 w-px bg-gray-300 dark:bg-slate-800 mx-1 hidden sm:block" />
                                {availableCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategoryFilter(categoryFilter === cat ? 'semua' : cat)}
                                        className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                                            categoryFilter === cat
                                                ? 'bg-blue-100 font-semibold text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                                                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Active Result Count & Reset button */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 px-1">
                        <span>
                            Menampilkan <strong className="text-gray-900 dark:text-white font-semibold">{sorted.length}</strong> dari{' '}
                            <span className="font-medium text-gray-700 dark:text-slate-300">{rows.length}</span> item
                            {sortField && (
                                <span className="ml-1 text-gray-400 dark:text-slate-500">
                                    · urut berdasarkan {sortField === 'name' ? 'nama' : sortField === 'stock' ? 'stok' : 'harga'}{' '}
                                    ({sortDirection === 'asc' ? 'A→Z / terendah' : 'Z→A / tertinggi'})
                                </span>
                            )}
                        </span>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                            >
                                <RotateCcw size={12} />
                                <span>Reset filter</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 dark:border-slate-800 dark:text-slate-400">
                                <th scope="col" className="px-4 py-3.5">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('name')}
                                        className="group inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <span>Nama barang / jasa</span>
                                        <SortIcon active={sortField === 'name'} direction={sortDirection} />
                                    </button>
                                </th>
                                <th scope="col" className="px-3 py-3.5">Kategori</th>
                                <th scope="col" className="px-4 py-3.5 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('stock')}
                                        className="group ml-auto inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <span>Stok</span>
                                        <SortIcon active={sortField === 'stock'} direction={sortDirection} />
                                    </button>
                                </th>
                                <th scope="col" className="px-4 py-3.5 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('price')}
                                        className="group ml-auto inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <span>Harga jual</span>
                                        <SortIcon active={sortField === 'price'} direction={sortDirection} />
                                    </button>
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-right w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {sorted.map((row) => {
                                const isOutOfStock = row.kind === 'barang' && (row.stock <= 0 || row.stock === null);
                                return (
                                    <tr
                                        key={row.kind + '-' + row.id + '-' + row.name}
                                        className={`transition-colors ${
                                            isOutOfStock
                                                ? 'bg-gray-50/50 dark:bg-slate-900/40 text-gray-400 dark:text-slate-500'
                                                : 'hover:bg-gray-50/70 dark:hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <td className="px-4 py-3.5 font-medium">
                                            <div className="flex flex-col">
                                                <span className={isOutOfStock ? 'text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-white'}>
                                                    {row.name}
                                                </span>
                                                {row.kind === 'jasa' && (
                                                    <span className="text-[11px] text-gray-400 dark:text-slate-500">Layanan jasa</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <span className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-slate-800 dark:text-slate-300">
                                                {row.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right text-sm">
                                            {row.kind === 'barang' ? (
                                                isOutOfStock ? (
                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-400">
                                                        Habis (0)
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold text-gray-900 dark:text-slate-100">
                                                        {formatNumber(row.stock)}{' '}
                                                        <span className="font-normal text-xs text-gray-500 dark:text-slate-400">
                                                            {row.unit}
                                                        </span>
                                                    </span>
                                                )
                                            ) : (
                                                <span className="text-gray-400 dark:text-slate-500 font-sans">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <span className="font-bold text-[#1D4ED8] dark:text-blue-400 text-sm">
                                                {rupiah(row.price)}
                                            </span>
                                            <span className="text-[11px] text-gray-400 dark:text-slate-500 ml-1 font-sans">
                                                /{row.unit}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3.5 text-right">
                                            <button
                                                type="button"
                                                disabled={isOutOfStock}
                                                onClick={() => handleAddToPos(row)}
                                                title={isOutOfStock ? 'Stok habis' : 'Tambah ke kasir'}
                                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                                                    isOutOfStock
                                                        ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-600'
                                                        : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-950/70 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white shadow-xs active:scale-95'
                                                }`}
                                            >
                                                <Plus size={13} />
                                                <span>Kasir</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {sorted.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                                Tidak ada barang atau jasa yang cocok dengan kriteria filter.
                            </p>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-2 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                            >
                                Bersihkan kata kunci dan tampilkan semua
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </CashierLayout>
    );
}
