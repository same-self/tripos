import TriposLayout from '@/Layouts/TriposLayout';
  import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

function CategoryButton({ active, label, count, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                active ? 'bg-[#DBEAFE] font-semibold text-[#1D4ED8]' : 'font-medium text-[#111827] hover:bg-[#F3F4F6]'
            }`}
        >
            <span>{label}</span>
            <span className="text-xs text-[#4B5563]">{count}</span>
        </button>
    );
}

export default function Index({ items, categories, total, filters }) {
    const [search, setSearch] = useState(filters.cari);

    // Every filter change reloads the list from the server with the other filters kept
    function go(changes) {
        router.get(
            route('barang.index'),
            { kategori: filters.kategori, cari: filters.cari, ...changes },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TriposLayout active="Barang">
            <Head title="Barang" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold">Barang</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563]">Kelola data barang ATK, harga jual, dan kategorinya.</p>
                    </div>
                    {/* Connected to the add form in the next step */}
                  <Link
                      href={route('barang.create')}
                      className="rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                      Tambah Barang
                  </Link>
                </div>

                <div className="flex flex-col gap-5 lg:flex-row">
                    {/* Category panel */}
                    <aside className="flex w-full shrink-0 flex-col gap-1 rounded-2xl border border-[#E5E7EB] bg-white p-4 lg:w-[220px]">
                        <h2 className="mb-2 text-[15px] font-semibold">Kategori</h2>
                        <CategoryButton
                            active={filters.kategori === null}
                            label="Semua"
                            count={total}
                            onClick={() => go({ kategori: null })}
                        />
                        {categories.map((c) => (
                            <CategoryButton
                                key={c.id}
                                active={filters.kategori === c.id}
                                label={c.name}
                                count={c.count}
                                onClick={() => go({ kategori: c.id })}
                            />
                        ))}
                        <button type="button" disabled className="mt-3 px-3 text-left text-[13px] font-semibold text-[#1D4ED8] opacity-60">
                            + Tambah kategori
                        </button>
                    </aside>

                    {/* Product table */}
                    <section className="min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-white p-5">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                go({ cari: search });
                            }}
                        >
                            <label htmlFor="cari" className="sr-only">
                                Cari nama barang
                            </label>
                            <input
                                id="cari"
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama barang..."
                                className="w-full rounded-[10px] border border-[#6B7280] px-3.5 py-2.5 text-sm"
                            />
                        </form>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
                                    <tr>
                                        <th scope="col" className="px-2 py-3">Nama barang</th>
                                        <th scope="col" className="px-2 py-3">Kategori</th>
                                        <th scope="col" className="px-2 py-3">Satuan</th>
                                        <th scope="col" className="px-2 py-3">Harga modal</th>
                                        <th scope="col" className="px-2 py-3">Harga jual</th>
                                        <th scope="col" className="px-2 py-3">Stok</th>
                                        <th scope="col" className="px-2 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b border-[#E5E7EB] last:border-b-0">
                                            <td className="px-2 py-3.5 font-medium">{item.name}</td>
                                            <td className="px-2 py-3.5 text-[#4B5563]">{item.category}</td>
                                            <td className="px-2 py-3.5 text-[#4B5563]">{item.unit}</td>
                                            <td className="px-2 py-3.5">{rupiah(item.cost_price)}</td>
                                            <td className="px-2 py-3.5 font-semibold">{rupiah(item.sell_price)}</td>
                                            <td className={`px-2 py-3.5 ${item.low_stock ? 'font-semibold text-[#B91C1C]' : ''}`}>
                                                {item.stock}
                                            </td>
                                            <td className="px-2 py-3.5">
                                                {/* Connected to the edit form in the next step */}
                                                <Link href={route('barang.edit', item.id)} className="text-[13px] font-medium text-[#1D4ED8]">
                                                      Ubah
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {items.length === 0 && (
                                <p className="py-8 text-center text-sm text-[#4B5563]">Tidak ada barang yang cocok.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </TriposLayout>
    );
}