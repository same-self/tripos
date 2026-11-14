import TriposLayout from '@/Layouts/TriposLayout';
import PasswordInput from '@/Components/PasswordInput';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Lock,
    Save,
    ShieldAlert,
    ShieldCheck,
    Store,
    User,
} from 'lucide-react';
import Field from '@/Components/Field';

const inputClass =
    'h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 transition-all';

const ROLE_OPTIONS = [
    { value: 'cashier', label: 'Kasir', icon: Store },
    { value: 'admin', label: 'Admin', icon: ShieldCheck },
];

function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Edit({ user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        username: user.username,
        role: user.role,
        active: user.active,
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        put(route('pengguna.update', user.id));
    }

    return (
        <TriposLayout active="Pengguna">
            <Head title={`Ubah Pengguna - ${user.name}`} />

            <div className="max-w-2xl">
                {/* Back navigation link */}
                <div className="mb-4">
                    <Link
                        href={route('pengguna.index')}
                        className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                        Kembali ke Pengguna
                    </Link>
                </div>

                {/* Header card with User Profile preview */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-3.5">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm ${
                                user.role === 'admin'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 dark:border dark:border-blue-800/60'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700/60'
                            }`}
                        >
                            {getInitials(user.name)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {user.name}
                                </h1>
                                {user.is_self && (
                                    <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60">
                                        Akun Anda
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                @{user.username} · {user.role === 'admin' ? 'Administrator' : 'Kasir Toko'} ·{' '}
                                <span className={user.active ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}>
                                    {user.active ? 'Status Aktif' : 'Nonaktif'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form
                    onSubmit={submit}
                    className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90"
                >
                    {user.is_super_admin && (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 leading-relaxed">
                            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div>
                                <p className="font-bold">Akun Pemilik Toko</p>
                                <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/80">
                                    Peran selalu Admin dan status selalu Aktif. Akun ini tidak bisa diubah oleh pengguna lain dan tidak bisa dihapus.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Self Account Guard Warning */}
                    {user.is_self && !user.is_super_admin && (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 leading-relaxed">
                            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div>
                                <p className="font-bold text-amber-900 dark:text-amber-200">Akun Sesi Aktif Anda</p>
                                <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/80">
                                    Ini adalah akun yang sedang Anda gunakan saat ini. Demi keamanan sistem dan menjaga akses, peran dan status akun ini dikunci agar tidak dapat dinonaktifkan atau diturunkan.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Full Name */}
                    <Field label="Nama Lengkap" error={errors.name}>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nama lengkap staf"
                            className={inputClass}
                        />
                    </Field>

                    {/* Username */}
                    <Field label="Username Login" error={errors.username}>
                        <input
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            placeholder="username.login"
                            className={inputClass}
                        />
                    </Field>

                    {/* Role Picker (Apple Segmented Control) */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Peran Pengguna</span>
                            {(user.is_self || user.is_super_admin) && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                    <Lock size={11} /> {user.is_super_admin ? 'Dikunci untuk akun pemilik' : 'Dikunci untuk akun Anda'}
                                </span>
                            )}
                        </div>
                        <div
                            className="flex gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800"
                            role="group"
                            aria-label="Peran"
                        >
                            {ROLE_OPTIONS.map((r) => {
                                const Icon = r.icon;
                                const isLocked = (user.is_self || user.is_super_admin) && r.value !== 'admin';
                                return (
                                    <button
                                        key={r.value}
                                        type="button"
                                        disabled={isLocked}
                                        onClick={() => !isLocked && setData('role', r.value)}
                                        aria-pressed={data.role === r.value}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs transition-all ${
                                            data.role === r.value
                                                ? 'bg-white font-semibold text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                                                : isLocked
                                                  ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                                                  : 'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                        }`}
                                    >
                                        <Icon size={14} className="shrink-0" />
                                        <span>{r.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.role && <p className="text-xs text-red-600 dark:text-red-400">{errors.role}</p>}
                    </div>

                    {/* Status Picker (Active / Inactive) */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status Akun</span>
                            {(user.is_self || user.is_super_admin) && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                    <Lock size={11} /> {user.is_super_admin ? 'Dikunci untuk akun pemilik' : 'Dikunci untuk akun Anda'}
                                </span>
                            )}
                        </div>
                        <div
                            className="flex gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800"
                            role="group"
                            aria-label="Status"
                        >
                            <button
                                type="button"
                                onClick={() => setData('active', true)}
                                aria-pressed={data.active}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs transition-all ${
                                    data.active
                                        ? 'bg-white font-semibold text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                                        : 'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Aktif</span>
                            </button>
                            <button
                                type="button"
                                disabled={user.is_self || user.is_super_admin}
                                onClick={() => !(user.is_self || user.is_super_admin) && setData('active', false)}
                                aria-pressed={!data.active}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs transition-all ${
                                    !data.active
                                        ? 'bg-white font-semibold text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                                        : (user.is_self || user.is_super_admin)
                                          ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                                          : 'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                <span>Nonaktif</span>
                            </button>
                        </div>
                    </div>

                    {/* Reset Password */}
                    <Field label="Password Baru" error={errors.password}>
                        <PasswordInput
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Isi hanya jika ingin mereset password"
                            className={inputClass}
                        />
                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                            Kosongkan jika tidak ingin mengubah password. Jika diisi, pengguna akan diminta mengatur password baru saat login berikutnya.
                        </p>
                    </Field>

                    {/* Bottom Actions with 44pt touch targets */}
                    <div className="mt-3 flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href={route('pengguna.index')}
                            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60"
                        >
                            <Save size={16} />
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}
