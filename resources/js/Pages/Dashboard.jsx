import TriposLayout from '@/Layouts/TriposLayout';
import { Head } from '@inertiajs/react';

const KPI = [
    { label: 'Total Penghasilan', value: 'Rp 8.750.000', delta: '+12% dari periode sebelumnya', good: true },
    { label: 'Jumlah Transaksi', value: '412', delta: '+8% dari periode sebelumnya', good: true },
    { label: 'Arus Kas Bersih', value: 'Rp 4.415.000', delta: 'Penghasilan dikurangi pembelian', good: false },
];

// Heights are in pixels, scaled so the largest day (Sabtu) reaches 260px
const DAILY = [
    { day: 'Sen', value: 'Rp 520.000', height: 121 },
    { day: 'Sel', value: 'Rp 470.000', height: 109 },
    { day: 'Rab', value: 'Rp 540.000', height: 125 },
    { day: 'Kam', value: 'Rp 880.000', height: 204 },
    { day: 'Jum', value: 'Rp 615.000', height: 143 },
    { day: 'Sab', value: 'Rp 1.120.000', height: 260 },
    { day: 'Min', value: 'Rp 690.000', height: 160 },
];

const RECENT = [
    { title: 'Penjualan · Kasir', meta: '10:33 · Tunai', amount: 'Rp 12.500' },
    { title: 'Penjualan · Kasir', meta: '10:31 · QRIS', amount: 'Rp 12.500' },
    { title: 'Penjualan · Kasir', meta: '10:18 · Tunai', amount: 'Rp 38.000' },
    { title: 'Penjualan · Kasir', meta: '09:55 · Tunai', amount: 'Rp 7.000' },
    { title: 'Penjualan · Kasir', meta: '09:40 · QRIS', amount: 'Rp 15.500' },
];

const AI = [
    { tag: 'Untung terbesar', tone: 'primary', title: 'Kertas HVS A4 (rim)', text: 'Sekitar Rp 450.000 keuntungan dalam 30 hari.' },
    { tag: 'Modal mengendap', tone: 'danger', title: 'Rp 302.000 tertahan di 3 barang', text: 'Amplop Coklat, Map Plastik, dan Stapler Kecil jarang terjual.' },
];

const TAG = {
    primary: 'bg-[#DBEAFE] text-[#1D4ED8]',
    danger: 'bg-[#FEE2E2] text-[#B91C1C]',
};

export default function Dashboard() {
    return (
        <TriposLayout active="Dashboard">
            <Head title="Dashboard" />

            <h1 className="text-[22px] font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-[#4B5563]">Ringkasan 30 hari terakhir</p>

            {/* Summary cards */}
            <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {KPI.map((item) => (
                    <div key={item.label} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                        <p className="text-xs text-[#4B5563]">{item.label}</p>
                        <p className="mt-1.5 text-2xl font-bold">{item.value}</p>
                        <p className={`mt-1.5 text-xs ${item.good ? 'text-[#15803D]' : 'text-[#4B5563]'}`}>
                            {item.delta}
                        </p>
                    </div>
                ))}
            </section>

            {/* Chart and recent transactions */}
            <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 lg:col-span-2">
                    <h2 className="text-[15px] font-semibold">Penghasilan harian (Rp ribu)</h2>
                    <div className="mt-4 grid h-[260px] grid-cols-7 items-end gap-3 border-b border-[#E5E7EB]">
                        {DAILY.map((d) => (
                            <div key={d.day} className="flex h-full flex-col items-center justify-end">
                                <div
                                    className="w-full max-w-[44px] rounded-t bg-[#1D4ED8]"
                                    style={{ height: `${d.height}px` }}
                                    title={`${d.day}: ${d.value}`}
                                />
                                <span className="mt-1.5 text-xs text-[#4B5563]">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-[15px] font-semibold">Transaksi terbaru</h2>
                        <a href="#" className="text-sm font-semibold text-[#1D4ED8]">Lihat semua</a>
                    </div>
                    <ul>
                        {RECENT.map((t, i) => (
                            <li key={i} className="flex items-center justify-between border-b border-[#E5E7EB] py-3 last:border-b-0">
                                <div>
                                    <p className="text-sm font-semibold">{t.title}</p>
                                    <p className="mt-0.5 text-xs text-[#4B5563]">{t.meta}</p>
                                </div>
                                <p className="text-sm font-semibold">{t.amount}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* AI recommendations */}
            <section className="mt-6">
                <div className="mb-2 flex items-end justify-between">
                    <div>
                        <h2 className="text-[15px] font-semibold">Rekomendasi AI</h2>
                        <p className="text-xs text-[#4B5563]">Dihitung dari transaksi 30 hari terakhir</p>
                    </div>
                    <a href="#" className="text-sm font-semibold text-[#1D4ED8]">Lihat semua</a>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {AI.map((item) => (
                        <div key={item.tag} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TAG[item.tone]}`}>
                                {item.tag}
                            </span>
                            <h3 className="mt-2 text-sm font-semibold">{item.title}</h3>
                            <p className="mt-1 text-xs text-[#4B5563]">{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </TriposLayout>
    );
}