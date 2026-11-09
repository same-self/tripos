import CashierLayout from '@/Layouts/CashierLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    Search,
    ShoppingBag,
    DollarSign,
    Banknote,
    QrCode,
    Printer,
    X,
    Eye,
    ReceiptText,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import ThermalReceipt from '@/Components/ThermalReceipt';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

function StatCard({ title, value, subtext, icon: Icon, colorClass, borderClass, bgClass, iconBgClass }) {
    return (
        <div className={`flex items-start justify-between rounded-2xl border p-4 shadow-sm transition-all duration-150 ${bgClass} ${borderClass}`}>
            <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{title}</p>
                <p className={`text-xl font-bold tracking-tight ${colorClass}`}>{value}</p>
                {subtext && <p className="text-[11px] text-gray-400 dark:text-slate-500">{subtext}</p>}
            </div>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBgClass}`}>
                <Icon size={18} className={colorClass} aria-hidden="true" />
            </span>
        </div>
    );
}

export default function History({ sales, search: initialSearch, summary }) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const searchRef = useRef(null);

    // Keyboard shortcut "/" to focus search input
    useEffect(() => {
        function handleKey(event) {
            const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
            if (event.key === '/' && !isTyping && !selectedReceipt) {
                event.preventDefault();
                searchRef.current?.focus();
            }
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [selectedReceipt]);

    // Modal keyboard shortcuts (Esc to close, P to print)
    useEffect(() => {
        if (!selectedReceipt) return;

        // Blur background active element if it's an input/textarea so shortcut isn't blocked or leaked
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
            document.activeElement.blur();
        }

        function handleModalKey(e) {
            const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
            if (e.key === 'Escape') {
                e.preventDefault();
                setSelectedReceipt(null);
            } else if (!isTyping && e.key.toLowerCase() === 'p' && !e.altKey && !(e.ctrlKey && e.shiftKey)) {
                e.preventDefault();
                window.print();
            }
        }

        window.addEventListener('keydown', handleModalKey);
        return () => window.removeEventListener('keydown', handleModalKey);
    }, [selectedReceipt]);

    function handleSearchSubmit(e) {
        e.preventDefault();
        router.get(
            route('kasir.riwayat'),
            { cari: search },
            { preserveState: true, replace: true },
        );
    }

    function clearSearch() {
        setSearch('');
        router.get(
            route('kasir.riwayat'),
            {},
            { preserveState: true, replace: true },
        );
    }

    return (
        <CashierLayout active="Riwayat Shift">
            <Head title="Riwayat Shift Kasir" />

            <div className={`flex flex-col gap-6 ${selectedReceipt ? 'print:hidden' : ''}`}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Riwayat Shift Kasir</h1>
                        <p className="mt-0.5 text-xs text-[#4B5563] dark:text-slate-400">
                            Daftar penjualan hari ini untuk verifikasi transaksi, serah terima kas, dan cetak salinan struk.
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        <Clock size={14} />
                        <span>Shift Hari Ini</span>
                    </div>
                </div>

                {/* 4 Summary Metric Cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Transaksi"
                        value={`${summary.total_tx} Transaksi`}
                        subtext="Penjualan selesai hari ini"
                        icon={ShoppingBag}
                        colorClass="text-blue-600 dark:text-blue-400"
                        bgClass="bg-white dark:bg-slate-900"
                        borderClass="border-gray-200 dark:border-slate-800"
                        iconBgClass="bg-blue-50 dark:bg-blue-950/60"
                    />
                    <StatCard
                        title="Total Omzet Shift"
                        value={rupiah(summary.total_omzet)}
                        subtext="Akumulasi pendapatan hari ini"
                        icon={DollarSign}
                        colorClass="text-emerald-600 dark:text-emerald-400"
                        bgClass="bg-white dark:bg-slate-900"
                        borderClass="border-gray-200 dark:border-slate-800"
                        iconBgClass="bg-emerald-50 dark:bg-emerald-950/60"
                    />
                    <StatCard
                        title="Uang Kas Tunai"
                        value={rupiah(summary.total_cash)}
                        subtext="Fisik uang di laci kasir"
                        icon={Banknote}
                        colorClass="text-amber-600 dark:text-amber-400"
                        bgClass="bg-white dark:bg-slate-900"
                        borderClass="border-gray-200 dark:border-slate-800"
                        iconBgClass="bg-amber-50 dark:bg-amber-950/60"
                    />
                    <StatCard
                        title="Non-Tunai (QRIS)"
                        value={rupiah(summary.total_non_cash)}
                        subtext="Masuk ke rekening digital"
                        icon={QrCode}
                        colorClass="text-indigo-600 dark:text-indigo-400"
                        bgClass="bg-white dark:bg-slate-900"
                        borderClass="border-gray-200 dark:border-slate-800"
                        iconBgClass="bg-indigo-50 dark:bg-indigo-950/60"
                    />
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <label className="relative flex flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <Search size={18} className="text-gray-400 dark:text-slate-500 shrink-0" aria-hidden="true" />
                        <span className="sr-only">Cari nomor transaksi</span>
                        <input
                            ref={searchRef}
                            type="text"
                            autoComplete="off"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nomor nota transaksi (cth: TRX-20261108...)..."
                            className="min-w-0 flex-1 border-0 p-0 text-sm focus:ring-0 placeholder:text-gray-400 dark:bg-transparent dark:text-white dark:placeholder-slate-500"
                        />
                        {!search ? (
                            <kbd className="hidden sm:inline-block rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                /
                            </kbd>
                        ) : (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="text-gray-400 hover:text-gray-600 p-0.5 dark:text-slate-500 dark:hover:text-slate-300"
                                aria-label="Hapus pencarian"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </label>
                    <button
                        type="submit"
                        className="rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                    >
                        Cari
                    </button>
                </form>

                {/* Transaction Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {sales.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500 mb-3">
                                <ReceiptText size={28} />
                            </div>
                            <p className="text-base font-semibold text-gray-800 dark:text-slate-200">
                                {search ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi di shift ini'}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                {search ? 'Coba periksa kembali nomor nota yang dicari.' : 'Transaksi yang Anda proses di layar POS akan otomatis muncul di sini.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-gray-100 bg-[#F9FAFB] text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                                    <tr>
                                        <th className="px-5 py-3.5">No. Transaksi</th>
                                        <th className="px-5 py-3.5">Waktu</th>
                                        <th className="px-5 py-3.5">Item</th>
                                        <th className="px-5 py-3.5">Metode Bayar</th>
                                        <th className="px-5 py-3.5 text-right">Total Belanja</th>
                                        <th className="px-5 py-3.5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {sales.data.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="whitespace-nowrap px-5 py-3.5 font-mono font-medium text-gray-900 dark:text-white">
                                                {tx.receipt_number}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-gray-600 dark:text-slate-300">
                                                {tx.time} <span className="text-[10px] text-gray-400">WIB</span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-gray-600 dark:text-slate-300">
                                                {tx.items_count} item
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                                        tx.method_value === 'cash'
                                                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                                    }`}
                                                >
                                                    {tx.method_value === 'cash' ? <Banknote size={12} /> : <QrCode size={12} />}
                                                    {tx.method}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-right font-bold text-gray-900 dark:text-white">
                                                {rupiah(tx.total)}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedReceipt(tx.receipt)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                                                >
                                                    <Printer size={13} />
                                                    Cetak Salinan
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Pop-up Cetak Ulang Salinan Struk */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-popover print:static print:p-0 print:m-0 print:bg-transparent print:block">
                    <div className="relative flex max-h-[92vh] w-full max-w-[400px] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden print:static print:max-h-none print:w-full print:max-w-none print:border-none print:shadow-none print:bg-transparent print:p-0">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-slate-800 print:hidden">
                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                    <ReceiptText size={16} />
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Salinan Struk Transaksi</h3>
                                    <p className="text-[11px] text-gray-500 dark:text-slate-400">{selectedReceipt.number}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedReceipt(null)}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                                aria-label="Tutup struk"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Struk Content */}
                        <div className="overflow-y-auto p-4 bg-gray-50/50 dark:bg-slate-950/40 print:overflow-visible print:p-0 print:bg-transparent">
                            <ThermalReceipt receipt={selectedReceipt} isCopy={true} />
                        </div>

                        {/* Modal Actions */}
                        <div className="flex flex-col gap-2 border-t border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 print:hidden">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                            >
                                <Printer size={16} />
                                Cetak Salinan Struk (P)
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedReceipt(null)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Tutup (Esc)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CashierLayout>
    );
}
