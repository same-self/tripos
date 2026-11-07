import TriposLayout from '@/Layouts/TriposLayout';
import EditButton from '@/Components/EditButton';
import PasswordInput from '@/Components/PasswordInput';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';

const inputClass =
    'h-11 rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]';

const ROLE_OPTIONS = [
    { value: 'cashier', label: 'Kasir' },
    { value: 'admin', label: 'Admin' },
];

function Field({ label, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#4B5563] dark:text-slate-300">{label}</label>
            {children}
            {error && <p className="text-xs text-[#B91C1C] dark:text-red-400">{error}</p>}
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
                        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Pengguna</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                            Kelola akun Admin dan Kasir yang bisa masuk ke TRIPOS.
                        </p>
                    </div>
                    <a
                        href="#form-pengguna"
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                        Tambah Pengguna
                    </a>
                </div>

                <div className="flex flex-col gap-5 lg:flex-row">
                    {pageErrors.hapus && (
                        <p className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C] dark:bg-red-950/50 dark:border dark:border-red-800 dark:text-red-300">{pageErrors.hapus}</p>
                    )}

                    {/* User list */}
                    <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563] dark:border-slate-800 dark:text-slate-400">
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
                                    <tr key={u.id} className="border-b border-[#E5E7EB] last:border-b-0 dark:border-slate-800/80 hover:bg-gray-50/50 hover:dark:bg-slate-800/40 transition-colors">
                                        <td className={`px-2 py-3.5 font-medium ${u.active ? 'text-[#111827] dark:text-white' : 'text-[#4B5563] dark:text-slate-400'}`}>
                                            {u.name}
                                        </td>
                                        <td className="px-2 py-3.5 text-[#4B5563] dark:text-slate-400">{u.username}</td>
                                        <td className="px-2 py-3.5">
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    u.role === 'admin'
                                                        ? 'bg-[#DBEAFE] text-[#1D4ED8] dark:bg-blue-950/80 dark:border dark:border-blue-800/60 dark:text-blue-300'
                                                        : 'bg-[#F3F4F6] text-[#111827] dark:bg-slate-800 dark:border dark:border-slate-700 dark:text-slate-300'
                                                }`}
                                            >
                                                {u.role_label}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3.5">
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    u.active
                                                        ? 'bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:border dark:border-emerald-800/60 dark:text-emerald-300'
                                                        : 'bg-[#F3F4F6] text-[#4B5563] dark:bg-slate-800 dark:border dark:border-slate-700 dark:text-slate-400'
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
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-2.5 py-1.5 text-[13px] font-semibold text-[#B91C1C] hover:bg-[#FECACA] dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
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
                        className="flex w-full shrink-0 flex-col gap-3.5 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-[320px] dark:border-slate-800 dark:bg-slate-900"
                    >
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tambah pengguna baru</h2>

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
                            <PasswordInput
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={inputClass}
                            />
                        </Field>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-medium text-[#4B5563] dark:text-slate-300">Peran</span>
                            <div className="flex gap-1 rounded-xl bg-[#EEF2F7] p-1 dark:border dark:border-slate-800 dark:bg-slate-950" role="group" aria-label="Peran">
                                {ROLE_OPTIONS.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setData('role', r.value)}
                                        aria-pressed={data.role === r.value}
                                        className={`flex-1 rounded-lg py-2 text-sm transition-colors ${
                                            data.role === r.value
                                                ? 'bg-white font-semibold shadow-sm dark:bg-slate-800 dark:text-white'
                                                : 'font-medium text-[#4B5563] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                            {errors.role && <p className="text-xs text-[#B91C1C] dark:text-red-400">{errors.role}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] py-3.5 font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm"
                        >
                            Simpan Pengguna
                        </button>

                        <p className="text-xs text-[#4B5563] dark:text-slate-400">
                            Lupa password pengguna? Pemilik dapat mengatur ulang password dari tombol Ubah.
                        </p>
                    </form>
                </div>
            </div>
        </TriposLayout>
    );
}