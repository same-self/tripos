import TriposLayout from '@/Layouts/TriposLayout';
import EditButton from '@/Components/EditButton';
import PasswordInput from '@/Components/PasswordInput';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Search,
    ShieldCheck,
    Store,
    Trash2,
    UserPlus,
    Users,
    UserX,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Field from '@/Components/Field';

const inputClass =
    'h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 transition-all';

const ROLE_OPTIONS = [
    { value: 'cashier', label: 'Kasir' },
    { value: 'admin', label: 'Admin' },
];

function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Index({ users }) {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        password: '',
        role: 'cashier',
    });

    const { errors: pageErrors } = usePage().props;

    // Filtered users based on search query and role filter
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch =
                !search.trim() ||
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.username.toLowerCase().includes(search.toLowerCase());

            const matchesRole =
                roleFilter === 'all' ||
                (roleFilter === 'admin' && u.role === 'admin') ||
                (roleFilter === 'cashier' && u.role === 'cashier');

            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    // Metrics summary
    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === 'admin' && u.active).length;
    const cashierCount = users.filter((u) => u.role === 'cashier' && u.active).length;
    const inactiveCount = users.filter((u) => !u.active).length;

    function remove(user) {
        if (window.confirm(`Hapus pengguna "${user.name}"? Riwayat transaksinya tetap tersimpan, tetapi akun tidak bisa dipakai login lagi.`)) {
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

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">Pengguna</h1>
                    <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                        Kelola staf, hak akses kasir, dan akun administrator TRIPOS.
                    </p>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                    <div className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pengguna</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <Users size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {totalUsers}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">Akun terdaftar</p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Admin Aktif</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                <ShieldCheck size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {adminCount}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">Akses penuh sistem</p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Kasir Aktif</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <Store size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {cashierCount}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">Akses POS kasir</p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Akun Nonaktif</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                <UserX size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {inactiveCount}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                {inactiveCount === 0 ? 'Semua akun aktif' : 'Akses dinonaktifkan'}
                            </p>
                        </div>
                    </div>
                </div>

                {pageErrors.hapus && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
                        <AlertCircle size={18} className="shrink-0 text-red-500" />
                        <span>{pageErrors.hapus}</span>
                    </div>
                )}

                {/* Main Content: Table + Add Form */}
                <div className="flex flex-col gap-5 lg:flex-row items-start">
                    {/* User list Section */}
                    <section className="min-w-0 flex-1 w-full rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90 overflow-hidden">
                        {/* Search and Filter toolbar */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                            <div className="relative flex-1 max-w-sm">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama atau username..."
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Role Filter Pills */}
                            <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800">
                                {[
                                    { id: 'all', label: 'Semua', count: users.length },
                                    { id: 'cashier', label: 'Kasir', count: users.filter((u) => u.role === 'cashier').length },
                                    { id: 'admin', label: 'Admin', count: users.filter((u) => u.role === 'admin').length },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setRoleFilter(tab.id)}
                                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                                            roleFilter === tab.id
                                                ? 'bg-white font-semibold text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                                                : 'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        <span
                                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold tabular-nums ${
                                                roleFilter === tab.id
                                                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                                                    : 'text-slate-400 dark:text-slate-500'
                                            }`}
                                        >
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Pengguna</th>
                                        <th scope="col" className="px-4 py-3">Peran</th>
                                        <th scope="col" className="px-4 py-3">Status</th>
                                        <th scope="col" className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                                                Tidak ada pengguna yang cocok dengan pencarian atau filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <tr
                                                key={u.id}
                                                className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                                                    !u.active ? 'opacity-65 hover:opacity-100' : ''
                                                }`}
                                            >
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform ${
                                                                u.role === 'admin'
                                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 dark:border dark:border-blue-800/60'
                                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700/60'
                                                            }`}
                                                        >
                                                            {getInitials(u.name)}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span
                                                                className={`truncate font-semibold text-sm ${
                                                                    u.active
                                                                        ? 'text-slate-900 dark:text-white'
                                                                        : 'text-slate-500 dark:text-slate-400'
                                                                }`}
                                                            >
                                                                {u.name}
                                                                {u.is_super_admin && (
                                                                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">Pemilik</span>
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                                @{u.username}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            u.role === 'admin'
                                                                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:border-blue-800/60 dark:text-blue-300'
                                                                : 'bg-slate-100 text-slate-700 border border-slate-200/70 dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {u.role === 'admin' ? (
                                                            <ShieldCheck size={12} className="shrink-0" />
                                                        ) : (
                                                            <Store size={12} className="shrink-0" />
                                                        )}
                                                        {u.role_label}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            u.active
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/50 dark:border-emerald-800/50 dark:text-emerald-300'
                                                                : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-400'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                u.active ? 'bg-emerald-500' : 'bg-slate-400'
                                                            }`}
                                                        />
                                                        {u.active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3.5 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {u.can_edit && <EditButton href={route('pengguna.edit', u.id)} />}
                                                        {u.can_delete && (
                                                            <button
                                                                type="button"
                                                                onClick={() => remove(u)}
                                                                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 active:scale-[0.98] dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50 transition-all"
                                                            >
                                                                <Trash2 size={13} strokeWidth={2.2} aria-hidden="true" />
                                                                Hapus
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Add form */}
                    <form
                        id="form-pengguna"
                        onSubmit={submit}
                        className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 lg:w-[340px] dark:border-slate-800/80 dark:bg-slate-900/90 shadow-sm"
                    >
                        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <UserPlus size={16} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tambah Pengguna Baru</h2>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">Buat akun untuk kasir atau admin</p>
                            </div>
                        </div>

                        <Field label="Nama lengkap" error={errors.name}>
                            <input
                                id="input-name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Budi Santoso"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Username login" error={errors.username}>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="Contoh: budi.kasir"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Password" error={errors.password}>
                            <PasswordInput
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={inputClass}
                            />
                        </Field>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Pilih Peran</span>
                            <div
                                className="flex gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800"
                                role="group"
                                aria-label="Peran"
                            >
                                {ROLE_OPTIONS.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setData('role', r.value)}
                                        aria-pressed={data.role === r.value}
                                        className={`flex-1 rounded-lg py-2 text-xs transition-all ${
                                            data.role === r.value
                                                ? 'bg-white font-semibold text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                                                : 'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                            {errors.role && <p className="text-xs text-red-600 dark:text-red-400">{errors.role}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-1 flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60"
                        >
                            <UserPlus size={16} />
                            Simpan Pengguna
                        </button>

                        <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                            Password dapat diatur ulang kapan saja oleh admin melalui tombol <strong>Ubah</strong>.
                        </p>
                    </form>
                </div>
            </div>
        </TriposLayout>
    );
}
