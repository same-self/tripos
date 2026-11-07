import TriposLayout from '@/Layouts/TriposLayout';
import PasswordInput from '@/Components/PasswordInput';
import { Head, Link, useForm } from '@inertiajs/react';

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
            <Head title="Ubah Pengguna" />

            <div className="max-w-xl">
                <h1 className="text-[22px] font-bold text-gray-900 dark:text-white">Ubah Pengguna</h1>
                <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                    Perbarui data, peran, atau status akun. Isi password baru hanya jika ingin mengatur ulang.
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    {user.is_self && (
                        <p className="rounded-xl bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E] dark:border dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300">
                            Ini akun yang sedang dipakai. Akunnya tidak bisa dinonaktifkan atau diturunkan perannya.
                        </p>
                    )}

                    <Field label="Nama lengkap" error={errors.name}>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Username" error={errors.username}>
                        <input
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
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

                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-[#4B5563] dark:text-slate-300">Status</span>
                        <div className="flex gap-1 rounded-xl bg-[#EEF2F7] p-1 dark:border dark:border-slate-800 dark:bg-slate-950" role="group" aria-label="Status">
                            <button
                                type="button"
                                onClick={() => setData('active', true)}
                                aria-pressed={data.active}
                                className={`flex-1 rounded-lg py-2 text-sm transition-colors ${
                                    data.active
                                        ? 'bg-white font-semibold shadow-sm dark:bg-slate-800 dark:text-white'
                                        : 'font-medium text-[#4B5563] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                Aktif
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('active', false)}
                                aria-pressed={!data.active}
                                className={`flex-1 rounded-lg py-2 text-sm transition-colors ${
                                    !data.active
                                        ? 'bg-white font-semibold shadow-sm dark:bg-slate-800 dark:text-white'
                                        : 'font-medium text-[#4B5563] dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                Nonaktif
                            </button>
                        </div>
                    </div>

                    <Field label="Password baru (kosongkan jika tidak diubah)" error={errors.password}>
                        <PasswordInput
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href={route('pengguna.index')}
                            className="rounded-xl border border-[#6B7280] px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm"
                        >
                            Simpan perubahan
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}