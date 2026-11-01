import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import PageTitle from '@/Components/PageTitle';

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
            className={`rounded-full px-4 py-2 text-[13px] ${
                active ? 'bg-[#1D4ED8] font-semibold text-white' : 'border border-[#E5E7EB] bg-white font-medium text-[#4B5563]'
            }`}
        >
            {children}
        </Link>
    );
}

function Kpi({ label, value }) {
    return (
        <div className="flex flex-1 flex-col gap-1.5 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="text-xs font-medium text-[#4B5563]">{label}</p>
            <p className="text-[22px] font-bold">{value}</p>
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

                <section className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5">
                    <h2 className="text-[15px] font-semibold">Rekap penjualan harian</h2>
                    <table className="mt-4 w-full text-left text-sm">
                        <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
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
                                <tr key={i} className="border-b border-[#E5E7EB]">
                                    <td className="px-2 py-3">{day.label}</td>
                                    <td className="px-2 py-3">{day.count}</td>
                                    <td className="px-2 py-3">{rupiah(day.tunai)}</td>
                                    <td className="px-2 py-3">{rupiah(day.qris)}</td>
                                    <td className="px-2 py-3 font-semibold">{rupiah(day.total)}</td>
                                </tr>
                            ))}
                            <tr className="font-bold">
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
                <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5">
                    <h2 className="text-[15px] font-semibold">Barang paling laku</h2>
                    <p className="text-xs text-[#4B5563]">Terjual dalam {window} hari terakhir (80 atau lebih)</p>
                    {data.terlaris.length === 0 && (
                        <p className="text-sm text-[#4B5563]">Belum ada barang yang laku keras.</p>
                    )}
                    {data.terlaris.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium">{item.name}</span>
                            <span className="whitespace-nowrap font-semibold text-[#15803D]">{item.sold} terjual</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5">
                    <h2 className="text-[15px] font-semibold">Barang paling lambat</h2>
                    <p className="text-xs text-[#4B5563]">Terjual kurang dari 10 dalam {window} hari terakhir</p>
                    {data.lambat.length === 0 && (
                        <p className="text-sm text-[#4B5563]">Tidak ada barang yang lambat.</p>
                    )}
                    {data.lambat.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium">{item.name}</span>
                            <span className="whitespace-nowrap font-semibold text-[#92400E]">{item.sold} terjual</span>
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

            <section className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5">
                <h2 className="text-[15px] font-semibold">Pembelian per supplier</h2>
                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
                        <tr>
                            <th scope="col" className="px-2 py-3">Supplier</th>
                            <th scope="col" className="px-2 py-3">Jumlah restok</th>
                            <th scope="col" className="px-2 py-3">Total pembelian</th>
                            <th scope="col" className="px-2 py-3">Porsi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.suppliers.map((s, i) => (
                            <tr key={i} className="border-b border-[#E5E7EB]">
                                <td className="px-2 py-3 font-medium">{s.name}</td>
                                <td className="px-2 py-3">{s.count} kali</td>
                                <td className="px-2 py-3 font-semibold">{rupiah(s.total)}</td>
                                <td className="px-2 py-3">{s.share}%</td>
                            </tr>
                        ))}
                        <tr className="font-bold">
                            <td className="px-2 py-3">Total</td>
                            <td className="px-2 py-3">{data.count} kali</td>
                            <td className="px-2 py-3">{rupiah(data.total)}</td>
                            <td className="px-2 py-3">100%</td>
                        </tr>
                    </tbody>
                </table>
                {data.suppliers.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#4B5563]">Belum ada pembelian di periode ini.</p>
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

            <section className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5">
                <h2 className="text-[15px] font-semibold">Arus kas per minggu</h2>
                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
                        <tr>
                            <th scope="col" className="px-2 py-3">Minggu</th>
                            <th scope="col" className="px-2 py-3">Penghasilan</th>
                            <th scope="col" className="px-2 py-3">Pembelian</th>
                            <th scope="col" className="px-2 py-3">Arus kas bersih</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.weeks.map((w, i) => (
                            <tr key={i} className="border-b border-[#E5E7EB]">
                                <td className="px-2 py-3">{w.label}</td>
                                <td className="px-2 py-3">{rupiah(w.income)}</td>
                                <td className="px-2 py-3">{rupiah(w.spending)}</td>
                                <td className="px-2 py-3 font-semibold">{rupiah(w.net)}</td>
                            </tr>
                        ))}
                        <tr className="font-bold">
                            <td className="px-2 py-3">Total</td>
                            <td className="px-2 py-3">{rupiah(data.income)}</td>
                            <td className="px-2 py-3">{rupiah(data.spending)}</td>
                            <td className="px-2 py-3">{rupiah(data.net)}</td>
                        </tr>
                    </tbody>
                </table>
                <p className="mt-4 text-xs text-[#4B5563]">
                    Arus kas bersih = penghasilan dikurangi pembelian stok. Belum termasuk biaya operasional lain.
                </p>
            </section>
        </div>
    );
}

