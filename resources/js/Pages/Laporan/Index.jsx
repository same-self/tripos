import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageTitle from '@/Components/PageTitle';
import Pagination, { usePagination } from '@/Components/Pagination';
import DateRange from '@/Components/DateRange';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const TABS = [
    { key: 'penjualan', label: 'Penjualan' },
    { key: 'ranking', label: 'Ranking Penjualan' },
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
    const pager = usePagination(data.days.length, 10);

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
                                <tr key={i} className={`${pager.rowClass(i)} border-b border-[#E5E7EB] dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors`}>
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
                    <Pagination pager={pager} />
                </section>
            </div>

            <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[320px]">
                <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Barang paling laku</h2>
                    <p className="text-xs text-[#4B5563] dark:text-slate-400">Terjual dalam {window} hari terakhir ({data.fast} atau lebih)</p>
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
                    <p className="text-xs text-[#4B5563] dark:text-slate-400">Terjual kurang dari {data.slow} dalam {window} hari terakhir</p>
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
    const pager = usePagination(data.days.length, 10);
    // Weeks are few, so a short page keeps the table compact. The Total row stays on every page.
    const weekPager = usePagination(data.weeks.length, 4);

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
                            <tr key={i} className={`${weekPager.rowClass(i)} border-b border-[#E5E7EB] dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors`}>
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
                <Pagination pager={weekPager} />
                <p className="mt-4 text-xs text-[#4B5563] dark:text-slate-400">
                    Arus kas bersih = penghasilan dikurangi pembelian stok. Belum termasuk biaya operasional lain.
                </p>
            </section>

            <section className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Arus kas per hari</h2>
                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-2 py-3">Tanggal</th>
                            <th scope="col" className="px-2 py-3">Penghasilan</th>
                            <th scope="col" className="px-2 py-3">Pembelian</th>
                            <th scope="col" className="px-2 py-3">Arus kas bersih</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.days.map((d, i) => (
                            <tr key={i} className={`${pager.rowClass(i)} border-b border-[#E5E7EB] transition-colors hover:bg-gray-50/50 dark:border-slate-800/80 hover:dark:bg-slate-800/40`}>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{d.label}</td>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{rupiah(d.income)}</td>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">{rupiah(d.spending)}</td>
                                <td className={`px-2 py-3 font-semibold ${d.net < 0 ? 'text-[#B91C1C] dark:text-red-400' : 'text-gray-900 dark:text-slate-100'}`}>{rupiah(d.net)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination pager={pager} />
            </section>
        </div>
    );
}

function OutBadge() {
    return (
        <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-xs font-semibold text-[#B91C1C] dark:bg-red-950/60 dark:text-red-300">
            Stok habis
        </span>
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
                                    {item.out_of_stock ? <OutBadge /> : `${item.stock} ${item.unit}`}
                                </td>
                                <td className="px-2 py-3 text-[#4B5563] dark:text-slate-400">
                                    {item.out_of_stock ? 'Perlu restok' : item.days_left === null ? '-' : item.days_left === 0 ? 'Hari ini' : `±${item.days_left} hari`}
                                </td>
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
                                    {item.out_of_stock ? <OutBadge /> : `${item.stock} ${item.unit}`}
                                </td>
                                <td className="px-2 py-3 font-semibold text-gray-900 dark:text-slate-100">
                                    {item.out_of_stock ? <span className="font-normal text-[#4B5563] dark:text-slate-400">Tidak ada modal tertahan</span> : rupiah(item.idle_capital)}
                                </td>
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

// Verdict -> label and colors. The rules live on the server (ProfitabilityService); this is only how they look.
function Ranking({ data, window }) {
    const [kind, setKind] = useState('semua');
    const rows = data.rows.filter((row) => kind === 'semua' || row.kind === kind);
    const pager = usePagination(rows.length, 10);

    // Changing the filter starts again from page 1
    useEffect(() => pager.setPage(1), [kind]);

    return (
        <div className="flex flex-col gap-5 lg:flex-row">
            <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Ranking penjualan barang dan jasa</h2>
                        <p className="mt-1 text-xs text-[#4B5563] dark:text-slate-400">
                            Dari penjualan {window} hari terakhir, diurutkan dari pendapatan terbesar.
                        </p>
                    </div>
                    <div className="flex gap-1.5 print:hidden" role="group" aria-label="Jenis">
                        {KIND_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setKind(f.key)}
                                aria-pressed={kind === f.key}
                                className={`rounded-full px-3.5 py-1.5 text-[13px] ${
                                    kind === f.key
                                        ? 'bg-[#1D4ED8] font-semibold text-white dark:bg-blue-600'
                                        : 'border border-[#E5E7EB] bg-white font-medium text-[#4B5563] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-2 py-3">#</th>
                            <th scope="col" className="px-2 py-3">Nama</th>
                            <th scope="col" className="px-2 py-3">Terjual</th>
                            <th scope="col" className="px-2 py-3">Pendapatan</th>
                            <th scope="col" className="px-2 py-3">Porsi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={row.key} className={`${pager.rowClass(i)} border-b border-[#E5E7EB] transition-colors hover:bg-gray-50/50 dark:border-slate-800/80 hover:dark:bg-slate-800/40`}>
                                <td className="px-2 py-3 text-[#4B5563] dark:text-slate-400">{row.rank}</td>
                                <td className="px-2 py-3 font-medium text-gray-900 dark:text-slate-100">
                                    {row.name}
                                    {row.kind === 'jasa' && (
                                        <span className="ml-2 rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[11px] font-semibold text-[#6D28D9] dark:bg-purple-950/60 dark:text-purple-300">Jasa</span>
                                    )}
                                </td>
                                <td className="px-2 py-3 text-gray-900 dark:text-slate-200">
                                    {Number(row.sold).toLocaleString('id-ID')} {row.unit}
                                </td>
                                <td className="px-2 py-3 font-semibold text-gray-900 dark:text-slate-100">{rupiah(row.revenue)}</td>
                                <td className="px-2 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E5E7EB] dark:bg-slate-800">
                                            <div className="h-full rounded-full bg-[#1D4ED8] dark:bg-blue-500" style={{ width: `${Math.min(100, row.share)}%` }} />
                                        </div>
                                        <span className="text-xs text-[#4B5563] dark:text-slate-400">{row.share}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {rows.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#4B5563] dark:text-slate-400">Belum ada penjualan di periode ini.</p>
                )}
                <Pagination pager={pager} />
            </section>

            <aside className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-[280px] dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Ringkasan</h2>
                <div>
                    <p className="text-xs text-[#4B5563] dark:text-slate-400">Total pendapatan</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{rupiah(data.total)}</p>
                </div>
                <div>
                    <p className="text-xs text-[#4B5563] dark:text-slate-400">Barang terjual</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{data.items} jenis</p>
                </div>
                <div>
                    <p className="text-xs text-[#4B5563] dark:text-slate-400">Jasa terjual</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{data.services} jenis</p>
                </div>
            </aside>
        </div>
    );
}

const VERDICT = {
    unggulan: { label: 'Paling menguntungkan', badge: 'bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-300' },
    sehat: { label: 'Menguntungkan', badge: 'bg-[#DBEAFE] dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-400' },
    tipis: { label: 'Margin tipis', badge: 'bg-[#FEF3C7] dark:bg-amber-950/60 text-[#B45309] dark:text-amber-400' },
    rugi: { label: 'Rugi', badge: 'bg-[#FEE2E2] dark:bg-red-950/60 text-[#B91C1C] dark:text-red-400' },
};

const KIND_FILTERS = [
    { key: 'semua', label: 'Semua' },
    { key: 'barang', label: 'Barang' },
    { key: 'jasa', label: 'Jasa' },
];

const percent = (n) => (n === null || n === undefined ? '-' : `${Number(n).toLocaleString('id-ID')}%`);

function Keuntungan({ data, window }) {
    const [kind, setKind] = useState('semua');

    const rows = data.rows.filter((row) => kind === 'semua' || row.kind === kind);
    const hasService = data.rows.some((row) => row.kind === 'jasa');

    return (
        <div className="flex flex-col gap-5 lg:flex-row">
            <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-[15px] font-semibold">Ranking keuntungan barang dan jasa</h2>
                        <p className="mt-1 text-xs text-[#4B5563] dark:text-slate-400">Dari penjualan {window} hari terakhir, diurutkan dari untung terbesar.</p>
                    </div>

                    <div className="flex gap-1.5" role="group" aria-label="Jenis">
                        {KIND_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setKind(f.key)}
                                aria-pressed={kind === f.key}
                                className={`rounded-full px-3.5 py-1.5 text-[13px] ${
                                    kind === f.key
                                        ? 'bg-[#1D4ED8] font-semibold text-white'
                                        : 'border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-[#4B5563] dark:text-slate-400'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-2 py-3">No</th>
                            <th scope="col" className="px-2 py-3">Nama</th>
                            <th scope="col" className="px-2 py-3">Terjual</th>
                            <th scope="col" className="px-2 py-3">Pendapatan</th>
                            <th scope="col" className="px-2 py-3">Untung</th>
                            <th scope="col" className="px-2 py-3">Margin</th>
                            <th scope="col" className="px-2 py-3">Penilaian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.key} className="border-b border-[#E5E7EB] dark:border-slate-800 align-top">
                                <td className="px-2 py-3 text-[#4B5563] dark:text-slate-400">{row.rank}</td>
                                <td className="px-2 py-3 font-medium">
                                    {row.name}
                                    {row.kind === 'jasa' && (
                                        <span className="ml-2 rounded-full bg-[#EDE9FE] dark:bg-purple-950/60 px-2 py-0.5 text-[11px] font-semibold text-[#6D28D9] dark:text-purple-300">
                                            Jasa
                                        </span>
                                    )}
                                </td>
                                <td className="px-2 py-3">
                                    {Number(row.sold).toLocaleString('id-ID')} {row.unit}
                                </td>
                                <td className="px-2 py-3">{rupiah(row.revenue)}</td>
                                <td className={`px-2 py-3 font-semibold ${row.profit < 0 ? 'text-[#B91C1C] dark:text-red-400' : ''}`}>
                                    {rupiah(row.profit)}
                                    {row.estimated && <span className="ml-1 text-xs font-normal text-[#4B5563] dark:text-slate-400">(perkiraan)</span>}
                                </td>
                                <td className="px-2 py-3">{percent(row.margin)}</td>
                                <td className="px-2 py-3">
                                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${VERDICT[row.verdict].badge}`}>
                                        {VERDICT[row.verdict].label}
                                    </span>
                                    <p className="mt-1 max-w-[220px] text-xs text-[#4B5563] dark:text-slate-400">{row.reason}</p>
                                </td>
                            </tr>
                        ))}
                        {rows.length > 0 && (
                            <tr className="font-bold">
                                <td className="px-2 py-3"></td>
                                <td className="px-2 py-3">Total keuntungan</td>
                                <td className="px-2 py-3"></td>
                                <td className="px-2 py-3">{rupiah(rows.reduce((sum, row) => sum + row.revenue, 0))}</td>
                                <td className="px-2 py-3">{rupiah(rows.reduce((sum, row) => sum + row.profit, 0))}</td>
                                <td className="px-2 py-3"></td>
                                <td className="px-2 py-3"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {rows.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#4B5563] dark:text-slate-400">Belum ada penjualan di periode ini.</p>
                )}
            </section>

            <aside className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 lg:w-[320px]">
                <h2 className="text-[15px] font-semibold">Ringkasan penilaian</h2>

                {Object.entries(VERDICT).map(([key, v]) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.badge}`}>{v.label}</span>
                        <span className="text-lg font-bold">{data.summary.counts[key]}</span>
                    </div>
                ))}

                <div className="h-px bg-[#E5E7EB] dark:bg-slate-800" />

                <div>
                    <p className="text-[13px] font-semibold">Cara menilai</p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-[#4B5563] dark:text-slate-400">
                        <li>
                            <strong>Rugi</strong>: dijual di bawah modal.
                        </li>
                        <li>
                            <strong>Margin tipis</strong>: untung kurang dari {data.thin_margin}% dari penjualan.
                        </li>
                        <li>
                            <strong>Paling menguntungkan</strong>: 3 untung terbesar.
                        </li>
                    </ul>
                    <p className="mt-2 text-xs text-[#4B5563] dark:text-slate-400">Perhitungan memakai aturan tetap, bukan tebakan, jadi alasannya selalu terlihat.</p>
                </div>

                {hasService && (
                    <p className="rounded-xl bg-[#FEF3C7] dark:bg-amber-950/60 p-3 text-xs text-[#92400E] dark:text-amber-300">
                        Untung jasa adalah perkiraan: hanya menghitung bahan (misalnya kertas). Tinta, listrik, dan tenaga belum
                        dihitung.
                    </p>
                )}
            </aside>
        </div>
    );
}

export default function Index({ tab, periode, dari, sampai, window, penjualan, ranking, pembelian, arusKas, terlaris, keuntungan }) {
    const tabLabel = TABS.find((t) => t.key === tab)?.label ?? 'Penjualan';

    // Print / "Ekspor PDF" is always light, even when the screen is in dark mode.
    useEffect(() => {
        const root = document.documentElement;
        let wasDark = false;
        const before = () => {
            wasDark = root.classList.contains('dark');
            root.classList.remove('dark');
        };
        const after = () => {
            if (wasDark) root.classList.add('dark');
        };
        globalThis.addEventListener('beforeprint', before);
        globalThis.addEventListener('afterprint', after);
        return () => {
            globalThis.removeEventListener('beforeprint', before);
            globalThis.removeEventListener('afterprint', after);
            after();
        };
    }, []);

    return (
        <TriposLayout active="Laporan">
            <Head title="Laporan" />

            <div id="printable-report" className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <PageTitle icon={FileText}>Laporan</PageTitle>
                        <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                            Rekap penjualan, pembelian, dan arus kas untuk pengambilan keputusan.
                        </p>
                    </div>

                    {/* Period and export button: hidden when printing */}
                    <div className="flex items-center gap-3 print:hidden">
                        {[7, 30].map((p) => (
                            <PillLink key={p} active={!dari && periode === p} href={route('laporan.index', { tab, periode: p })}>
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

                <DateRange
                    key={`${dari}-${sampai}`}
                    dari={dari}
                    sampai={sampai}
                    onApply={(d, s) => router.get(route('laporan.index'), { tab, dari: d, sampai: s })}
                    onClear={() => router.get(route('laporan.index'), { tab, periode: 7 })}
                />

                {/* Shown only on the printed page */}
                <div className="hidden print:block">
                    <p className="text-sm font-semibold">
                        Laporan {tabLabel} · {dari ? `${dari} s/d ${sampai}` : `${periode} hari terakhir`}
                    </p>
                    <p className="text-xs text-[#4B5563] dark:text-slate-400">Dicetak {new Date().toLocaleString('id-ID')}</p>
                </div>

                <div className="flex flex-wrap gap-2 print:hidden">
                    {TABS.map((t) => (
                        <PillLink key={t.key} active={tab === t.key} href={route('laporan.index', dari ? { tab: t.key, dari, sampai } : { tab: t.key, periode })}>
                            {t.label}
                        </PillLink>
                    ))}
                </div>

                {tab === 'penjualan' && penjualan && <Penjualan data={penjualan} window={window} />}
                {tab === 'ranking' && ranking && <Ranking data={ranking} window={window} />}
                {tab === 'pembelian' && pembelian && <Pembelian data={pembelian} />}
                {tab === 'arus-kas' && arusKas && <ArusKas data={arusKas} />}
                {tab === 'terlaris' && terlaris && <TerlarisLambat data={terlaris} />}
                {tab === 'keuntungan' && keuntungan && <Keuntungan data={keuntungan} window={window} />}
            </div>
        </TriposLayout>
    );
}