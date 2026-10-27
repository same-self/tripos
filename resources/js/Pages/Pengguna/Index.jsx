import TriposLayout from '@/Layouts/TriposLayout';
import EditButton from '@/Components/EditButton';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

const inputClass = 'h-11 rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm';

const ROLE_OPTIONS = [
    { value: 'cashier', label: 'Kasir' },
    { value: 'admin', label: 'Admin' },
];

function Field({ label, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#4B5563]">{label}</label>
            {children}
            {error && <p className="text-xs text-[#B91C1C]">{error}</p>}
        </div>
    );
}

export default function Index({ users }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        password: '',
        role: 'cashier',
    });

    const { errors: pageErrors } = usePage().props;

    function remove(user) {
        if (window.confirm(`Hapus pengguna "${user.name}" secara permanen?`)) {
            router.delete(route('pengguna.destroy', user.id), { preserveScroll: true });
        }
    }

    function submit(e) {
        e.preventDefault();
        post(route('pengguna.store'), {
            preserveScroll: true,
            onSuccess: () => reset('name', 'username', 'password'),
        });
    }

    return (
        <TriposLayout active="Pengguna">
            <Head title="Pengguna" />

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold">Pengguna</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563]">
                            Kelola akun Admin dan Kasir yang bisa masuk ke TRIPOS.
                        </p>
                    </div>
                    <a
                        href="#form-pengguna"
                        className="rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        Tambah Pengguna
                    </a>
                </div>

                <div className="flex flex-col gap-5 lg:flex-row">
                    {pageErrors.hapus && (
                        <p className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">{pageErrors.hapus}</p>
                    )}

                    {/* User list */}
                    <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5">
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

                    {/* Add form */}
                    <form
                        id="form-pengguna"
                        onSubmit={submit}
                        className="flex w-full shrink-0 flex-col gap-3.5 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-[320px]"
                    >
                        <h2 className="text-base font-semibold">Tambah pengguna baru</h2>

                        <Field label="Nama lengkap" error={errors.name}>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama karyawan"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Username" error={errors.username}>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="nama.pengguna"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Password sementara" error={errors.password}>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={inputClass}
                            />
                        </Field>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-medium text-[#4B5563]">Peran</span>
                            <div className="flex gap-1 rounded-xl bg-[#EEF2F7] p-1" role="group" aria-label="Peran">
                                {ROLE_OPTIONS.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setData('role', r.value)}
                                        aria-pressed={data.role === r.value}
                                        className={`flex-1 rounded-lg py-2 text-sm ${
                                            data.role === r.value ? 'bg-white font-semibold shadow-sm' : 'font-medium text-[#4B5563]'
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                            {errors.role && <p className="text-xs text-[#B91C1C]">{errors.role}</p>}
                        </div>

                        <p className="rounded-xl bg-[#FEF3C7] p-3 text-xs text-[#92400E]">
                            Pengguna mengganti password sementara saat pertama masuk.
                        </p>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] py-3.5 font-semibold text-white disabled:opacity-60"
                        >
                            Simpan Pengguna
                        </button>

                        <p className="text-xs text-[#4B5563]">
                            Lupa password pengguna? Pemilik dapat mengatur ulang password dari tombol Ubah.
                        </p>
                    </form>
                </div>
            </div>
        </TriposLayout>
    );
}