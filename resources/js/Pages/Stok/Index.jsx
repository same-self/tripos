import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const STATUS = {
    cepat: { label: 'Cepat laku', cls: 'bg-[#DCFCE7] text-[#15803D]' },
    normal: { label: 'Normal', cls: 'bg-[#F3F4F6] text-[#4B5563]' },
    lambat: { label: 'Lambat', cls: 'bg-[#FEF3C7] text-[#92400E]' },
};

function RestokCard({ tag, tagClass, description, items, emptyText }) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${tagClass}`}>{tag}</span>
            <p className="text-xs text-[#4B5563]">{description}</p>

            {items.length === 0 && <p className="text-sm text-[#4B5563]">{emptyText}</p>}

            {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="whitespace-nowrap text-xs text-[#4B5563]">sisa ±{item.days_left} hari</span>
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
                        <h1 className="text-[22px] font-bold">Stok Barang</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563]">
                            Stok, penjualan, dan rekomendasi {window} hari terakhir.
                        </p>
                    </div>
                    <Link
                        href={route('restok.create')}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                        Tambah Restok
                    </Link>
                </div>

                <div className="flex flex-col gap-5 lg:flex-row">
                    {/* Restock recommendations */}
                    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px]">
                        <div>
                            <h2 className="text-[15px] font-semibold">Rekomendasi AI</h2>
                            <p className="text-xs text-[#4B5563]">Dihitung dari transaksi {window} hari terakhir</p>
                        </div>

                        <RestokCard
                            tag="Restok segera"
                            tagClass="bg-[#DCFCE7] text-[#15803D]"
                            description={`Sisa stok sampai ${segeraDays} hari. Segera restok.`}
                            items={restokSegera}
                            emptyText="Tidak ada barang yang perlu direstok segera."
                        />

                        <RestokCard
                            tag="Restok nanti"
                            tagClass="bg-[#FEF3C7] text-[#92400E]"
                            description={`Sisa stok ${segeraDays + 1} sampai ${window} hari.`}
                            items={restokNanti}
                            emptyText="Tidak ada barang untuk direstok nanti."
                        />
                    </aside>

                    {/* Stock table */}
                    <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
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
                                    <tr key={item.id} className="border-b border-[#E5E7EB] last:border-b-0">
                                        <td className="px-2 py-3.5 font-medium">{item.name}</td>
                                        <td className={`px-2 py-3.5 ${item.low_stock ? 'font-semibold text-[#B91C1C]' : ''}`}>
                                            {item.stock} {item.unit}
                                        </td>
                                        <td className="px-2 py-3.5">{item.sold}</td>
                                        <td className="px-2 py-3.5">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[item.status].cls}`}>
                                                {STATUS[item.status].label}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3.5">{rupiah(item.cost_price)}</td>
                                        <td className="px-2 py-3.5 font-semibold">{rupiah(item.sell_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {items.length === 0 && (
                            <p className="py-8 text-center text-sm text-[#4B5563]">Belum ada barang.</p>
                        )}
                    </section>
                </div>
            </div>
        </TriposLayout>
    );
}