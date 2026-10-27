import CategoryBadge from '@/Components/CategoryBadge';
import EditButton from '@/Components/EditButton';
import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';

export default function Index({ categories }) {
    const { errors } = usePage().props;

    function remove(category) {
        if (window.confirm(`Hapus kategori "${category.name}"?`)) {
            router.delete(route('kategori.destroy', category.id));
        }
    }

    return (
        <TriposLayout active="Barang">
            <Head title="Kategori" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold">Kategori</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563]">Kelompok barang yang dipakai di Barang dan Stok.</p>
                    </div>
                    <Link
                        href={route('kategori.create')}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                        Tambah Kategori
                    </Link>
                </div>

                {errors.hapus && (
                    <p className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">{errors.hapus}</p>
                )}

                <section className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
                            <tr>
                                <th scope="col" className="px-2 py-3">Kategori</th>
                                <th scope="col" className="px-2 py-3">Jumlah barang</th>
                                <th scope="col" className="px-2 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((c) => (
                                <tr key={c.id} className="border-b border-[#E5E7EB] last:border-b-0">
                                    <td className="px-2 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <CategoryBadge name={c.name} />
                                            <span className="font-medium">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3.5">{c.count} barang</td>
                                    <td className="px-2 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <EditButton href={route('kategori.edit', c.id)} />
                                            <button
                                                type="button"
                                                onClick={() => remove(c)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-2.5 py-1.5 text-[13px] font-semibold text-[#B91C1C] hover:bg-[#FECACA]"
                                            >
                                                <Trash2 size={14} strokeWidth={2.25} aria-hidden="true" />
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {categories.length === 0 && (
                        <p className="py-8 text-center text-sm text-[#4B5563]">Belum ada kategori.</p>
                    )}
                </section>
            </div>
        </TriposLayout>
    );
}
