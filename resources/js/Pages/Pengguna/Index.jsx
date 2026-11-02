import TriposLayout from '@/Layouts/TriposLayout';
import EditButton from '@/Components/EditButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Trash2, Users } from 'lucide-react';
import PageTitle from '@/Components/PageTitle';

export default function Index({ users }) {
    const { errors: pageErrors } = usePage().props;

    function remove(user) {
        if (window.confirm(`Hapus pengguna "${user.name}" secara permanen?`)) {
            router.delete(route('pengguna.destroy', user.id), { preserveScroll: true });
        }
    }

    return (
        <TriposLayout active="Pengguna">
            <Head title="Pengguna" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <PageTitle icon={Users}>Pengguna</PageTitle>
                        <p className="mt-1 text-[13px] text-[#4B5563]">
                            Kelola akun Admin dan Kasir yang bisa masuk ke TRIPOS.
                        </p>
                    </div>
                    <Link
                        href={route('pengguna.create')}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                        Tambah Pengguna
                    </Link>
                </div>

                {pageErrors.hapus && (
                    <p className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">{pageErrors.hapus}</p>
                )}

                <div>
                    {/* User list */}
                    <section className="min-w-0 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
                                <tr>
                                    <th scope="col" className="px-2 py-3">Nama</th>
                                    <th scope="col" className="px-2 py-3">Username</th>
                                    <th scope="col" className="px-2 py-3">Peran</th>
                                    <th scope="col" className="px-2 py-3">Status</th>
                                    <th scope="col" className="px-2 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-[#E5E7EB] last:border-b-0">
                                        <td className={`px-2 py-3.5 font-medium ${u.active ? 'text-[#111827]' : 'text-[#4B5563]'}`}>
                                            {u.name}
                                        </td>
                                        <td className="px-2 py-3.5 text-[#4B5563]">{u.username}</td>
                                        <td className="px-2 py-3.5">
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    u.role === 'admin' ? 'bg-[#DBEAFE] text-[#1D4ED8]' : 'bg-[#F3F4F6] text-[#111827]'
                                                }`}
                                            >
                                                {u.role_label}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3.5">
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    u.active ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#F3F4F6] text-[#4B5563]'
                                                }`}
                                            >
                                                {u.active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <EditButton href={route('pengguna.edit', u.id)} />
                                                {u.can_delete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(u)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-2.5 py-1.5 text-[13px] font-semibold text-[#B91C1C] hover:bg-[#FECACA]"
                                                    >
                                                        <Trash2 size={14} strokeWidth={2.25} aria-hidden="true" />
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>
            </div>
        </TriposLayout>
    );
}