import TriposLayout from '@/Layouts/TriposLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import {
    Building2,
    Calendar,
    Check,
    Coins,
    Copy,
    ExternalLink,
    MapPin,
    MessageCircle,
    Package,
    PackageCheck,
    Pencil,
    Phone,
    Plus,
    Receipt,
    Search,
    Trash2,
    Truck,
    X,
} from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

function getInitials(name) {
    if (!name) return 'SP';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

export default function Index({ suppliers = [], detail = null, metrics = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.cari || '');
    const [selectedTab, setSelectedTab] = useState('semua'); // 'semua' | 'aktif' | 'baru'
    const [selectedId, setSelectedId] = useState(filters.pilih || detail?.id || (suppliers[0]?.id ?? null));
    const [deletingSupplier, setDeletingSupplier] = useState(null);
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState(false);

    // Active selected supplier
    const activeSupplierId = selectedId || filters.pilih || detail?.id || (suppliers.length > 0 ? suppliers[0].id : null);

    useEffect(() => {
        if (filters.pilih) {
            setSelectedId(filters.pilih);
        }
    }, [filters.pilih]);

    // Filter suppliers in real-time
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter((s) => {
            const matchesSearch =
                !search.trim() ||
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                (s.phone && s.phone.includes(search)) ||
                (s.address && s.address.toLowerCase().includes(search.toLowerCase()));

            if (!matchesSearch) return false;

            if (selectedTab === 'aktif') return s.purchases_count > 0;
            if (selectedTab === 'baru') return s.purchases_count === 0;
            return true;
        });
    }, [suppliers, search, selectedTab]);

    // Active detail: use prop detail if matches, or find in suppliers array
    const activeDetail = useMemo(() => {
        if (detail && String(detail.id) === String(activeSupplierId)) {
            return detail;
        }
        return suppliers.find((s) => String(s.id) === String(activeSupplierId)) || detail || null;
    }, [detail, suppliers, activeSupplierId]);

    function selectSupplier(id) {
        setSelectedId(id);
        router.get(
            route('supplier.index'),
            { cari: search || undefined, pilih: id },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    }

    function confirmDelete() {
        if (!deletingSupplier) return;
        router.delete(route('supplier.destroy', deletingSupplier.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingSupplier(null),
        });
    }

    const copyToClipboard = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === 'phone') {
            setCopiedPhone(true);
            setTimeout(() => setCopiedPhone(false), 2000);
        } else if (type === 'address') {
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        }
    };

    const getWaLink = (phone) => {
        if (!phone) return null;
        const cleaned = phone.replace(/\D/g, '').replace(/^0/, '62');
        return `https://wa.me/${cleaned}`;
    };

    return (
        <TriposLayout active="Supplier">
            <Head title="Supplier Pemasok" />

            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">
                            Supplier Pemasok
                        </h1>
                        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                            Kelola data mitra distributor ATK, kontak telepon, dan riwayat faktur pembelian barang.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('restok.create')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-all"
                        >
                            <PackageCheck size={15} className="text-blue-600 dark:text-blue-400" />
                            Catat Restok
                        </Link>

                        <Link
                            href={route('supplier.create')}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            Tambah Supplier
                        </Link>
                    </div>
                </div>

                {/* 4 Metric Overview Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                            <Truck size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Total Rekanan
                            </p>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {metrics.total_suppliers ?? suppliers.length}
                                <span className="ml-1 text-xs font-normal text-slate-400">mitra</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <Building2 size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Supplier Aktif
                            </p>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {metrics.active_suppliers ?? suppliers.filter((s) => s.purchases_count > 0).length}
                                <span className="ml-1 text-xs font-normal text-slate-400">pernah restok</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                            <Receipt size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Total Faktur
                            </p>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {metrics.total_purchases_count ?? 0}
                                <span className="ml-1 text-xs font-normal text-slate-400">transaksi</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                            <Coins size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Nilai Belanja
                            </p>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {rupiah(metrics.total_purchases_amount ?? 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content: Table on Left + Sticky Details on Right */}
                <div className="flex flex-col gap-6 lg:flex-row items-start">
                    {/* Left: Supplier List Card */}
                    <section className="min-w-0 flex-1 w-full rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90 overflow-hidden">
                        {/* Search & Tabs Toolbar */}
                        <div className="flex flex-col gap-3.5 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                            {/* Search Bar */}
                            <div className="relative min-w-0 flex-1 max-w-sm">
                                <Search
                                    size={15}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                                />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama, telepon, atau alamat..."
                                    className="h-9.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-9 pr-8 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Segmented Filter Pills */}
                            <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 text-xs dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800 self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTab('semua')}
                                    className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                                        selectedTab === 'semua'
                                            ? 'bg-white text-slate-900 shadow-sm font-semibold dark:bg-slate-800 dark:text-white'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                                >
                                    Semua ({suppliers.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTab('aktif')}
                                    className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                                        selectedTab === 'aktif'
                                            ? 'bg-white text-slate-900 shadow-sm font-semibold dark:bg-slate-800 dark:text-white'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                                >
                                    Aktif ({suppliers.filter((s) => s.purchases_count > 0).length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTab('baru')}
                                    className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                                        selectedTab === 'baru'
                                            ? 'bg-white text-slate-900 shadow-sm font-semibold dark:bg-slate-800 dark:text-white'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                                >
                                    Baru ({suppliers.filter((s) => s.purchases_count === 0).length})
                                </button>
                            </div>
                        </div>

                        {/* Suppliers Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[620px] text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Nama Supplier</th>
                                        <th scope="col" className="px-4 py-3">Kontak Telepon</th>
                                        <th scope="col" className="px-4 py-3">Restok Terakhir</th>
                                        <th scope="col" className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                    {filteredSuppliers.map((s) => {
                                        const isSelected = String(s.id) === String(activeSupplierId);
                                        const initials = getInitials(s.name);

                                        return (
                                            <tr
                                                key={s.id}
                                                onClick={() => selectSupplier(s.id)}
                                                className={`group cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-l-4 border-l-blue-600 dark:border-l-blue-500'
                                                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
                                                }`}
                                            >
                                                {/* Supplier Name & Initials */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-transform group-hover:scale-105 ${
                                                                isSelected
                                                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            {initials}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={`font-semibold transition-colors ${
                                                                        isSelected
                                                                            ? 'text-blue-600 dark:text-blue-400'
                                                                            : 'text-slate-900 dark:text-white'
                                                                    }`}
                                                                >
                                                                    {s.name}
                                                                </span>
                                                                {s.purchases_count > 0 && (
                                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                                                        {s.purchases_count} faktur
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {s.address ? (
                                                                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[240px]">
                                                                    <MapPin size={11} className="shrink-0" />
                                                                    <span className="truncate">{s.address}</span>
                                                                </p>
                                                            ) : (
                                                                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-600 italic">
                                                                    Alamat belum diatur
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Phone Number */}
                                                <td className="px-4 py-3.5">
                                                    {s.phone ? (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                                            <Phone size={13} className="text-slate-400 shrink-0" />
                                                            <span className="font-medium tabular-nums">{s.phone}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 dark:text-slate-600 italic">
                                                            -
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Last Purchase */}
                                                <td className="px-4 py-3.5">
                                                    {s.last_purchase ? (
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                                                                <Calendar size={12} className="text-slate-400" />
                                                                {s.last_purchase}
                                                            </span>
                                                            {s.total_spend > 0 && (
                                                                <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                                                                    Total: {rupiah(s.total_spend)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                            Belum pernah restok
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={route('supplier.edit', s.id)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white transition-all"
                                                            title="Ubah data supplier"
                                                        >
                                                            <Pencil size={13} />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingSupplier(s)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200/80 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50 transition-all"
                                                            title="Hapus supplier"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filteredSuppliers.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                        <Truck size={22} />
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        Tidak ada supplier yang cocok
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                                        {search
                                            ? `Pencarian "${search}" tidak menemukan data supplier yang sesuai.`
                                            : 'Belum ada rekanan supplier pada kategori ini.'}
                                    </p>
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            className="mt-3 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            Reset pencarian
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Right: Sticky Detail Panel */}
                    <aside className="w-full shrink-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90 lg:w-[360px] lg:sticky lg:top-24">
                        {activeDetail ? (
                            <div className="flex flex-col gap-5">
                                {/* Profile Header Card */}
                                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-bold text-white shadow-md shadow-blue-500/25">
                                            {getInitials(activeDetail.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
                                                {activeDetail.name}
                                            </h2>
                                            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                                ID Mitra: #{activeDetail.id}
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        href={route('supplier.edit', activeDetail.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <Pencil size={12} />
                                        Ubah
                                    </Link>
                                </div>

                                {/* Contact Details Card */}
                                <div className="flex flex-col gap-3 rounded-xl bg-slate-50/70 p-3.5 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                                    {/* Telepon */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            Kontak Telepon
                                        </span>
                                        {activeDetail.phone ? (
                                            <div className="flex items-center justify-between gap-2">
                                                <a
                                                    href={`tel:${activeDetail.phone}`}
                                                    className="text-xs font-semibold tabular-nums text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors"
                                                >
                                                    {activeDetail.phone}
                                                </a>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(activeDetail.phone, 'phone')}
                                                        title="Salin nomor telepon"
                                                        className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                                                    >
                                                        {copiedPhone ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                                                    </button>
                                                    {getWaLink(activeDetail.phone) && (
                                                        <a
                                                            href={getWaLink(activeDetail.phone)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Buka WhatsApp"
                                                            className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/60 transition-colors"
                                                        >
                                                            <MessageCircle size={13} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Belum dicatat</span>
                                        )}
                                    </div>

                                    {/* Alamat */}
                                    <div className="flex flex-col gap-1 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                Alamat Gudang / Kantor
                                            </span>
                                            {activeDetail.address && (
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(activeDetail.address, 'address')}
                                                    title="Salin alamat"
                                                    className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                                                >
                                                    {copiedAddress ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {activeDetail.address || <span className="italic text-slate-400">Belum dicatat</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* Purchase Stats Callout */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            Total Transaksi
                                        </span>
                                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                                            {activeDetail.purchases_count ?? (activeDetail.purchases?.length || 0)} faktur
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            Total Belanja
                                        </span>
                                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                                            {rupiah(activeDetail.total_spend ?? 0)}
                                        </p>
                                    </div>
                                </div>

                                {/* Recent Purchases Section */}
                                <div className="flex flex-col gap-2.5 pt-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <Receipt size={14} className="text-blue-600 dark:text-blue-400" />
                                            Riwayat Pembelian Terbaru
                                        </span>
                                        {activeDetail.purchases && activeDetail.purchases.length > 0 && (
                                            <Link
                                                href={route('restok.riwayat')}
                                                className="text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                Semua
                                            </Link>
                                        )}
                                    </div>

                                    {activeDetail.purchases && activeDetail.purchases.length > 0 ? (
                                        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden">
                                            {activeDetail.purchases.map((p, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                                            {p.date}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <Package size={11} />
                                                            {p.kinds} jenis barang
                                                        </p>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                                                        {rupiah(p.total)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                                Belum ada transaksi restok dari supplier ini.
                                            </p>
                                            <Link
                                                href={route('restok.create')}
                                                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                + Catat Restok Pertama
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Primary Quick Action Button */}
                                <Link
                                    href={route('restok.create')}
                                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white transition-all"
                                >
                                    <PackageCheck size={16} />
                                    Buat Restok dari Supplier Ini
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                                    <Truck size={24} />
                                </div>
                                <h3 className="mt-3.5 text-sm font-bold text-slate-900 dark:text-white">
                                    Pilih Salah Satu Supplier
                                </h3>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px]">
                                    Klik baris supplier pada tabel untuk memeriksa nomor telepon, alamat gudang, serta rincian riwayat faktur.
                                </p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {/* In-place Delete Confirmation Modal */}
            <Modal show={Boolean(deletingSupplier)} onClose={() => setDeletingSupplier(null)} maxWidth="md">
                <div className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                        <Trash2 size={24} />
                    </div>

                    <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                        Hapus Rekanan Supplier?
                    </h3>

                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Apakah Anda yakin ingin menghapus{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                            &quot;{deletingSupplier?.name}&quot;
                        </strong>
                        ? Data rekanan akan dihapus dari daftar aktif, namun seluruh histori faktur pembelian lama tetap
                        tersimpan untuk audit.
                    </p>

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setDeletingSupplier(null)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 active:scale-95 transition-all shadow-sm shadow-red-600/20"
                        >
                            Ya, Hapus Supplier
                        </button>
                    </div>
                </div>
            </Modal>
        </TriposLayout>
    );
}
