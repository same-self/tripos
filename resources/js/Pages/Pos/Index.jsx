import CashierLayout from '@/Layouts/CashierLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import { Trash2, Search, ArrowUpDown, X, ShoppingCart, Printer, CheckCircle2 } from 'lucide-react';
import ItemThumb from '@/Components/ItemThumb';
import ThermalReceipt from '@/Components/ThermalReceipt';

function getQuickCashOptions(total) {
    if (total <= 0) return [20000, 50000, 100000];
    const options = new Set();
    const steps = [10000, 20000, 50000, 100000];
    steps.forEach((step) => {
        if (total < step) {
            options.add(step);
        } else {
            const nextRound = Math.ceil(total / step) * step;
            if (nextRound > total) options.add(nextRound);
        }
    });
    [50000, 100000, 200000, 500000].forEach((bill) => {
        if (bill > total) options.add(bill);
    });
    return Array.from(options)
        .filter((val) => val > total)
        .sort((a, b) => a - b)
        .slice(0, 3);
}

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmt = (n) => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 4 });

const ICON_PATHS = {
    'Alat Tulis': ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'],
    Kertas: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
    Buku: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
    Aksesoris: [
        'm21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48',
    ],
};

function CategoryIcon({ category }) {
    const paths = ICON_PATHS[category] ?? ['M4 4h16v16H4z'];
    return (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-400">
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                {paths.map((d) => (
                    <path key={d} d={d} />
                ))}
            </svg>
        </span>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`rounded-full px-4 py-2 text-[13px] transition-colors ${
                active
                    ? 'bg-[#1D4ED8] font-semibold text-white shadow-sm dark:bg-blue-600'
                    : 'border border-[#E5E7EB] bg-white font-medium text-[#4B5563] hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
        >
            {children}
        </button>
    );
}

export default function Index({ items, services, paymentMethods }) {
    const { flash, errors } = usePage().props;

    const initialService = services[0] ?? null;
    const initialIsSheet = ['lembar', 'lbr', 'halaman'].includes((initialService?.unit || '').toLowerCase());

    const [tab, setTab] = useState('barang');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Semua');
    const [sortBy, setSortBy] = useState('nama-asc');
    const [cart, setCart] = useState([]);
    const [selectedCartKeys, setSelectedCartKeys] = useState([]);
    const [method, setMethod] = useState('cash');
    const [paid, setPaid] = useState(0);
    const [printReceipt, setPrintReceipt] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('tripos_print_receipt') === 'true';
        }
        return false;
    });
    const [processing, setProcessing] = useState(false);
    const [serviceId, setServiceId] = useState(initialService?.id ?? null);
    const [pages, setPages] = useState(initialIsSheet ? 10 : 1);
    const [activeReceipt, setActiveReceipt] = useState(flash?.recent_receipt ?? null);

    useEffect(() => {
        if (flash?.recent_receipt) {
            setActiveReceipt(flash.recent_receipt);
        }
    }, [flash?.recent_receipt]);

    useEffect(() => {
        if (!activeReceipt) return;

        if (typeof window !== 'undefined' && localStorage.getItem('tripos_print_receipt') === 'true') {
            const timer = setTimeout(() => {
                window.print();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [activeReceipt]);

    useEffect(() => {
        if (!activeReceipt) return;

        // Blur any focused input in the background so keyboard shortcuts are not captured by background inputs
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
            document.activeElement.blur();
        }

        function handleModalKeyDown(e) {
            const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
            if (e.key === 'Escape' || e.key === 'Enter') {
                e.preventDefault();
                setActiveReceipt(null);
                document.getElementById('pos-search-input')?.focus();
            } else if (!isTyping && e.key.toLowerCase() === 'p' && !e.altKey && !(e.ctrlKey && e.shiftKey)) {
                e.preventDefault();
                window.print();
            }
        }

        window.addEventListener('keydown', handleModalKeyDown);
        return () => window.removeEventListener('keydown', handleModalKeyDown);
    }, [activeReceipt]);

    const total = cart.reduce((sum, line) => sum + (Number(line.qty) || 0) * line.price, 0);
    const change = Math.max(0, paid - total);
    const isCash = method === 'cash';
    const underpaid = isCash && cart.length > 0 && paid < total ? total - paid : 0;
    const isUnderpaid = isCash && cart.length > 0 && paid < total;

    const quickAmounts = useMemo(() => getQuickCashOptions(total), [total]);

    useEffect(() => {
        function handleKeyDown(e) {
            if (activeReceipt) return;

            const activeTag = document.activeElement?.tagName;
            const isEditingInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';

            if (e.key === 'F2') {
                e.preventDefault();
                setTab((prev) => (prev === 'barang' ? 'jasa' : 'barang'));
                setCategory('Semua');
            } else if (e.key === 'F4') {
                e.preventDefault();
                setMethod('cash');
                const paidEl = document.getElementById('paid');
                if (paidEl) {
                    paidEl.focus();
                    paidEl.select();
                }
            } else if (e.key === '/' && !isEditingInput) {
                e.preventDefault();
                document.getElementById('pos-search-input')?.focus();
            } else if (e.key === 'Escape') {
                if (search) {
                    setSearch('');
                } else if (document.activeElement?.blur) {
                    document.activeElement.blur();
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [search, activeReceipt]);

    const itemCategories = useMemo(() => {
        const cats = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
        return ['Semua', ...cats];
    }, [items]);

    const serviceCategories = useMemo(() => {
        const cats = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));
        return ['Semua', ...cats];
    }, [services]);

    const currentCategories = tab === 'barang' ? itemCategories : serviceCategories;

    const keyword = search.trim().toLowerCase();

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesKeyword = item.name.toLowerCase().includes(keyword);
            const matchesCategory = category === 'Semua' || item.category === category;
            return matchesKeyword && matchesCategory;
        });
    }, [items, keyword, category]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            switch (sortBy) {
                case 'nama-desc':
                    return b.name.localeCompare(a.name);
                case 'harga-asc':
                    return a.sell_price - b.sell_price;
                case 'harga-desc':
                    return b.sell_price - a.sell_price;
                case 'stok-desc':
                    return b.stock - a.stock;
                case 'stok-asc':
                    return a.stock - b.stock;
                case 'nama-asc':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    }, [filteredItems, sortBy]);

    const shownServices = useMemo(() => {
        return services.filter((service) => {
            const matchesKeyword = service.name.toLowerCase().includes(keyword);
            const matchesCategory = category === 'Semua' || service.category === category;
            return matchesKeyword && matchesCategory;
        });
    }, [services, keyword, category]);

    const selectedService = services.find((service) => service.id === serviceId) ?? null;
    const isSheetUnit = ['lembar', 'lbr', 'halaman'].includes((selectedService?.unit || '').toLowerCase());
    const quickPages = isSheetUnit ? [5, 10, 20, 50, 100] : [1, 2, 3, 5, 10];
    const paper = selectedService?.materials?.[0] ?? null;

    function handleSelectService(service) {
        setServiceId(service.id);
        const isSheet = ['lembar', 'lbr', 'halaman'].includes((service.unit || '').toLowerCase());
        setPages(isSheet ? 10 : 1);
    }

    function addToCart(key, name, price, unit, amount = 1) {
        let maxStock = null;
        if (key.startsWith('barang-')) {
            const itemId = Number(key.split('-')[1]);
            const item = items.find((i) => i.id === itemId);
            if (!item || item.stock <= 0) {
                return;
            }
            maxStock = item.stock;
        }
        setCart((prev) => {
            const found = prev.find((line) => line.key === key);
            if (found) {
                const curQty = Number(found.qty) || 0;
                const nextQty = maxStock !== null ? Math.min(curQty + amount, maxStock) : curQty + amount;
                return prev.map((line) => (line.key === key ? { ...line, qty: nextQty, maxStock } : line));
            }
            const initialQty = maxStock !== null ? Math.min(amount, maxStock) : amount;
            return [...prev, { key, name, price, unit, qty: initialQty, maxStock }];
        });
    }

    function changeQty(key, delta) {
        setCart((prev) =>
            prev
                .map((line) => {
                    if (line.key !== key) return line;
                    let nextQty = (Number(line.qty) || 1) + delta;
                    if (line.maxStock !== null && line.maxStock !== undefined) {
                        nextQty = Math.min(nextQty, line.maxStock);
                    }
                    return { ...line, qty: nextQty };
                })
                .filter((line) => (Number(line.qty) || 0) > 0),
        );
    }

    function setQty(key, value) {
        if (value === '') {
            setCart((prev) => prev.map((line) => (line.key === key ? { ...line, qty: '' } : line)));
            return;
        }
        const n = Math.floor(Number(value));
        if (!Number.isFinite(n)) return;

        setCart((prev) =>
            prev.map((line) => {
                if (line.key !== key) return line;
                let nextQty = Math.max(1, n);
                if (line.maxStock !== null && line.maxStock !== undefined) {
                    nextQty = Math.min(nextQty, line.maxStock);
                }
                return { ...line, qty: nextQty };
            }),
        );
    }

    function handleQtyBlur(key) {
        setCart((prev) =>
            prev.map((line) => {
                if (line.key !== key) return line;
                const n = Math.floor(Number(line.qty));
                let nextQty = Number.isFinite(n) && n >= 1 ? n : 1;
                if (line.maxStock !== null && line.maxStock !== undefined) {
                    nextQty = Math.min(nextQty, line.maxStock);
                }
                return { ...line, qty: nextQty };
            }),
        );
    }

    function removeLine(key) {
        setCart((prev) => prev.filter((line) => line.key !== key));
        setSelectedCartKeys((prev) => prev.filter((k) => k !== key));
    }

    function toggleSelectKey(key) {
        setSelectedCartKeys((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
        );
    }

    function toggleSelectAll() {
        if (cart.length > 0 && selectedCartKeys.length === cart.length) {
            setSelectedCartKeys([]);
        } else {
            setSelectedCartKeys(cart.map((line) => line.key));
        }
    }

    function deleteSelected() {
        if (selectedCartKeys.length === 0) return;
        setCart((prev) => prev.filter((line) => !selectedCartKeys.includes(line.key)));
        setSelectedCartKeys([]);
    }

    function submitSale() {
        // Keys look like "barang-3" or "jasa-5": the number after the dash is the database id
        const itemLines = cart
            .filter((line) => line.key.startsWith('barang-'))
            .map((line) => ({ item_id: Number(line.key.split('-')[1]), qty: Number(line.qty) || 1 }));
        const serviceLines = cart
            .filter((line) => line.key.startsWith('jasa-'))
            .map((line) => ({ service_id: Number(line.key.split('-')[1]), qty: Number(line.qty) || 1 }));

        router.post(
            route('kasir.pos.store'),
            {
                items: itemLines,
                services: serviceLines,
                payment_method: method,
                amount_paid: isCash ? paid : 0,
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: (page) => {
                    setCart([]);
                    setSelectedCartKeys([]);
                    setPaid(0);
                    if (page.props?.flash?.recent_receipt) {
                        setActiveReceipt(page.props.flash.recent_receipt);
                    }
                },
            },
        );
    }

    return (
        <CashierLayout active="Transaksi (POS)">
            <Head title="Transaksi (POS)" />

            {flash?.success && (
                <p className="mb-4 rounded-xl bg-[#DCFCE7] px-4 py-3 text-sm font-medium text-[#15803D] dark:bg-emerald-950/50 dark:text-emerald-300 print:hidden">{flash.success}</p>
            )}

            <div className={`flex flex-col gap-6 lg:flex-row ${activeReceipt ? 'print:hidden' : ''}`}>
                {/* Left: search, tabs, category filter, sorting, product cards, and the service panel */}
                <section className="flex min-w-0 flex-1 flex-col gap-4">
                    {/* Search bar */}
                    <label className="relative flex items-center gap-3 rounded-xl border-2 border-[#1D4ED8] bg-white px-4 py-3 dark:border-blue-500 dark:bg-slate-900 shadow-sm">
                        <Search size={18} className="text-[#1D4ED8] shrink-0 dark:text-blue-400" aria-hidden="true" />
                        <span className="sr-only">Cari barang atau jasa</span>
                        <input
                            id="pos-search-input"
                            type="text"
                            autoComplete="off"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari barang atau jasa... (Tekan / untuk cari)"
                            className="min-w-0 flex-1 border-0 p-0 text-sm focus:ring-0 placeholder:text-gray-400 dark:bg-transparent dark:text-white dark:placeholder-slate-500"
                            autoFocus
                        />
                        {!search ? (
                            <kbd className="hidden sm:inline-block rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                /
                            </kbd>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    document.getElementById('pos-search-input')?.focus();
                                }}
                                className="text-gray-400 hover:text-gray-600 p-0.5 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                                aria-label="Hapus pencarian"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </label>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <TabButton
                            active={tab === 'barang'}
                            onClick={() => {
                                setTab('barang');
                                setCategory('Semua');
                            }}
                        >
                            Barang ATK
                        </TabButton>
                        <TabButton
                            active={tab === 'jasa'}
                            onClick={() => {
                                setTab('jasa');
                                setCategory('Semua');
                            }}
                        >
                            Jasa Fotokopi
                        </TabButton>
                    </div>

                    {/* Category Filter Chips & Sort Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {currentCategories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                                        category === cat
                                            ? 'bg-[#1D4ED8] font-semibold text-white shadow-sm dark:bg-blue-600'
                                            : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {tab === 'barang' && (
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                <label htmlFor="pos-sort" className="flex items-center gap-1 text-xs text-[#6B7280] dark:text-slate-400">
                                    <ArrowUpDown size={13} className="text-[#6B7280] dark:text-slate-400" aria-hidden="true" />
                                    <span className="hidden sm:inline">Urutkan:</span>
                                </label>
                                <select
                                    id="pos-sort"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="rounded-lg border border-[#D1D5DB] bg-white px-2.5 py-1 text-xs font-medium text-[#374151] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    <option value="nama-asc">Nama (A – Z)</option>
                                    <option value="nama-desc">Nama (Z – A)</option>
                                    <option value="harga-asc">Harga (Termurah)</option>
                                    <option value="harga-desc">Harga (Termahal)</option>
                                    <option value="stok-desc">Stok (Terbanyak)</option>
                                    <option value="stok-asc">Stok (Paling Sedikit)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {tab === 'barang' ? (
                        sortedItems.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Tidak ada barang yang ditemukan.</p>
                                <p className="text-xs text-gray-400 mt-1 dark:text-slate-500">Coba ubah kata kunci atau filter kategori.</p>
                            </div>
                        ) : (
                            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                                {sortedItems.map((item) => {
                                    const isOutOfStock = item.stock <= 0;
                                    const inCart = cart.find((c) => c.key === `barang-${item.id}`);
                                    const isCartMax = inCart && inCart.maxStock !== null && Number(inCart.qty) >= inCart.maxStock;
                                    const isAtStockLimit = isOutOfStock || isCartMax;

                                    return (
                                        <li
                                            key={item.id}
                                            onClick={() => {
                                                if (!isAtStockLimit) {
                                                    addToCart(`barang-${item.id}`, item.name, item.sell_price, item.unit);
                                                }
                                            }}
                                            className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-150 ${
                                                isAtStockLimit
                                                    ? 'cursor-not-allowed border-gray-200 bg-gray-50/80 opacity-60 dark:border-slate-800 dark:bg-slate-900/50'
                                                    : 'cursor-pointer border-[#E5E7EB] bg-white hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-1.5">
                                                <div className="relative">
                                                    <ItemThumb src={item.image_url} name={item.name} size="lg" />
                                                    {isOutOfStock ? (
                                                        <span className="absolute top-2 right-2 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                                             Stok Habis
                                                        </span>
                                                    ) : item.low_stock ? (
                                                        <span className="absolute top-2 right-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                                            Menipis
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <CategoryIcon category={item.category} />
                                                    <span className="truncate text-xs font-medium text-[#4B5563] dark:text-slate-400">{item.category}</span>
                                                </div>

                                                <p className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-700 min-h-[2.5rem] dark:text-slate-100 dark:group-hover:text-blue-400">
                                                    {item.name}
                                                </p>

                                                <p className="text-base font-bold text-[#1D4ED8] dark:text-blue-400">{rupiah(item.sell_price)}</p>

                                                <p className={`text-xs ${isOutOfStock ? 'font-semibold text-red-600 dark:text-red-400' : item.low_stock ? 'font-medium text-[#B91C1C] dark:text-red-400' : 'text-[#4B5563] dark:text-slate-400'}`}>
                                                    {isOutOfStock ? (
                                                        'Stok Habis'
                                                    ) : (
                                                        <>
                                                            Stok: {item.stock} {item.unit}
                                                            {item.low_stock ? ' · menipis' : ''}
                                                        </>
                                                    )}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={isAtStockLimit}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(`barang-${item.id}`, item.name, item.sell_price, item.unit);
                                                }}
                                                className={`mt-2.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
                                                    isAtStockLimit
                                                        ? 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-slate-800 dark:text-slate-600'
                                                        : 'bg-[#1D4ED8] text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500'
                                                }`}
                                            >
                                                {isOutOfStock ? 'Stok Habis' : isCartMax ? 'Maks. di Keranjang' : 'Tambah'}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )
                    ) : (
                        <>
                            {shownServices.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
                                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Tidak ada layanan jasa yang ditemukan.</p>
                                    <p className="text-xs text-gray-400 mt-1 dark:text-slate-500">Coba ubah kata kunci atau filter kategori.</p>
                                </div>
                            ) : (
                                <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                                    {shownServices.map((service) => {
                                        const selected = service.id === serviceId;
                                        return (
                                            <li key={service.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelectService(service)}
                                                    aria-pressed={selected}
                                                    className={`flex w-full flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-all ${
                                                        selected
                                                            ? 'border-[#1D4ED8] bg-[#DBEAFE] dark:border-blue-500 dark:bg-blue-950/60'
                                                            : 'border-[#E5E7EB] bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50'
                                                    }`}
                                                >
                                                    <span className="text-xs font-medium text-[#4B5563] dark:text-slate-400">{service.category}</span>
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{service.name}</span>
                                                    <span className="text-base font-bold text-[#1D4ED8] dark:text-blue-400">
                                                        {rupiah(service.unit_price)}{' '}
                                                        <span className="text-xs font-normal text-[#4B5563] dark:text-slate-400">per {service.unit}</span>
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            {selectedService && (
                                <div className="flex flex-col gap-4 rounded-2xl border border-[#6B7280] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{selectedService.name}</h2>
                                        <span className="text-[13px] text-[#4B5563] dark:text-slate-400">
                                            {rupiah(selectedService.unit_price)} per {selectedService.unit}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="pages" className="text-xs font-medium text-[#4B5563] dark:text-slate-400">
                                            Jumlah {selectedService.unit}
                                        </label>
                                        <div className="flex items-center justify-between rounded-xl border border-[#1D4ED8] px-3.5 py-2.5 dark:border-blue-500 dark:bg-slate-950">
                                            <input
                                                id="pages"
                                                type="number"
                                                min="1"
                                                inputMode="numeric"
                                                value={pages}
                                                onChange={(e) => setPages(Number(e.target.value) || 0)}
                                                className="w-full border-0 p-0 text-xl font-bold focus:ring-0 dark:bg-transparent dark:text-white"
                                            />
                                            <span className="text-[13px] text-[#4B5563] dark:text-slate-400">{selectedService.unit}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {quickPages.map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setPages(n)}
                                                className="rounded-lg bg-[#F3F4F6] px-3 py-1.5 text-xs font-medium hover:bg-gray-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>

                                    {paper && (
                                        <div className="flex flex-col gap-1 rounded-xl bg-[#F3F4F6] p-3 dark:bg-slate-800/80">
                                            <p className="text-[13px] font-semibold text-gray-900 dark:text-slate-200">
                                                {paper.name} terpakai: {fmt(pages * paper.per_unit)} {paper.unit}
                                            </p>
                                            <p className="text-xs text-[#4B5563] dark:text-slate-400">
                                                {pages} {selectedService.unit} × {fmt(paper.per_unit)} {paper.unit} per{' '}
                                                {selectedService.unit}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        disabled={pages < 1}
                                        onClick={() =>
                                            addToCart(
                                                `jasa-${selectedService.id}`,
                                                selectedService.name,
                                                selectedService.unit_price,
                                                selectedService.unit,
                                                pages,
                                            )
                                        }
                                        className="rounded-xl bg-[#1D4ED8] py-3.5 font-semibold text-white disabled:opacity-50 hover:bg-blue-700 transition-colors dark:bg-blue-600 dark:hover:bg-blue-500"
                                    >
                                        Tambah ke keranjang
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Right: cart and payment */}
                <aside className="flex w-full shrink-0 flex-col gap-3.5 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-[460px] dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Keranjang</h2>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-[#1D4ED8] dark:bg-blue-950 dark:text-blue-400">
                                {cart.length}
                            </span>
                        </div>
                        {cart.length > 0 && (
                            <div className="flex items-center gap-2">
                                {selectedCartKeys.length > 0 ? (
                                    <button
                                        type="button"
                                        onClick={deleteSelected}
                                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/60 dark:text-red-400 dark:hover:bg-red-900/50"
                                    >
                                        <Trash2 size={13} aria-hidden="true" />
                                        Hapus ({selectedCartKeys.length})
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCart([]);
                                            setSelectedCartKeys([]);
                                        }}
                                        className="text-xs text-gray-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
                                    >
                                        Kosongkan
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2 text-xs text-[#6B7280] dark:border-slate-800 dark:text-slate-400">
                            <label className="flex items-center gap-2 cursor-pointer select-none font-medium hover:text-gray-900 dark:hover:text-slate-200">
                                <input
                                    type="checkbox"
                                    checked={cart.length > 0 && selectedCartKeys.length === cart.length}
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8] dark:border-slate-700 dark:bg-slate-800"
                                />
                                <span>Pilih Semua</span>
                            </label>
                            {selectedCartKeys.length > 0 && (
                                <span className="text-xs font-medium text-[#1D4ED8] dark:text-blue-400">
                                    {selectedCartKeys.length} terpilih
                                </span>
                            )}
                        </div>
                    )}

                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-2 dark:bg-slate-800 dark:text-slate-500">
                                <ShoppingCart size={22} />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Belum ada barang di keranjang</p>
                            <p className="text-xs text-gray-400 mt-0.5 dark:text-slate-500">Pilih item dari katalog di sebelah kiri</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
                            {cart.map((line) => {
                                const isSelected = selectedCartKeys.includes(line.key);
                                const isAtMaxStock = line.maxStock !== null && line.maxStock !== undefined && Number(line.qty) >= line.maxStock;

                                return (
                                    <div
                                        key={line.key}
                                        className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 transition-colors ${
                                            isSelected
                                                ? 'border-[#93C5FD] bg-[#EFF6FF] dark:border-blue-700/60 dark:bg-blue-950/40'
                                                : 'border-[#F3F4F6] bg-white hover:bg-[#F9FAFB] dark:border-slate-800/80 dark:bg-slate-900 hover:dark:bg-slate-800/60'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelectKey(line.key)}
                                                aria-label={`Pilih ${line.name}`}
                                                className="h-4 w-4 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8] shrink-0 dark:border-slate-700 dark:bg-slate-800"
                                            />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-slate-100" title={line.name}>
                                                    {line.name}
                                                </p>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className="text-xs text-[#4B5563] dark:text-slate-400">
                                                        {line.qty || 0} × {rupiah(line.price)}
                                                    </p>
                                                    {isAtMaxStock && (
                                                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                                                            Maks. stok ({line.maxStock})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    aria-label={`Kurangi ${line.name}`}
                                                    onClick={() => changeQty(line.key, -1)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F3F4F6] font-semibold text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={line.maxStock ?? undefined}
                                                    inputMode="numeric"
                                                    aria-label={`Jumlah ${line.name}`}
                                                    value={line.qty}
                                                    onChange={(e) => setQty(line.key, e.target.value)}
                                                    onBlur={() => handleQtyBlur(line.key)}
                                                    className="h-7 w-12 rounded-lg border border-[#D1D5DB] text-center text-xs font-semibold focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label={`Tambah ${line.name}`}
                                                    disabled={isAtMaxStock}
                                                    onClick={() => changeQty(line.key, 1)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D4ED8] font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-500"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="w-20 text-right text-xs font-bold text-gray-900 dark:text-slate-100">{rupiah((Number(line.qty) || 0) * line.price)}</p>
                                            <button
                                                type="button"
                                                aria-label={`Hapus ${line.name}`}
                                                onClick={() => removeLine(line.key)}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-[#FEE2E2] hover:text-[#B91C1C] dark:text-slate-500 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                                            >
                                                <Trash2 size={15} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3.5 dark:border-slate-800">
                        <span className="text-sm text-[#4B5563] dark:text-slate-400">Total Tagihan</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{rupiah(total)}</span>
                    </div>

                    <div className="flex gap-1 rounded-xl bg-[#EEF2F7] p-1 dark:border dark:border-slate-800 dark:bg-slate-950" role="group" aria-label="Metode pembayaran">
                        {paymentMethods.map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                onClick={() => setMethod(m.value)}
                                aria-pressed={method === m.value}
                                className={`flex-1 rounded-lg py-2.5 text-sm transition-colors ${
                                    method === m.value
                                        ? 'bg-white font-semibold shadow-sm text-gray-900 dark:bg-slate-800 dark:text-white'
                                        : 'font-medium text-[#4B5563] dark:text-slate-400 hover:dark:text-slate-200'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {isCash ? (
                        <>
                            <label htmlFor="paid" className="text-xs font-medium text-[#4B5563] dark:text-slate-400">
                                Uang Diterima
                            </label>
                            <input
                                id="paid"
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={paid === 0 ? '' : paid}
                                onChange={(e) => setPaid(Number(e.target.value) || 0)}
                                placeholder="0"
                                className="h-12 rounded-xl border border-[#1D4ED8] px-4 text-lg font-bold dark:border-blue-500 dark:bg-slate-950 dark:text-white"
                            />
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaid(total)}
                                    className="rounded-lg bg-[#F3F4F6] px-2.5 py-1.5 text-xs font-medium hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    Uang Pas
                                </button>
                                {quickAmounts.map((amount) => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => setPaid(amount)}
                                        className="rounded-lg bg-[#F3F4F6] px-2.5 py-1.5 text-xs font-medium hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        {rupiah(amount)}
                                    </button>
                                ))}
                            </div>
                            {isUnderpaid ? (
                                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/60 dark:bg-amber-950/40">
                                    <span className="text-sm font-medium text-amber-900 dark:text-amber-200">Kurang Bayar</span>
                                    <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{rupiah(underpaid)}</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between rounded-xl bg-[#DCFCE7] px-4 py-3 dark:border dark:border-emerald-800/60 dark:bg-emerald-950/40">
                                    <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Kembalian</span>
                                    <span className="text-lg font-bold text-[#16A34A] dark:text-emerald-400">{rupiah(change)}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-[#4B5563] dark:text-slate-400">Pelanggan membayar sebesar total tagihan melalui QRIS.</p>
                    )}

                    <label className="flex items-center gap-2 py-1 text-[13px] cursor-pointer text-gray-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={printReceipt}
                            onChange={(e) => {
                                setPrintReceipt(e.target.checked);
                                if (typeof window !== 'undefined') {
                                    localStorage.setItem('tripos_print_receipt', e.target.checked ? 'true' : 'false');
                                }
                            }}
                            className="h-4 w-4 rounded border-[#4B5563] text-[#1D4ED8] focus:ring-[#1D4ED8] dark:border-slate-700 dark:bg-slate-800"
                        />
                        Cetak struk thermal
                    </label>

                    {errors?.sale && (
                        <p className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C] dark:bg-red-950/60 dark:text-red-300">{errors.sale}</p>
                    )}

                    <button
                        type="button"
                        onClick={submitSale}
                        disabled={cart.length === 0 || processing || isUnderpaid}
                        className="rounded-xl bg-[#1D4ED8] py-4 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors dark:bg-blue-600 dark:hover:bg-blue-500"
                    >
                        {processing
                            ? 'Menyimpan...'
                            : isUnderpaid
                              ? `Uang Kurang ${rupiah(underpaid)}`
                              : 'Selesaikan Transaksi'}
                    </button>
                </aside>
            </div>

            {/* Modal Pop-up Struk Transaksi */}
            {activeReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-popover print:static print:p-0 print:m-0 print:bg-transparent print:block">
                    <div className="relative flex max-h-[92vh] w-full max-w-[400px] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden print:static print:max-h-none print:w-full print:max-w-none print:border-none print:shadow-none print:bg-transparent print:p-0">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-slate-800 print:hidden">
                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                    <CheckCircle2 size={16} />
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Transaksi Berhasil</h3>
                                    <p className="text-[11px] text-gray-500 dark:text-slate-400">{activeReceipt.number}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveReceipt(null);
                                    document.getElementById('pos-search-input')?.focus();
                                }}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                                aria-label="Tutup struk"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Struk Content */}
                        <div className="overflow-y-auto p-4 bg-gray-50/50 dark:bg-slate-950/40 print:overflow-visible print:p-0 print:bg-transparent">
                            <ThermalReceipt receipt={activeReceipt} />
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex flex-col gap-2 border-t border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 print:hidden">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                            >
                                <Printer size={16} />
                                Cetak Struk (P)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveReceipt(null);
                                    document.getElementById('pos-search-input')?.focus();
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Transaksi Baru (Enter / Esc)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CashierLayout>
    );
}
