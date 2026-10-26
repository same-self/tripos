import CashierLayout from '@/Layouts/CashierLayout';
import { Head, Link } from '@inertiajs/react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

function Divider() {
    return <div className="my-3 h-px bg-[#E5E7EB]" />;
}

export default function Struk({ receipt }) {
    return (
        <CashierLayout active="Transaksi (POS)">
            <Head title="Struk" />

            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center lg:pt-10">
                {/* The receipt, laid out like the Struk Cetak in Figma */}
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

                {/* Actions and success message: hidden when printing */}
                <div className="flex w-full max-w-[380px] flex-col items-center gap-5 print:hidden">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7] text-2xl text-[#15803D]">
                        ✓
                    </div>

                    <div className="text-center">
                        <h1 className="text-[22px] font-bold">Transaksi berhasil</h1>
                        <p className="mt-2 text-sm text-[#4B5563]">
                            {receipt.is_cash
                                ? `Pembayaran tunai diterima. Kembalian ${rupiah(receipt.change)} sudah diberikan ke pelanggan.`
                                : `Pembayaran ${receipt.method} sebesar ${rupiah(receipt.amount_paid)} sudah diterima.`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full rounded-xl bg-[#1D4ED8] py-3.5 font-semibold text-white"
                    >
                        Cetak struk
                    </button>

                    <Link
                        href={route('kasir.pos')}
                        className="w-full rounded-xl border border-[#6B7280] py-3.5 text-center font-medium"
                    >
                        Selesai tanpa cetak
                    </Link>
                </div>
            </div>
        </CashierLayout>
    );
}