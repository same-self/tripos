import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link } from '@inertiajs/react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const TABS = [
    { key: 'penjualan', label: 'Penjualan' },
    { key: 'pembelian', label: 'Pembelian' },
    { key: 'arus-kas', label: 'Arus Kas' },
    { key: 'terlaris', label: 'Terlaris & Lambat' },
    { key: 'keuntungan', label: 'Keuntungan' },
];

function PillLink({ active, href, children }) {
    return (
        <Link
            href={href}
            preserveScroll
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-4 py-2 text-[13px] transition-colors ${
                active
                    ? 'bg-[#1D4ED8] font-semibold text-white dark:bg-blue-600'
                    : 'border border-[#E5E7EB] bg-white font-medium text-[#4B5563] hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
        >
            {children}
        </Link>
    );
}

function Kpi({ label, value }) {
    return (
        <div className="flex flex-1 flex-col gap-1.5 rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium text-[#4B5563] dark:text-slate-400">{label}</p>
            <p className="text-[22px] font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}

function Penjualan({ data, window }) {
    return (
        <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                    <Kpi label="Total penjualan" value={rupiah(data.total)} />
                    <Kpi label="Jumlah transaksi" value={data.count} />
                    <Kpi label="Rata-rata per transaksi" value={rupiah(data.average)} />
                </div>

                <section className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Rekap penjualan harian</h2>
                    <table className="mt-4 w-full text-left text-sm">
                        <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                            <tr>
                                <th scope="col" className="px-2 py-3">Tanggal</th>
                                <th scope="col" className="px-2 py-3">Transaksi</th>
                                <th scope="col" className="px-2 py-3">Tunai</th>
                                <th scope="col" className="px-2 py-3">QRIS</th>
                                <th scope="col" className="px-2 py-3">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.days.map((day, i) => (
                                <tr key={i} className="border-b border-[#E5E7EB] dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                    <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{day.label}</td>
                                    <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{day.count}</td>
                                    <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{rupiah(day.tunai)}</td>
                                    <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{rupiah(day.qris)}</td>
                                    <td className="px-2 py-3 font-semibold text-gray-900 dark:text-slate-100">{rupiah(day.total)}</td>
                                </tr>
                            ))}
                            <tr className="font-bold text-gray-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                                <td className="px-2 py-3">Total periode</td>
                                <td className="px-2 py-3">{data.daysTotal.count}</td>
                                <td className="px-2 py-3">{rupiah(data.daysTotal.tunai)}</td>
                                <td className="px-2 py-3">{rupiah(data.daysTotal.qris)}</td>
                                <td className="px-2 py-3">{rupiah(data.daysTotal.total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>

            <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[320px]">
                <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Barang paling laku</h2>
                    <p className="text-xs text-[#4B5563] dark:text-slate-400">Terjual dalam {window} hari terakhir (80 atau lebih)</p>
                    {data.terlaris.length === 0 && (
                        <p className="text-sm text-[#4B5563] dark:text-slate-400">Belum ada barang yang laku keras.</p>
                    )}
                    {data.terlaris.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-gray-900 dark:text-slate-100">{item.name}</span>
                            <span className="whitespace-nowrap font-semibold text-[#15803D] dark:text-emerald-400">{item.sold} terjual</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Barang paling lambat</h2>
                    <p className="text-xs text-[#4B5563] dark:text-slate-400">Terjual kurang dari 10 dalam {window} hari terakhir</p>
                    {data.lambat.length === 0 && (
                        <p className="text-sm text-[#4B5563] dark:text-slate-400">Tidak ada barang yang lambat.</p>
                    )}
                    {data.lambat.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-gray-900 dark:text-slate-100">{item.name}</span>
                            <span className="whitespace-nowrap font-semibold text-[#92400E] dark:text-amber-400">{item.sold} terjual</span>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}

function Pembelian({ data }) {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row">
                <Kpi label="Total pembelian" value={rupiah(data.total)} />
                <Kpi label="Jumlah restok" value={`${data.count} kali`} />
                <Kpi label="Jumlah supplier" value={data.supplierCount} />
            </div>

            <section className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Pembelian per supplier</h2>
                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-2 py-3">Supplier</th>
                            <th scope="col" className="px-2 py-3">Jumlah restok</th>
                            <th scope="col" className="px-2 py-3">Total pembelian</th>
                            <th scope="col" className="px-2 py-3">Porsi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.suppliers.map((s, i) => (
                            <tr key={i} className="border-b border-[#E5E7EB] dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                <td className="px-2 py-3 font-medium text-gray-900 dark:text-slate-100">{s.name}</td>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{s.count} kali</td>
                                <td className="px-2 py-3 font-semibold text-gray-900 dark:text-slate-100">{rupiah(s.total)}</td>
                                <td className="px-2 py-3 text-[#4B5563] dark:text-slate-400">{s.share}%</td>
                            </tr>
                        ))}
                        <tr className="font-bold text-gray-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                            <td className="px-2 py-3">Total</td>
                            <td className="px-2 py-3">{data.count} kali</td>
                            <td className="px-2 py-3">{rupiah(data.total)}</td>
                            <td className="px-2 py-3">100%</td>
                        </tr>
                    </tbody>
                </table>
                {data.suppliers.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#4B5563] dark:text-slate-400">Belum ada pembelian di periode ini.</p>
                )}
            </section>
        </div>
    );
}

function ArusKas({ data }) {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row">
                <Kpi label="Penghasilan" value={rupiah(data.income)} />
                <Kpi label="Pembelian stok" value={rupiah(data.spending)} />
                <Kpi label="Arus kas bersih" value={rupiah(data.net)} />
            </div>

            <section className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Arus kas per minggu</h2>
                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-2 py-3">Minggu</th>
                            <th scope="col" className="px-2 py-3">Penghasilan</th>
                            <th scope="col" className="px-2 py-3">Pembelian</th>
                            <th scope="col" className="px-2 py-3">Arus kas bersih</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.weeks.map((w, i) => (
                            <tr key={i} className="border-b border-[#E5E7EB] dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{w.label}</td>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{rupiah(w.income)}</td>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{rupiah(w.spending)}</td>
                                <td className="px-2 py-3 font-semibold text-gray-900 dark:text-slate-100">{rupiah(w.net)}</td>
                            </tr>
                        ))}
                        <tr className="font-bold text-gray-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                            <td className="px-2 py-3">Total</td>
                            <td className="px-2 py-3">{rupiah(data.income)}</td>
                            <td className="px-2 py-3">{rupiah(data.spending)}</td>
                            <td className="px-2 py-3">{rupiah(data.net)}</td>
                        </tr>
                    </tbody>
                </table>
                <p className="mt-4 text-xs text-[#4B5563] dark:text-slate-400">
                    Arus kas bersih = penghasilan dikurangi pembelian stok. Belum termasuk biaya operasional lain.
                </p>
            </section>
        </div>
    );
}

function TerlarisLambat({ data }) {
    return (
        <div className="flex flex-col gap-5 lg:flex-row">
            <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Barang paling laku</h2>
                <p className="mt-1 text-xs text-[#4B5563] dark:text-slate-400">
                    Terjual {data.fast} atau lebih dalam {data.window} hari terakhir
                </p>
                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-2 py-3">Barang</th>
                            <th scope="col" className="px-2 py-3">Terjual</th>
                            <th scope="col" className="px-2 py-3">Stok</th>
                            <th scope="col" className="px-2 py-3">Habis dalam</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.laku.map((item, i) => (
                            <tr key={i} className="border-b border-[#E5E7EB] dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                <td className="px-2 py-3 font-medium text-gray-900 dark:text-slate-100">{item.name}</td>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{item.sold}</td>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">
                                    {item.stock} {item.unit}
                                </td>
                                <td className="px-2 py-3 text-[#4B5563] dark:text-slate-400">{item.days_left !== null ? `±${item.days_left} hari` : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.laku.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#4B5563] dark:text-slate-400">Belum ada barang yang laku keras.</p>
                )}
            </section>

            <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Barang paling lambat</h2>
                <p className="mt-1 text-xs text-[#4B5563] dark:text-slate-400">
                    Terjual kurang dari {data.slow} dalam {data.window} hari terakhir
                </p>
                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-2 py-3">Barang</th>
                            <th scope="col" className="px-2 py-3">Terjual</th>
                            <th scope="col" className="px-2 py-3">Stok</th>
                            <th scope="col" className="px-2 py-3">Modal mengendap</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.lambat.map((item, i) => (
                            <tr key={i} className="border-b border-[#E5E7EB] dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                <td className="px-2 py-3 font-medium text-gray-900 dark:text-slate-100">{item.name}</td>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{item.sold}</td>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">
                                    {item.stock} {item.unit}
                                </td>
                                <td className="px-2 py-3 font-semibold text-gray-900 dark:text-slate-100">{rupiah(item.idle_capital)}</td>
                            </tr>
                        ))}
                        <tr className="font-bold text-gray-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                            <td className="px-2 py-3">Total</td>
                            <td className="px-2 py-3"></td>
                            <td className="px-2 py-3"></td>
                            <td className="px-2 py-3">{rupiah(data.lambatTotal)}</td>
                        </tr>
                    </tbody>
                </table>
                {data.lambat.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#4B5563] dark:text-slate-400">Tidak ada barang yang lambat.</p>
                )}
            </section>
        </div>
    );
}

function Keuntungan({ data, window }) {
    return (
        <div className="flex flex-col gap-5 lg:flex-row">
            <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Ranking keuntungan</h2>
                <p className="mt-1 text-xs text-[#4B5563] dark:text-slate-400">Untung per barang dalam {window} hari terakhir</p>
                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-2 py-3">No</th>
                            <th scope="col" className="px-2 py-3">Barang</th>
                            <th scope="col" className="px-2 py-3">Terjual</th>
                            <th scope="col" className="px-2 py-3">Untung / unit</th>
                            <th scope="col" className="px-2 py-3">Total untung</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, i) => (
                            <tr key={i} className="border-b border-[#E5E7EB] dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                <td className="px-2 py-3 text-[#4B5563] dark:text-slate-400">{i + 1}</td>
                                <td className="px-2 py-3 font-medium text-gray-900 dark:text-slate-100">{row.name}</td>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{row.sold}</td>
                                <td className={`px-2 py-3 ${row.per_unit < 0 ? 'text-[#B91C1C] dark:text-red-400' : 'text-gray-900 dark:text-slate-200'}`}>
                                    {rupiah(row.per_unit)}
                                </td>
                                <td className={`px-2 py-3 font-semibold ${row.total < 0 ? 'text-[#B91C1C] dark:text-red-400' : 'text-gray-900 dark:text-slate-100'}`}>
                                    {rupiah(row.total)}
                                </td>
                            </tr>
                        ))}
                        <tr className="font-bold text-gray-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                            <td className="px-2 py-3"></td>
                            <td className="px-2 py-3">Total keuntungan</td>
                            <td className="px-2 py-3"></td>
                            <td className="px-2 py-3"></td>
                            <td className="px-2 py-3">{rupiah(data.total)}</td>
                        </tr>
                    </tbody>
                </table>
                {data.rows.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#4B5563] dark:text-slate-400">Belum ada penjualan barang di periode ini.</p>
                )}
            </section>

            <aside className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-[320px] dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Untung dan rugi</h2>
                <p className="text-xs text-[#4B5563] dark:text-slate-400">Jumlah barang berdasarkan hasil penjualan {window} hari</p>

                <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold text-[#15803D] dark:text-emerald-400">{data.untung} barang</p>
                    <p className="text-xs text-[#4B5563] dark:text-slate-400">Dijual di atas harga modal</p>
                </div>

                <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold text-[#B91C1C] dark:text-red-400">{data.rugi} barang</p>
                    <p className="text-xs text-[#4B5563] dark:text-slate-400">Dijual di bawah harga modal</p>
                </div>
            </aside>
        </div>
    );
}

