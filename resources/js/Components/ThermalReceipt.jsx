export default function ThermalReceipt({ receipt, isCopy = false, className = '' }) {
    if (!receipt) return null;

    const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

    return (
        <article
            id="printable-receipt"
            className={`mx-auto w-full max-w-[72mm] rounded-lg border border-gray-200 bg-white p-4 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 ${className}`}
        >
            <header className="flex flex-col items-center gap-0.5 text-center">
                {isCopy && (
                    <span className="mb-1 rounded border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300 print:border-black print:text-black">
                        *** SALINAN STRUK ***
                    </span>
                )}
                <p className="text-base font-bold text-gray-900 dark:text-white print:text-black">TRIPOS</p>
                <p className="text-[13px] font-medium text-gray-800 dark:text-slate-200 print:text-black">UMKM Fotocopy Trisanet</p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 print:text-black">Cipeucang, Cileungsi, Kab. Bogor</p>
            </header>

            <div className="my-2.5 border-b border-dashed border-gray-300 dark:border-slate-700 print:border-black" />

            <dl className="flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-slate-400 print:text-black">No. transaksi</dt>
                    <dd className="font-mono font-medium text-gray-900 dark:text-white print:text-black">{receipt.number || '-'}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-slate-400 print:text-black">Tanggal</dt>
                    <dd className="font-mono font-medium text-gray-900 dark:text-white print:text-black">{receipt.date || '-'}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-slate-400 print:text-black">Kasir</dt>
                    <dd className="font-medium text-gray-900 dark:text-white print:text-black">{receipt.cashier || 'Kasir'}</dd>
                </div>
            </dl>

            <div className="my-2.5 border-b border-dashed border-gray-300 dark:border-slate-700 print:border-black" />

            <ul className="flex flex-col gap-2">
                {receipt.lines?.map((line, i) => (
                    <li key={i} className="flex flex-col gap-0.5 text-xs">
                        <span className="font-medium text-gray-900 dark:text-white break-words print:text-black">{line.name}</span>
                        <div className="flex justify-between items-baseline text-[11px] text-gray-500 dark:text-slate-400 print:text-black">
                            <span>{line.detail}</span>
                            <span className="font-mono font-medium text-gray-900 dark:text-white whitespace-nowrap ml-2 print:text-black">
                                {rupiah(line.subtotal)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="my-2.5 border-b border-dashed border-gray-300 dark:border-slate-700 print:border-black" />

            <dl className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white print:text-black">
                    <dt>Total</dt>
                    <dd className="font-mono">{rupiah(receipt.total)}</dd>
                </div>
                <div className="flex justify-between text-[11px]">
                    <dt className="text-gray-500 dark:text-slate-400 print:text-black">Metode</dt>
                    <dd className="font-medium text-gray-900 dark:text-white print:text-black">{receipt.method || 'Tunai'}</dd>
                </div>
                {receipt.is_cash && (
                    <>
                        <div className="flex justify-between text-[11px]">
                            <dt className="text-gray-500 dark:text-slate-400 print:text-black">Tunai diterima</dt>
                            <dd className="font-mono font-medium text-gray-900 dark:text-white print:text-black">{rupiah(receipt.amount_paid)}</dd>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <dt className="text-gray-500 dark:text-slate-400 print:text-black">Kembalian</dt>
                            <dd className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 print:text-black">{rupiah(receipt.change)}</dd>
                        </div>
                    </>
                )}
            </dl>

            <div className="my-2.5 border-b border-dashed border-gray-300 dark:border-slate-700 print:border-black" />

            <p className="text-center text-[10px] text-gray-500 dark:text-slate-400 print:text-black">
                {isCopy ? (
                    <>
                        [SALINAN CETAK ULANG]<br />
                        Terima kasih atas kunjungan Anda.
                    </>
                ) : (
                    <>
                        Terima kasih atas kunjungan Anda.<br />
                        Barang yang dibeli tidak dapat ditukar/dikembalikan.
                    </>
                )}
            </p>
        </article>
    );
}
