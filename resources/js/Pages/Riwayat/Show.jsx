import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link } from '@inertiajs/react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

function Divider() {
    return <div className="my-3 h-px bg-[#E5E7EB]" />;
}

export default function Show({ receipt }) {
    return (
        <TriposLayout active="Transaksi (POS)">
            <Head title={`Struk ${receipt.number}`} />

            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:pt-8">
                {/* The receipt, laid out like the cashier's Struk Cetak in Figma */}
                <article className="w-full max-w-[320px] rounded-md border border-[#E5E7EB] bg-white p-5 text-xs">
                    <header className="flex flex-col items-center gap-0.5 text-center">
                        <p className="text-base font-bold">TRIPOS</p>
                        <p className="text-[13px] font-medium">UMKM Fotocopy Trisanet</p>
                        <p className="text-[#4B5563]">Cipeucang, Cileungsi, Kab. Bogor</p>
                    </header>

                    <Divider />

                    <dl className="flex flex-col gap-1">
                        <div className="flex justify-between">
                            <dt className="text-[#4B5563]">No. transaksi</dt>
                            <dd className="font-medium">{receipt.number}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-[#4B5563]">Tanggal</dt>
                            <dd className="font-medium">{receipt.date}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-[#4B5563]">Kasir</dt>
                            <dd className="font-medium">{receipt.cashier}</dd>
                        </div>
                    </dl>

                    <Divider />

                    <ul className="flex flex-col gap-2">
                        {receipt.lines.map((line, i) => (
                            <li key={i} className="flex justify-between gap-2">
                                <div>
                                    <p className="font-medium">{line.name}</p>
                                    <p className="text-[#4B5563]">{line.detail}</p>
                                </div>
                                <p className="whitespace-nowrap font-medium">{rupiah(line.subtotal)}</p>
                            </li>
                        ))}
                    </ul>

                    <Divider />

                    <dl className="flex flex-col gap-1">
                        <div className="flex justify-between text-[13px] font-bold">
                            <dt>Total</dt>
                            <dd>{rupiah(receipt.total)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-[#4B5563]">{receipt.method}</dt>
                            <dd className="font-medium">{rupiah(receipt.amount_paid)}</dd>
                        </div>
                        {receipt.is_cash && (
                            <div className="flex justify-between">
                                <dt className="text-[#4B5563]">Kembalian</dt>
                                <dd className="font-medium">{rupiah(receipt.change)}</dd>
                            </div>
                        )}
                    </dl>

                    <Divider />

                    <p className="text-center text-[#4B5563]">Terima kasih, sampai jumpa lagi!</p>
                </article>

                <div className="flex w-full max-w-[380px] flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-xl bg-[#1D4ED8] py-3.5 font-semibold text-white"
                    >
                        Cetak struk
                    </button>
                    <Link
                        href={route('riwayat.index')}
                        className="rounded-xl border border-[#6B7280] py-3.5 text-center font-medium text-[#111827]"
                    >
                        Kembali ke riwayat
                    </Link>
                </div>
            </div>
        </TriposLayout>
    );
}