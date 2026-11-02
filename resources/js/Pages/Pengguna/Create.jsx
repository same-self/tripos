import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Users } from 'lucide-react';
import PageTitle from '@/Components/PageTitle';

const inputClass = 'h-11 rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm';

const ROLE_OPTIONS = [
    { value: 'cashier', label: 'Kasir' },
    { value: 'admin', label: 'Admin' },
];

function Field({ label, error, hint, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#4B5563]">{label}</label>
            {children}
            {hint && !error && <p className="text-xs text-[#4B5563]">{hint}</p>}
            {error && <p className="text-xs text-[#B91C1C]">{error}</p>}
        </div>
    );
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        username: '',
        password: '',
        role: 'cashier',
    });

    function submit(e) {
        e.preventDefault();
        post(route('pengguna.store'));
    }

    return (
        <TriposLayout active="Pengguna">
            <Head title="Tambah Pengguna" />

            <div className="max-w-xl">
                <PageTitle icon={Users}>Tambah Pengguna</PageTitle>
                <p className="mt-1 text-[13px] text-[#4B5563]">
                    Buat akun Admin atau Kasir baru. Pengguna mengganti password sementara saat pertama masuk.
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6">
                    <Field label="Nama lengkap" error={errors.name}>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nama karyawan"
                            autoFocus
                            className={inputClass}
                        />
                    </Field>

                    <Field
                        label="Username"
                        error={errors.username}
                        hint="Dipakai untuk masuk. Huruf, angka, titik, garis bawah, atau tanda minus."
                    >
                        <input
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            placeholder="nama.pengguna"
                            autoComplete="off"
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Password sementara" error={errors.password} hint="Minimal 6 karakter.">
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
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
                        <p className="text-xs text-[#4B5563]">
                            {data.role === 'admin'
                                ? 'Admin bisa membuka semua menu, termasuk laporan dan pengguna.'
                                : 'Kasir hanya bisa memakai layar kasir dan Price List.'}
                        </p>
                        {errors.role && <p className="text-xs text-[#B91C1C]">{errors.role}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href={route('pengguna.index')}
                            className="rounded-xl border border-[#6B7280] px-4 py-2.5 text-sm font-medium"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            Simpan Pengguna
                        </button>
                    </div>
                </form>
            </div>
        </TriposLayout>
    );
}