function TerlarisLambat({ data }) {
    return (
        <div className="flex flex-col gap-5 lg:flex-row">
            <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5">
                <h2 className="text-[15px] font-semibold">Barang paling laku</h2>
                <p className="mt-1 text-xs text-[#4B5563]">
                    Terjual {data.fast} atau lebih dalam {data.window} hari terakhir
                </p>
                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
                        <tr>
                            <th scope="col" className="px-2 py-3">Barang</th>
                            <th scope="col" className="px-2 py-3">Terjual</th>
                            <th scope="col" className="px-2 py-3">Stok</th>
                            <th scope="col" className="px-2 py-3">Habis dalam</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.laku.map((item, i) => (
                            <tr key={i} className="border-b border-[#E5E7EB]">
                                <td className="px-2 py-3 font-medium">{item.name}</td>
                                <td className="px-2 py-3">{item.sold}</td>
                                <td className="px-2 py-3">
                                    {item.stock} {item.unit}
                                </td>
                                <td className="px-2 py-3">{item.days_left !== null ? `±${item.days_left} hari` : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.laku.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#4B5563]">Belum ada barang yang laku keras.</p>
                )}
            </section>

            <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5">
                <h2 className="text-[15px] font-semibold">Barang paling lambat</h2>
                <p className="mt-1 text-xs text-[#4B5563]">
                    Terjual kurang dari {data.slow} dalam {data.window} hari terakhir
                </p>
                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
                        <tr>
                            <th scope="col" className="px-2 py-3">Barang</th>
                            <th scope="col" className="px-2 py-3">Terjual</th>
                            <th scope="col" className="px-2 py-3">Stok</th>
                            <th scope="col" className="px-2 py-3">Modal mengendap</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.lambat.map((item, i) => (
                            <tr key={i} className="border-b border-[#E5E7EB]">
                                <td className="px-2 py-3 font-medium">{item.name}</td>
                                <td className="px-2 py-3">{item.sold}</td>
                                <td className="px-2 py-3">
                                    {item.stock} {item.unit}
                                </td>
                                <td className="px-2 py-3 font-semibold">{rupiah(item.idle_capital)}</td>
                            </tr>
                        ))}
                        <tr className="font-bold">
                            <td className="px-2 py-3">Total</td>
                            <td className="px-2 py-3"></td>
                            <td className="px-2 py-3"></td>
                            <td className="px-2 py-3">{rupiah(data.lambatTotal)}</td>
                        </tr>
                    </tbody>
                </table>
                {data.lambat.length === 0 && (
                    <p className="py-6 text-center text-sm text-[#4B5563]">Tidak ada barang yang lambat.</p>
                )}
            </section>
        </div>
    );
}

// Verdict -> label and colors. The rules live on the server (ProfitabilityService); this is only how they look.
const VERDICT = {
    unggulan: { label: 'Paling menguntungkan', badge: 'bg-[#DCFCE7] text-[#15803D]' },
    sehat: { label: 'Menguntungkan', badge: 'bg-[#DBEAFE] text-[#1D4ED8]' },
    tipis: { label: 'Margin tipis', badge: 'bg-[#FEF3C7] text-[#B45309]' },
    rugi: { label: 'Rugi', badge: 'bg-[#FEE2E2] text-[#B91C1C]' },
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
            <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-[15px] font-semibold">Ranking keuntungan barang dan jasa</h2>
                        <p className="mt-1 text-xs text-[#4B5563]">Dari penjualan {window} hari terakhir, diurutkan dari untung terbesar.</p>
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
                                        : 'border border-[#E5E7EB] bg-white font-medium text-[#4B5563]'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <table className="mt-4 w-full text-left text-sm">
                    <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
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
                            <tr key={row.key} className="border-b border-[#E5E7EB] align-top">
                                <td className="px-2 py-3 text-[#4B5563]">{row.rank}</td>
                                <td className="px-2 py-3 font-medium">
                                    {row.name}
                                    {row.kind === 'jasa' && (
                                        <span className="ml-2 rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[11px] font-semibold text-[#6D28D9]">
                                            Jasa
                                        </span>
                                    )}
                                </td>
                                <td className="px-2 py-3">
                                    {Number(row.sold).toLocaleString('id-ID')} {row.unit}
                                </td>
                                <td className="px-2 py-3">{rupiah(row.revenue)}</td>
                                <td className={`px-2 py-3 font-semibold ${row.profit < 0 ? 'text-[#B91C1C]' : ''}`}>
                                    {rupiah(row.profit)}
                                    {row.estimated && <span className="ml-1 text-xs font-normal text-[#4B5563]">(perkiraan)</span>}
                                </td>
                                <td className="px-2 py-3">{percent(row.margin)}</td>
                                <td className="px-2 py-3">
                                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${VERDICT[row.verdict].badge}`}>
                                        {VERDICT[row.verdict].label}
                                    </span>
                                    <p className="mt-1 max-w-[220px] text-xs text-[#4B5563]">{row.reason}</p>
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
                    <p className="py-6 text-center text-sm text-[#4B5563]">Belum ada penjualan di periode ini.</p>
                )}
            </section>

            <aside className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-[320px]">
                <h2 className="text-[15px] font-semibold">Ringkasan penilaian</h2>

                {Object.entries(VERDICT).map(([key, v]) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.badge}`}>{v.label}</span>
                        <span className="text-lg font-bold">{data.summary.counts[key]}</span>
                    </div>
                ))}

                <div className="h-px bg-[#E5E7EB]" />

                <div>
                    <p className="text-[13px] font-semibold">Cara menilai</p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-[#4B5563]">
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
                    <p className="mt-2 text-xs text-[#4B5563]">Perhitungan memakai aturan tetap, bukan tebakan, jadi alasannya selalu terlihat.</p>
                </div>

                {hasService && (
                    <p className="rounded-xl bg-[#FEF3C7] p-3 text-xs text-[#92400E]">
                        Untung jasa adalah perkiraan: hanya menghitung bahan (misalnya kertas). Tinta, listrik, dan tenaga belum
                        dihitung.
                    </p>
                )}
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
                        <PageTitle icon={FileText}>Laporan</PageTitle>
                        <p className="mt-1 text-[13px] text-[#4B5563]">
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
                            className="rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white"
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