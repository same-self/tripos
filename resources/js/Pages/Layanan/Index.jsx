import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, router } from '@inertiajs/react';
import EditButton from '@/Components/EditButton';
import { Plus, Trash2 } from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmt = (n) => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 4 });

function Tab({ active, href, children }) {
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

export default function Index({ services, categories, total, detail, autoDeduct, filters }) {
    function toggleAutoDeduct() {
        router.put(route('layanan.pengaturan'), { auto_deduct: !autoDeduct }, { preserveScroll: true });
    }

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
                        <h1 className="text-[22px] font-bold">Layanan</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563]">
                            Kelola jasa fotokopi, print, dan banner, beserta bahan yang dipakai.
                        </p>
                    </div>
                    <Link
                        href={route('layanan.create')}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white"
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
                    <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
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
                                    const selected = s.id === filters.pilih;
                                    return (
                                        <tr key={s.id} className={`border-b border-[#E5E7EB] last:border-b-0 ${selected ? 'bg-[#DBEAFE]' : ''}`}>
                                            <td className="px-2 py-3.5">
                                                <Link
                                                    href={route('layanan.index', { kategori: filters.kategori, pilih: s.id })}
                                                    preserveScroll
                                                    className={`font-medium ${selected ? 'text-[#1D4ED8]' : 'text-[#111827]'}`}
                                                >
                                                    {s.name}
                                                </Link>
                                            </td>
                                            <td className="px-2 py-3.5 text-[#4B5563]">{s.category}</td>
                                            <td className="px-2 py-3.5 text-[#4B5563]">{s.unit}</td>
                                            <td className="px-2 py-3.5 font-semibold">{rupiah(s.unit_price)}</td>
                                            <td className="px-2 py-3.5 text-[13px] text-[#4B5563]">
                                                {s.materials_summary ?? 'Belum ada bahan'}
                                            </td>
                                            <td className="px-2 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <EditButton href={route('layanan.edit', s.id)} />
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(s)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-2.5 py-1.5 text-[13px] font-semibold text-[#B91C1C] hover:bg-[#FECACA]"
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
                            <p className="py-8 text-center text-sm text-[#4B5563]">Belum ada layanan di kategori ini.</p>
                        )}
                    </section>

                    {/* Details and the paper setting */}
                    <aside className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-[320px]">
                        {detail ? (
                            <>
                                <h2 className="text-base font-semibold">{detail.name}</h2>
                                <p className="text-xs text-[#4B5563]">
                                    {detail.category} · {rupiah(detail.unit_price)} per {detail.unit}
                                </p>

                                <p className="text-[13px] font-semibold">Bahan yang dipakai</p>
                                {detail.materials.length === 0 && (
                                    <p className="text-sm text-[#4B5563]">Belum ada bahan untuk layanan ini.</p>
                                )}
                                {detail.materials.map((m, i) => (
                                    <div key={i} className="rounded-xl bg-[#F3F4F6] p-3.5">
                                        <p className="text-sm font-medium">{m.name}</p>
                                        <p className="text-xs text-[#4B5563]">
                                            {fmt(m.per_unit)} {m.unit} per {detail.unit}
                                        </p>
                                    </div>
                                ))}

                                {/* Connected to the material form in the next step */}
                                <Link
                                    href={route('layanan.edit', detail.id)}
                                    className="rounded-[10px] border border-[#6B7280] py-2.5 text-center text-sm font-medium"
                                >
                                    Ubah Layanan
                                </Link>
                                <Link
                                    href={route('layanan.bahan', detail.id)}
                                    className="rounded-[10px] border border-[#6B7280] py-2.5 text-center text-sm font-medium"
                                >
                                    Ubah Bahan
                                </Link>

                                <div className="h-px bg-[#E5E7EB]" />
                            </>
                        ) : (
                            <p className="text-sm text-[#4B5563]">
                                Pilih layanan di daftar untuk melihat bahan yang dipakainya.
                            </p>
                        )}

                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium">Kurangi stok bahan otomatis</p>
                                <p className="text-xs text-[#4B5563]">Saat layanan terjual. Berlaku untuk semua layanan.</p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={autoDeduct}
                                onClick={toggleAutoDeduct}
                                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                                    autoDeduct ? 'bg-[#1D4ED8]' : 'bg-[#D1D5DB]'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                                        autoDeduct ? 'left-[22px]' : 'left-0.5'
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="rounded-xl bg-[#FEF3C7] p-3 text-xs text-[#92400E]">
                            <p className="font-semibold">Keputusan ini belum final.</p>
                            <p>Menunggu konfirmasi pemilik toko apakah stok kertas dikurangi otomatis.</p>
                        </div>
                    </aside>
                </div>
            </div>
        </TriposLayout>
    );
}