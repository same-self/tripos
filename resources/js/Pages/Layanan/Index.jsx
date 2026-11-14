import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, router } from '@inertiajs/react';
import EditButton from '@/Components/EditButton';
import ItemThumb from '@/Components/ItemThumb';
import PageTitle from '@/Components/PageTitle';
import { Plus, Trash2, Wrench } from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

function Tab({ active, href, children }) {
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

export default function Index({ services, categories, total, filters }) {

    function remove(service) {
        if (window.confirm(`Hapus layanan "${service.name}"? Riwayat penjualannya tetap tersimpan.`)) {
            router.delete(route('layanan.destroy', service.id), { preserveScroll: true });
        }
    }

    return (
        <TriposLayout active="Layanan">
            <Head title="Layanan" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <PageTitle icon={Wrench}>Layanan</PageTitle>
                        <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                            Kelola jasa fotokopi, print, dan banner, beserta bahan yang dipakai.
                        </p>
                    </div>
                    <Link
                        href={route('layanan.create')}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E40AF] dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                    >
                        <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                        Tambah Layanan
                    </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Tab active={filters.kategori === null} href={route('layanan.index')}>
                        Semua ({total})
                    </Tab>
                    {categories.map((c) => (
                        <Tab key={c.id} active={filters.kategori === c.id} href={route('layanan.index', { kategori: c.id })}>
                            {c.name} ({c.count})
                        </Tab>
                    ))}
                </div>

                <div className="flex flex-col gap-5 lg:flex-row">
                    {/* Service list */}
                    <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
                                <tr>
                                    <th scope="col" className="px-2 py-3">Nama layanan</th>
                                    <th scope="col" className="px-2 py-3">Kategori</th>
                                    <th scope="col" className="px-2 py-3">Satuan</th>
                                    <th scope="col" className="px-2 py-3">Tarif</th>
                                    <th scope="col" className="px-2 py-3">Bahan</th>
                                    <th scope="col" className="px-2 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((s) => {
                                    return (
                                        <tr key={s.id} className="border-b border-[#E5E7EB] last:border-b-0 dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                            <td className="px-2 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <ItemThumb src={s.image_url} name={s.name} icon={Wrench} />
                                                    <span className="font-medium text-[#111827] dark:text-slate-100">{s.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-3.5 text-[#4B5563] dark:text-slate-400">{s.category}</td>
                                            <td className="px-2 py-3.5 text-[#4B5563] dark:text-slate-400">{s.unit}</td>
                                            <td className="px-2 py-3.5 font-semibold text-gray-900 dark:text-slate-100">{rupiah(s.unit_price)}</td>
                                            <td className="px-2 py-3.5 text-[13px] text-[#4B5563] dark:text-slate-400">
                                                {s.materials_summary ?? 'Belum ada bahan'}
                                            </td>
                                            <td className="px-2 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <EditButton href={route('layanan.edit', s.id)} />
                                                    <Link
                                                        href={route('layanan.bahan', s.id)}
                                                        className="inline-flex items-center rounded-lg border border-[#6B7280] px-2.5 py-1.5 text-[13px] font-semibold dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                                                    >
                                                        Bahan
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(s)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-2.5 py-1.5 text-[13px] font-semibold text-[#B91C1C] hover:bg-[#FECACA] dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                                    >
                                                        <Trash2 size={14} strokeWidth={2.25} aria-hidden="true" />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {services.length === 0 && (
                            <p className="py-8 text-center text-sm text-[#4B5563] dark:text-slate-400">Belum ada layanan di kategori ini.</p>
                        )}
                    </section>

                </div>
            </div>
        </TriposLayout>
    );
}