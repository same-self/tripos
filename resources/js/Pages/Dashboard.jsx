import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, TrendingUp, Wallet } from 'lucide-react';
import PageTitle from '@/Components/PageTitle';
import SummaryCard from '@/Components/SummaryCard';

const TAG = {
    primary: 'bg-[#DBEAFE] text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-400',
    danger: 'bg-[#FEE2E2] text-[#B91C1C] dark:bg-red-950/60 dark:text-red-400',
};

const CHART_HEIGHT = 220; // px, lowered slightly with generous top breathing room

const rupiah = (amount) => `Rp ${new Intl.NumberFormat('id-ID').format(amount ?? 0)}`;

function formatYAxis(amount) {
    if (!amount || amount <= 0) return '0';
    if (amount >= 1_000_000) {
        const jt = amount / 1_000_000;
        return `${Number.isInteger(jt) ? jt : jt.toFixed(1).replace('.', ',')} jt`;
    }
    if (amount >= 1_000) {
        const rb = Math.round(amount / 1_000);
        return `${rb} rb`;
    }
    return new Intl.NumberFormat('id-ID').format(amount);
}

function formatDateTooltip(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

// "+12% dari periode sebelumnya", or a neutral note when there is nothing to compare with.
function changeText(change) {
    if (change === null || change === undefined) {
        return { text: 'Belum ada data periode sebelumnya', tone: 'neutral' };
    }

    const rounded = Math.round(change);
    const sign = rounded > 0 ? '+' : '';

    return {
        text: `${sign}${rounded}% dari periode sebelumnya`,
        tone: rounded >= 0 ? 'good' : 'bad',
    };
}

const DELTA_COLOR = {
    good: 'text-[#15803D] dark:text-emerald-400',
    bad: 'text-[#B91C1C] dark:text-red-400',
    neutral: 'text-[#4B5563] dark:text-gray-400',
};

export default function Dashboard({ report }) {
    const { period, window_days: windowDays, kpis, daily, recent, recommendations } = report;
    const [activeTooltip, setActiveTooltip] = useState(null);

    // Dismiss tooltip on period change
    useEffect(() => {
        setActiveTooltip(null);
    }, [period]);

    // Dismiss active tooltip when clicking outside any chart bar
    useEffect(() => {
        if (!activeTooltip) return;
        function handleDocClick(e) {
            if (!e.target.closest('[data-chart-bar]')) {
                setActiveTooltip(null);
            }
        }
        document.addEventListener('click', handleDocClick);
        return () => document.removeEventListener('click', handleDocClick);
    }, [activeTooltip]);

    const income = changeText(kpis.income_change);
    const transactions = changeText(kpis.transactions_change);

    const cards = [
        { icon: Wallet, color: 'green', label: 'Total Penghasilan', value: rupiah(kpis.income), delta: income.text, tone: income.tone },
        { icon: Receipt, color: 'blue', label: 'Jumlah Transaksi', value: new Intl.NumberFormat('id-ID').format(kpis.transactions), delta: transactions.text, tone: transactions.tone },
        { icon: TrendingUp, color: 'violet', label: 'Arus Kas Bersih', value: rupiah(kpis.net_cash_flow), delta: 'Penghasilan dikurangi pembelian', tone: 'neutral' },
    ];

    // Bar heights are scaled so the best day reaches CHART_HEIGHT.
    const maxIncome = Math.max(0, ...daily.map((d) => d.income));

    function changePeriod(days) {
        if (days === period) return;
        setActiveTooltip(null);

        router.get(
            route('dashboard'),
            { period: days },
            { preserveScroll: true, preserveState: true, only: ['report'] },
        );
    }

    return (
        <TriposLayout active="Dashboard">
            <Head title="Dashboard" />

            <div className="flex items-start justify-between gap-4">
                <div>
                    <PageTitle icon={LayoutDashboard}>Dashboard</PageTitle>
                    <p className="mt-1 text-sm text-[#4B5563] dark:text-slate-400">Ringkasan {period} hari terakhir</p>
                </div>

                <div className="inline-flex rounded-lg bg-[#F3F4F6] p-1 dark:bg-slate-800" role="group" aria-label="Periode">
                    {[7, 30].map((days) => (
                        <button
                            key={days}
                            type="button"
                            onClick={() => changePeriod(days)}
                            aria-pressed={period === days}
                            className={`rounded-md px-3.5 py-1.5 text-sm transition-colors ${
                                period === days
                                    ? 'bg-white font-semibold text-[#111827] shadow-sm dark:bg-slate-900 dark:text-white'
                                    : 'text-[#4B5563] dark:text-slate-400 hover:dark:text-slate-200'
                            }`}
                        >
                            {days} hari
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary cards */}
            <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {cards.map((item) => (
                    <SummaryCard
                        key={item.label}
                        icon={item.icon}
                        tone={item.color}
                        label={item.label}
                        value={item.value}
                        hint={item.delta}
                        hintClassName={DELTA_COLOR[item.tone]}
                    />
                ))}
            </section>

            {/* Chart and recent transactions */}
            <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 lg:col-span-2 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Penghasilan harian</h2>
                            <p className="mt-0.5 text-xs text-[#4B5563] dark:text-slate-400">Tren penjualan {period} hari terakhir</p>
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/70 bg-slate-50 px-2.5 py-1 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                            <span>Tertinggi:</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{rupiah(maxIncome)}</span>
                        </div>
                    </div>

                    {/* Chart Container with Left Compact Y-Axis and Bars */}
                    <div className="relative mt-8">
                        <div className="flex">
                            {/* Compact Y-axis scale */}
                            <div
                                className="flex flex-col justify-between items-end pr-2.5 select-none text-[10px] tabular-nums font-medium text-slate-400 dark:text-slate-500 shrink-0 w-12"
                                style={{ height: `${CHART_HEIGHT}px` }}
                            >
                                <span className="-mt-1.5 leading-none whitespace-nowrap">{maxIncome > 0 ? formatYAxis(maxIncome) : '0'}</span>
                                <span className="leading-none whitespace-nowrap">{maxIncome > 0 ? formatYAxis(Math.round(maxIncome / 2)) : ''}</span>
                                <span className="-mb-1 leading-none whitespace-nowrap">0</span>
                            </div>

                            {/* Chart Area with Guide Lines & Bars */}
                            <div className="relative flex-1 min-w-0" style={{ height: `${CHART_HEIGHT}px` }}>
                                {/* Subtle solid horizontal guide lines */}
                                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                                    <div className="w-full border-b border-slate-100 dark:border-slate-800/60" />
                                    <div className="w-full border-b border-slate-100 dark:border-slate-800/60" />
                                    <div className="w-full border-b border-slate-100 dark:border-slate-800/60" />
                                </div>

                                {/* Bars */}
                                <div
                                    className={`relative z-10 grid h-full items-end ${daily.length > 14 ? 'gap-1' : 'gap-3'}`}
                                    style={{ gridTemplateColumns: `repeat(${daily.length}, minmax(0, 1fr))` }}
                                >
                                {daily.map((d, i) => {
                                    const rawHeight = maxIncome > 0 ? Math.round((d.income / maxIncome) * CHART_HEIGHT) : 0;
                                    const height = d.income > 0 ? Math.max(rawHeight, 4) : 2;
                                    const isNarrow = daily.length > 14;

                                    const horizontalAlignClass = isNarrow
                                        ? i <= 1
                                            ? 'left-0'
                                            : i >= daily.length - 2
                                            ? 'right-0'
                                            : 'left-1/2 -translate-x-1/2'
                                        : i === 0
                                        ? 'left-0'
                                        : i === daily.length - 1
                                        ? 'right-0'
                                        : 'left-1/2 -translate-x-1/2';

                                    const arrowAlignClass = isNarrow
                                        ? i <= 1
                                            ? 'ml-3'
                                            : i >= daily.length - 2
                                            ? 'mr-3 ml-auto'
                                            : 'mx-auto'
                                        : i === 0
                                        ? 'ml-3'
                                        : i === daily.length - 1
                                        ? 'mr-3 ml-auto'
                                        : 'mx-auto';

                                    const tooltipBottom = height + 8;

                                    return (
                                        <div
                                            key={d.date}
                                            data-chart-bar
                                            className="group relative flex h-full items-end justify-center cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveTooltip(activeTooltip === d.date ? null : d.date);
                                            }}
                                        >
                                            {/* Rich hover/touch tooltip */}
                                            <div
                                                className={`absolute z-30 transition-all duration-150 pointer-events-none ${
                                                    activeTooltip === d.date
                                                        ? 'opacity-100 scale-100'
                                                        : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                                                } ${horizontalAlignClass}`}
                                                style={{ bottom: `${tooltipBottom}px` }}
                                            >
                                                <div className="rounded-lg bg-gray-900/95 px-3 py-1.5 text-white shadow-xl backdrop-blur-sm dark:bg-slate-800/95 border border-gray-800 dark:border-slate-700 whitespace-nowrap text-center">
                                                    <p className="text-[11px] font-medium text-gray-300 dark:text-slate-400">
                                                        {formatDateTooltip(d.date)}
                                                    </p>
                                                    <p className="mt-0.5 text-xs font-bold text-white">
                                                        {rupiah(d.income)}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`w-2 h-2 bg-gray-900/95 dark:bg-slate-800/95 rotate-45 -mt-1 border-r border-b border-gray-800 dark:border-slate-700 ${arrowAlignClass}`}
                                                />
                                            </div>

                                            <div
                                                className={`w-full ${
                                                    isNarrow ? 'max-w-[12px]' : 'max-w-[28px]'
                                                } transition-colors ${
                                                    d.income > 0
                                                        ? 'rounded-t-[4px] bg-blue-600 group-hover:bg-blue-500 dark:bg-blue-500 dark:group-hover:bg-blue-400'
                                                        : 'rounded-full bg-slate-200/80 group-hover:bg-slate-300 dark:bg-slate-800/50 dark:group-hover:bg-slate-700/60'
                                                }`}
                                                style={{ height: `${height}px` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Date labels below bars, aligned with pl-12 matching Y-axis */}
                    <div className="mt-2.5 pl-12">
                            {daily.length > 14 ? (
                                <div className="flex items-center justify-between text-xs text-[#4B5563] dark:text-slate-400 px-0.5">
                                    <span className="text-left">{daily[0]?.label}</span>
                                    <span className="text-center">{daily[Math.floor(daily.length / 2)]?.label}</span>
                                    <span className="text-right font-medium text-gray-900 dark:text-white">Hari ini</span>
                                </div>
                            ) : (
                                <div
                                    className="grid gap-3"
                                    style={{ gridTemplateColumns: `repeat(${daily.length}, minmax(0, 1fr))` }}
                                >
                                    {daily.map((d, i) => {
                                        const isLast = i === daily.length - 1;
                                        return (
                                            <span
                                                key={d.date}
                                                className={`h-5 text-center text-xs whitespace-nowrap ${
                                                    isLast
                                                        ? 'font-medium text-gray-900 dark:text-white'
                                                        : 'text-[#4B5563] dark:text-slate-400'
                                                }`}
                                            >
                                                {isLast ? 'Hari ini' : d.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Transaksi terbaru</h2>
                        <Link href={route('riwayat.index')} className="text-sm font-semibold text-[#1D4ED8] dark:text-blue-400">
                            Lihat semua
                        </Link>
                    </div>

                    {recent.length === 0 ? (
                        <p className="py-6 text-sm text-[#4B5563] dark:text-slate-400">Belum ada transaksi.</p>
                    ) : (
                        <ul>
                            {recent.map((t) => (
                                <li key={t.id} className="border-b border-[#E5E7EB] last:border-b-0 dark:border-slate-800">
                                    <Link
                                        href={route('riwayat.show', t.id)}
                                        className="flex items-center justify-between py-3 px-1.5 -mx-1.5 rounded-lg hover:bg-[#F3F4F6] hover:dark:bg-slate-800/60 transition-colors"
                                    >
                                        <div className="min-w-0 pr-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                    {t.receipt_number || 'Penjualan'}
                                                </span>
                                                <span className="text-xs text-[#4B5563] dark:text-slate-400 truncate">
                                                    · {t.cashier}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-xs text-[#4B5563] dark:text-slate-400">
                                                    {t.time}
                                                </span>
                                                {t.method && (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                                                            t.method === 'Tunai'
                                                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40'
                                                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/40'
                                                        }`}
                                                    >
                                                        {t.method}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{rupiah(t.amount)}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            {/* AI recommendations */}
            <section className="mt-6">
                <div className="mb-2 flex items-end justify-between">
                    <div>
                        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Rekomendasi AI</h2>
                        <p className="text-xs text-[#4B5563] dark:text-slate-400">Dihitung dari transaksi {windowDays} hari terakhir</p>
                    </div>
                    <Link href={route('laporan.index')} className="text-sm font-semibold text-[#1D4ED8] dark:text-blue-400">Lihat semua</Link>
                </div>

                {recommendations.length === 0 ? (
                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-sm text-[#4B5563] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        Belum cukup data untuk membuat rekomendasi.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {recommendations.map((item) => (
                            <div key={item.tag} className="rounded-xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TAG[item.tone]}`}>
                                    {item.tag}
                                </span>
                                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                <p className="mt-1 text-xs text-[#4B5563] dark:text-slate-400">{item.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </TriposLayout>
    );
}
