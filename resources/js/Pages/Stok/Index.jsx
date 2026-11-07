import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const STATUS = {
    cepat: { label: 'Cepat laku', cls: 'bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300' },
    normal: { label: 'Normal', cls: 'bg-[#F3F4F6] text-[#4B5563] dark:bg-slate-800 dark:text-slate-300' },
    lambat: { label: 'Lambat', cls: 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300' },
};

function RestokCard({ tag, tagClass, description, items, emptyText }) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${tagClass}`}>{tag}</span>
            <p className="text-xs text-[#4B5563] dark:text-slate-400">{description}</p>

            {items.length === 0 && <p className="text-sm text-[#4B5563] dark:text-slate-400">{emptyText}</p>}

            {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-gray-900 dark:text-slate-100">{item.name}</span>
                    <span className="whitespace-nowrap text-xs text-[#4B5563] dark:text-slate-400">sisa ±{item.days_left} hari</span>
                </div>
            ))}
        </div>
    );
}

export default function Index({ items, restokSegera, restokNanti, window, segeraDays }) {
    return (
        <TriposLayout active="Stok">
            <Head title="Stok" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Stok Barang</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                            Stok, penjualan, dan rekomendasi {window} hari terakhir.
                        </p>
                    </div>
                    <Link
                        href={route('restok.create')}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E40AF] dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                    >
                        <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                        Tambah Restok
                    </Link>
                </div>

                <div className="flex flex-col gap-5 lg:flex-row">
                    {/* Restock recommendations */}
                    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px]">
                        <div>
                            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">Rekomendasi AI</h2>
                            <p className="text-xs text-[#4B5563] dark:text-slate-400">Dihitung dari transaksi {window} hari terakhir</p>
                        </div>

                        <RestokCard
                            tag="Restok segera"
                            tagClass="bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300"
                            description={`Sisa stok sampai ${segeraDays} hari. Segera restok.`}
                            items={restokSegera}
                            emptyText="Tidak ada barang yang perlu direstok segera."
                        />

                        <RestokCard
                            tag="Restok nanti"
                            tagClass="bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300"
                            description={`Sisa stok ${segeraDays + 1} sampai ${window} hari.`}
                            items={restokNanti}
                            emptyText="Tidak ada barang untuk direstok nanti."
                        />

                        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-[13px] font-semibold text-[#111827] dark:text-white">Ambang Batas Status ({window} Hari)</h3>
                            <p className="mt-1 text-xs text-[#4B5563] dark:text-slate-400">Klasifikasi kecepatan perputaran stok barang:</p>
                            <ul className="mt-3 flex flex-col gap-2 text-xs">
                                <li className="flex items-center justify-between">
                                    <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-xs font-semibold text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300">
                                        Cepat laku
                                    </span>
                                    <span className="font-medium text-[#4B5563] dark:text-slate-300">&ge; 80 unit</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-semibold text-[#4B5563] dark:bg-slate-800 dark:text-slate-300">
                                        Normal
                                    </span>
                                    <span className="font-medium text-[#4B5563] dark:text-slate-300">10 – 79 unit</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-semibold text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300">
                                        Lambat
                                    </span>
                                    <span className="font-medium text-[#4B5563] dark:text-slate-300">&lt; 10 unit</span>
                                </li>
                            </ul>
                        </div>
                    </aside>

                    {/* Stock table */}
                    <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                                <tr>
                                    <th scope="col" className="px-2 py-3">Barang</th>
                                    <th scope="col" className="px-2 py-3">Stok</th>
                                    <th scope="col" className="px-2 py-3">Terjual {window} hari</th>
                                    <th scope="col" className="px-2 py-3">Status</th>
                                    <th scope="col" className="px-2 py-3">Harga modal</th>
                                    <th scope="col" className="px-2 py-3">Harga jual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-b border-[#E5E7EB] last:border-b-0 dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                        <td className="px-2 py-3.5 font-medium text-gray-900 dark:text-slate-100">{item.name}</td>
                                        <td className={`px-2 py-3.5 ${item.low_stock ? 'font-semibold text-[#B91C1C] dark:text-red-400' : 'text-gray-900 dark:text-slate-200'}`}>
                                            {item.stock} {item.unit}
                                        </td>
                                        <td className="px-2 py-3.5 text-gray-900 dark:text-slate-200">{item.sold}</td>
                                        <td className="px-2 py-3.5">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[item.status].cls}`}>
                                                {STATUS[item.status].label}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3.5 text-gray-900 dark:text-slate-200">{rupiah(item.cost_price)}</td>
                                        <td className="px-2 py-3.5 font-semibold text-gray-900 dark:text-slate-100">{rupiah(item.sell_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {items.length === 0 && (
                            <p className="py-8 text-center text-sm text-[#4B5563] dark:text-slate-400">Belum ada barang.</p>
                        )}
                    </section>
                </div>
            </div>
        </TriposLayout>
    );
}