export default function Index({ tab, periode, window, penjualan, pembelian, arusKas, terlaris, keuntungan }) {
    const tabLabel = TABS.find((t) => t.key === tab)?.label ?? 'Penjualan';

    return (
        <TriposLayout active="Laporan">
            <Head title="Laporan" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Laporan</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                            Rekap penjualan, pembelian, dan arus kas untuk pengambilan keputusan.
                        </p>
                    </div>

                    {/* Period and export button: hidden when printing */}
                    <div className="flex items-center gap-3 print:hidden">
                        {[7, 30].map((p) => (
                            <PillLink key={p} active={periode === p} href={route('laporan.index', { tab, periode: p })}>
                                {p} hari
                            </PillLink>
                        ))}
                        <button
                            type="button"
                            onClick={() => globalThis.print()}
                            className="rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E40AF] dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                        >
                            Ekspor PDF
                        </button>
                    </div>
                </div>

                {/* Shown only on the printed page */}
                <div className="hidden print:block">
                    <p className="text-sm font-semibold">
                        Laporan {tabLabel} · {periode} hari terakhir
                    </p>
                    <p className="text-xs text-[#4B5563]">Dicetak {new Date().toLocaleString('id-ID')}</p>
                </div>

                <div className="flex flex-wrap gap-2 print:hidden">
                    {TABS.map((t) => (
                        <PillLink key={t.key} active={tab === t.key} href={route('laporan.index', { tab: t.key, periode })}>
                            {t.label}
                        </PillLink>
                    ))}
                </div>

                {tab === 'penjualan' && penjualan && <Penjualan data={penjualan} window={window} />}
                {tab === 'pembelian' && pembelian && <Pembelian data={pembelian} />}
                {tab === 'arus-kas' && arusKas && <ArusKas data={arusKas} />}
                {tab === 'terlaris' && terlaris && <TerlarisLambat data={terlaris} />}
                {tab === 'keuntungan' && keuntungan && <Keuntungan data={keuntungan} window={window} />}
            </div>
        </TriposLayout>
    );
}