import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import EditButton from '@/Components/EditButton';
import { Plus } from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Index({ suppliers, detail, filters }) {
    const [search, setSearch] = useState(filters.cari);

    function go(changes) {
        router.get(
            route('supplier.index'),
            { cari: filters.cari, pilih: filters.pilih, ...changes },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TriposLayout active="Supplier">
            <Head title="Supplier" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold">Supplier</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563]">
                            Kelola data pemasok barang ATK, termasuk kontak dan riwayat pembelian.
                        </p>
                    </div>
                    <Link
                        href={route('supplier.create')}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                        Tambah Supplier
                    </Link>
                </div>

                <div className="flex flex-col gap-5 lg:flex-row">
                    {/* Supplier list */}
                    <section className="min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-white p-5">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                go({ cari: search });
                            }}
                        >
                            <label htmlFor="cari" className="sr-only">
                                Cari nama supplier
                            </label>
                            <input
                                id="cari"
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama supplier..."
                                className="w-full rounded-[10px] border border-[#6B7280] px-3.5 py-2.5 text-sm"
                            />
                        </form>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
                                    <tr>
                                        <th scope="col" className="px-2 py-3">Nama supplier</th>
                                        <th scope="col" className="px-2 py-3">Telepon</th>
                                        <th scope="col" className="px-2 py-3">Pembelian terakhir</th>
                                        <th scope="col" className="px-2 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.map((s) => {
                                        const selected = s.id === filters.pilih;
                                        return (
                                            <tr
                                                key={s.id}
                                                className={`border-b border-[#E5E7EB] last:border-b-0 ${
                                                    selected ? 'bg-[#DBEAFE]' : ''
                                                }`}
                                            >
                                                <td className="px-2 py-3.5">
                                                    <Link
                                                        href={route('supplier.index', { cari: filters.cari, pilih: s.id })}
                                                        preserveScroll
                                                        className={`font-medium ${selected ? 'text-[#1D4ED8]' : 'text-[#111827]'}`}
                                                    >
                                                        {s.name}
                                                    </Link>
                                                </td>
                                                <td className="px-2 py-3.5 text-[#4B5563]">{s.phone ?? '-'}</td>
                                                <td className="px-2 py-3.5">{s.last_purchase ?? 'Belum ada'}</td>
                                                <td className="px-2 py-3.5">
                                                    <EditButton href={route('supplier.edit', s.id)} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {suppliers.length === 0 && (
                                <p className="py-8 text-center text-sm text-[#4B5563]">Tidak ada supplier yang cocok.</p>
                            )}
                        </div>
                    </section>

                    {/* Selected supplier details */}
                    <aside className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-[320px]">
                        {detail ? (
                            <>
                                <h2 className="text-base font-semibold">{detail.name}</h2>

                                <div className="flex flex-col gap-2.5 text-sm">
                                    <div>
                                        <p className="text-xs text-[#4B5563]">Telepon</p>
                                        <p>{detail.phone ?? '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#4B5563]">Alamat</p>
                                        <p>{detail.address ?? '-'}</p>
                                    </div>
                                </div>

                                <div className="h-px bg-[#E5E7EB]" />

                                <p className="text-[13px] font-semibold">Riwayat pembelian</p>

                                {detail.purchases.length === 0 && (
                                    <p className="text-sm text-[#4B5563]">Belum ada pembelian dari supplier ini.</p>
                                )}

                                {detail.purchases.map((p, i) => (
                                    <div key={i} className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium">{p.date}</p>
                                            <p className="text-xs text-[#4B5563]">{p.kinds} jenis barang</p>
                                        </div>
                                        <p className="whitespace-nowrap text-sm font-semibold">{rupiah(p.total)}</p>
                                    </div>
                                ))}

                                <Link
                                    href={route('supplier.edit', detail.id)}
                                    className="rounded-[10px] border border-[#6B7280] py-2.5 text-center text-sm font-medium"
                                >
                                    Ubah Data
                                </Link>
                            </>
                        ) : (
                            <p className="text-sm text-[#4B5563]">
                                Pilih supplier di daftar untuk melihat kontak dan riwayat pembeliannya.
                            </p>
                        )}
                    </aside>
                </div>
            </div>
        </TriposLayout>
    );
}