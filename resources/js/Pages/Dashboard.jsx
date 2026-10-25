import TriposLayout from '@/Layouts/TriposLayout';
import { Head, router } from '@inertiajs/react';

const TAG = {
    primary: 'bg-[#DBEAFE] text-[#1D4ED8]',
    danger: 'bg-[#FEE2E2] text-[#B91C1C]',
};

const CHART_HEIGHT = 260; // px, the tallest bar

const rupiah = (amount) => `Rp ${new Intl.NumberFormat('id-ID').format(amount ?? 0)}`;

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
    good: 'text-[#15803D]',
    bad: 'text-[#B91C1C]',
    neutral: 'text-[#4B5563]',
};

export default function Dashboard({ report }) {
    const { period, window_days: windowDays, kpis, daily, recent, recommendations } = report;

    const income = changeText(kpis.income_change);
    const transactions = changeText(kpis.transactions_change);

    const cards = [
        { label: 'Total Penghasilan', value: rupiah(kpis.income), delta: income.text, tone: income.tone },
        { label: 'Jumlah Transaksi', value: new Intl.NumberFormat('id-ID').format(kpis.transactions), delta: transactions.text, tone: transactions.tone },
        { label: 'Arus Kas Bersih', value: rupiah(kpis.net_cash_flow), delta: 'Penghasilan dikurangi pembelian', tone: 'neutral' },
    ];

    // Bar heights are scaled so the best day reaches CHART_HEIGHT.
    const maxIncome = Math.max(0, ...daily.map((d) => d.income));
    const labelEvery = daily.length > 14 ? 5 : 1;

    function changePeriod(days) {
        if (days === period) return;

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
                    <h1 className="text-[22px] font-bold">Dashboard</h1>
                    <p className="mt-1 text-sm text-[#4B5563]">Ringkasan {period} hari terakhir</p>
                </div>

                <div className="inline-flex rounded-lg bg-[#F3F4F6] p-1" role="group" aria-label="Periode">
                    {[7, 30].map((days) => (
                        <button
                            key={days}
                            type="button"
                            onClick={() => changePeriod(days)}
                            aria-pressed={period === days}
                            className={`rounded-md px-3.5 py-1.5 text-sm ${
                                period === days ? 'bg-white font-semibold text-[#111827] shadow-sm' : 'text-[#4B5563]'
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
                    <div key={item.label} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                        <p className="text-xs text-[#4B5563]">{item.label}</p>
                        <p className="mt-1.5 text-2xl font-bold">{item.value}</p>
                        <p className={`mt-1.5 text-xs ${DELTA_COLOR[item.tone]}`}>{item.delta}</p>
                    </div>
                ))}
            </section>

            {/* Chart and recent transactions */}
            <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 lg:col-span-2">
                    <h2 className="text-[15px] font-semibold">Penghasilan harian (Rp ribu)</h2>

                    {/* Bars */}
                    <div
                        className={`mt-4 grid h-[260px] items-end border-b border-[#E5E7EB] ${daily.length > 14 ? 'gap-1' : 'gap-3'}`}
                        style={{ gridTemplateColumns: `repeat(${daily.length}, minmax(0, 1fr))` }}
                    >
                        {daily.map((d) => {
                            const height = maxIncome > 0 ? Math.round((d.income / maxIncome) * CHART_HEIGHT) : 0;

                            return (
                                <div key={d.date} className="flex h-full items-end justify-center">
                                    <div
                                        className="w-full max-w-[44px] rounded-t bg-[#1D4ED8]"
                                        style={{ height: `${height}px` }}
                                        title={`${d.date}: ${rupiah(d.income)}`}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Date labels, in their own row below the bars */}
                    <div
                        className={`mt-2 grid ${daily.length > 14 ? 'gap-1' : 'gap-3'}`}
                        style={{ gridTemplateColumns: `repeat(${daily.length}, minmax(0, 1fr))` }}
                    >
                        {daily.map((d, i) => (
                            <span key={d.date} className="h-5 whitespace-nowrap text-center text-xs text-[#4B5563]">
                                {i % labelEvery === 0 ? d.label : ''}
                            </span>
                        ))}
                    </div>
                </div>
                
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-[15px] font-semibold">Transaksi terbaru</h2>
                        <a href="#" className="text-sm font-semibold text-[#1D4ED8]">Lihat semua</a>
                    </div>

                    {recent.length === 0 ? (
                        <p className="py-6 text-sm text-[#4B5563]">Belum ada transaksi.</p>
                    ) : (
                        <ul>
                            {recent.map((t) => (
                                <li key={t.id} className="flex items-center justify-between border-b border-[#E5E7EB] py-3 last:border-b-0">
                                    <div>
                                        <p className="text-sm font-semibold">Penjualan · {t.cashier}</p>
                                        <p className="mt-0.5 text-xs text-[#4B5563]">
                                            {t.time} · {t.method}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold">{rupiah(t.amount)}</p>
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
                        <h2 className="text-[15px] font-semibold">Rekomendasi AI</h2>
                        <p className="text-xs text-[#4B5563]">Dihitung dari transaksi {windowDays} hari terakhir</p>
                    </div>
                    <a href="#" className="text-sm font-semibold text-[#1D4ED8]">Lihat semua</a>
                </div>

                {recommendations.length === 0 ? (
                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 text-sm text-[#4B5563]">
                        Belum cukup data untuk membuat rekomendasi.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {recommendations.map((item) => (
                            <div key={item.tag} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TAG[item.tone]}`}>
                                    {item.tag}
                                </span>
                                <h3 className="mt-2 text-sm font-semibold">{item.title}</h3>
                                <p className="mt-1 text-xs text-[#4B5563]">{item.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </TriposLayout>
    );
}
