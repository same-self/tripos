import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link } from '@inertiajs/react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

function Divider() {
    return <div className="my-3 h-px bg-[#E5E7EB] dark:bg-slate-800" />;
}

export default function Show({ receipt }) {
    return (
        <TriposLayout active="Transaksi (POS)">
            <Head title={`Struk ${receipt.number}`} />

            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:pt-8">
                {/* The receipt, laid out like the cashier's Struk Cetak in Figma */}
                <article className="w-full max-w-[320px] rounded-md border border-[#E5E7EB] bg-white p-5 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 print:border print:border-gray-300 print:bg-white print:text-black">
                    <header className="flex flex-col items-center gap-0.5 text-center">
                        <p className="text-base font-bold text-gray-900 dark:text-white print:text-black">TRIPOS</p>
                        <p className="text-[13px] font-medium text-gray-800 dark:text-slate-200 print:text-black">UMKM Fotocopy Trisanet</p>
                        <p className="text-[#4B5563] dark:text-slate-400 print:text-gray-600">Cipeucang, Cileungsi, Kab. Bogor</p>
                    </header>

                    <Divider />

                    <dl className="flex flex-col gap-1">
                        <div className="flex justify-between">
                            <dt className="text-[#4B5563] dark:text-slate-400 print:text-gray-600">No. transaksi</dt>
                            <dd className="font-medium text-gray-900 dark:text-white print:text-black">{receipt.number}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-[#4B5563] dark:text-slate-400 print:text-gray-600">Tanggal</dt>
                            <dd className="font-medium text-gray-900 dark:text-white print:text-black">{receipt.date}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-[#4B5563] dark:text-slate-400 print:text-gray-600">Kasir</dt>
                            <dd className="font-medium text-gray-900 dark:text-white print:text-black">{receipt.cashier}</dd>
                        </div>
                    </dl>

                    <Divider />

                    <ul className="flex flex-col gap-2">
                        {receipt.lines.map((line, i) => (
                            <li key={i} className="flex justify-between gap-2">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white print:text-black">{line.name}</p>
                                    <p className="text-[#4B5563] dark:text-slate-400 print:text-gray-600">{line.detail}</p>
                                </div>
                                <p className="whitespace-nowrap font-medium text-gray-900 dark:text-white print:text-black">{rupiah(line.subtotal)}</p>
                            </li>
                        ))}
                    </ul>

                    <Divider />

                    <dl className="flex flex-col gap-1">
                        <div className="flex justify-between text-[13px] font-bold text-gray-900 dark:text-white print:text-black">
                            <dt>Total</dt>
                            <dd>{rupiah(receipt.total)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-[#4B5563] dark:text-slate-400 print:text-gray-600">{receipt.method}</dt>
                            <dd className="font-medium text-gray-900 dark:text-white print:text-black">{rupiah(receipt.amount_paid)}</dd>
                        </div>
                        {receipt.is_cash && (
                            <div className="flex justify-between">
                                <dt className="text-[#4B5563] dark:text-slate-400 print:text-gray-600">Kembalian</dt>
                                <dd className="font-medium text-gray-900 dark:text-white print:text-black">{rupiah(receipt.change)}</dd>
                            </div>
                        )}
                    </dl>

                    <Divider />

                    <p className="text-center text-[#4B5563] dark:text-slate-400 print:text-gray-600">Terima kasih, sampai jumpa lagi!</p>
                </article>

                <div className="flex w-full max-w-[380px] flex-col gap-3 print:hidden">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-xl bg-[#1D4ED8] py-3.5 font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Cetak struk
                    </button>
                    <Link
                        href={route('riwayat.index')}
                        className="rounded-xl border border-[#6B7280] py-3.5 text-center font-medium text-[#111827] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                    >
                        Kembali ke riwayat
                    </Link>
                </div>
            </div>
        </TriposLayout>
    );
}