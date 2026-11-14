import TriposLayout from '@/Layouts/TriposLayout';
import ThermalReceipt from '@/Components/ThermalReceipt';
import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { ArrowLeft, Printer, CheckCircle2, Calendar, User, CreditCard } from 'lucide-react';

export default function Show({ receipt }) {
    useEffect(() => {
        function handleKey(e) {
            const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
            if (!isTyping && e.key.toLowerCase() === 'p' && !e.altKey && !(e.ctrlKey && e.shiftKey)) {
                e.preventDefault();
                window.print();
            }
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

    return (
        <TriposLayout active="Transaksi (POS)">
            <Head title={`Struk ${receipt?.number ?? ''}`} />

            {/* Breadcrumb & Action Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('riwayat.index')}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        title="Kembali ke Riwayat"
                        aria-label="Kembali ke Riwayat"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Detail Transaksi
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 size={12} />
                                Selesai
                            </span>
                        </div>
                        <p className="font-mono text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            {receipt?.number}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href={route('riwayat.index')}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        Kembali
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm"
                    >
                        <Printer size={15} />
                        Cetak Struk (P)
                    </button>
                </div>
            </div>

            {/* Main Content: Left Summary Card + Right Thermal Receipt Preview */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 print:block">
                {/* Left: Detailed Information (Hidden during print) */}
                <div className="space-y-6 lg:col-span-7 print:hidden">
                    {/* Meta Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                            Informasi Transaksi
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-slate-800/60">
                                <Calendar size={18} className="text-gray-400 dark:text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-gray-500 dark:text-slate-400">Waktu Transaksi</p>
                                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                                        {receipt?.date}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-slate-800/60">
                                <User size={18} className="text-gray-400 dark:text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-gray-500 dark:text-slate-400">Kasir Bertugas</p>
                                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                                        {receipt?.cashier}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-slate-800/60">
                                <CreditCard size={18} className="text-gray-400 dark:text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-gray-500 dark:text-slate-400">Metode Pembayaran</p>
                                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                                        {receipt?.method || 'Tunai'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50/70 p-3 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                                <div className="w-full">
                                    <p className="text-blue-700 dark:text-blue-300 font-medium">Total Pembayaran</p>
                                    <p className="font-bold text-blue-900 dark:text-blue-200 text-base mt-0.5">
                                        {rupiah(receipt?.total)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                        <div className="border-b border-gray-100 px-5 py-4 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                                Rincian Barang & Jasa ({receipt?.lines?.length ?? 0} item)
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 text-[11px] font-semibold text-gray-500 dark:bg-slate-800/50 dark:text-slate-400">
                                    <tr>
                                        <th className="px-5 py-3">Deskripsi</th>
                                        <th className="px-5 py-3 text-right">Qty / Detail</th>
                                        <th className="px-5 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {receipt?.lines?.map((line, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                                            <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-slate-100">
                                                {line.name}
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-gray-500 dark:text-slate-400">
                                                {line.detail}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-semibold text-gray-900 dark:text-white">
                                                {rupiah(line.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2 border-gray-200 bg-gray-50/70 font-semibold dark:border-slate-800 dark:bg-slate-950/40">
                                    <tr>
                                        <td colSpan={2} className="px-5 py-3 text-gray-700 dark:text-slate-300">
                                            Total
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                                            {rupiah(receipt?.total)}
                                        </td>
                                    </tr>
                                    {receipt?.is_cash && (
                                        <>
                                            <tr>
                                                <td colSpan={2} className="px-5 py-2 text-xs font-normal text-gray-500 dark:text-slate-400">
                                                    Tunai Diterima
                                                </td>
                                                <td className="px-5 py-2 text-right text-xs font-normal text-gray-700 dark:text-slate-300">
                                                    {rupiah(receipt?.amount_paid)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan={2} className="px-5 py-2 text-xs font-normal text-gray-500 dark:text-slate-400">
                                                    Kembalian
                                                </td>
                                                <td className="px-5 py-2 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {rupiah(receipt?.change)}
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Thermal Receipt Preview */}
                <div className="flex flex-col items-center lg:col-span-5 print:w-full print:block">
                    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 print:border-none print:bg-transparent print:p-0 print:shadow-none">
                        <div className="mb-3 flex items-center justify-between px-1 print:hidden">
                            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                                Preview Struk Fisik
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                                58mm / 80mm
                            </span>
                        </div>

                        <ThermalReceipt receipt={receipt} />

                        <div className="mt-4 flex flex-col gap-2 print:hidden">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] py-2.5 text-xs font-semibold text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm"
                            >
                                <Printer size={15} />
                                Cetak Struk (P)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </TriposLayout>
    );
}
