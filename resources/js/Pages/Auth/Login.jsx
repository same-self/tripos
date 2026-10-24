import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';

const FEATURES = [
    { title: 'Transaksi kasir lebih cepat', text: 'Pilih barang, hitung kembalian, dan cetak struk dalam satu layar.' },
    { title: 'Stok berkurang otomatis', text: 'Setiap penjualan dan restok langsung tercatat di riwayat stok.' },
    { title: 'Laporan siap kapan saja', text: 'Penjualan, pembelian, dan arus kas tersedia untuk pemilik toko.' },
];

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk" />

            <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
                {/* Brand panel, hidden on small screens */}
                <section
                    className="relative hidden overflow-hidden bg-[#1D4ED8] p-12 text-white md:flex md:flex-col md:justify-between"
                    aria-hidden="true"
                >
                    <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-28 -left-24 h-[300px] w-[300px] rounded-full bg-white/10" />

                    <div className="relative">
                        <div className="text-[22px] font-bold">TRIPOS</div>
                        <div className="mt-0.5 text-xs opacity-85">Point of Sale · UMKM Fotocopy Trisanet</div>
                    </div>

                    <div className="relative">
                        <h2 className="mb-7 text-[28px] font-bold leading-tight">
                            Kelola kasir dan stok dari satu layar.
                        </h2>
                        <ul className="grid gap-[18px]">
                            {FEATURES.map((f) => (
                                <li key={f.title} className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">
                                        ✓
                                    </span>
                                    <div>
                                        <strong className="text-sm">{f.title}</strong>
                                        <p className="mt-0.5 text-[13px] opacity-90">{f.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative text-xs opacity-85">UMKM Fotocopy Trisanet · Cileungsi, Kab. Bogor</div>
                </section>

                {/* Sign-in form */}
                <section className="flex items-center justify-center bg-white p-8 md:p-12">
                    <form onSubmit={submit} className="flex w-full max-w-[360px] flex-col">
                        <h1 className="text-[22px] font-bold">Selamat datang</h1>
                        <p className="mt-1 text-sm text-[#4B5563]">Masuk dengan username dan password Anda.</p>

                        {status && <p className="mt-4 text-sm font-medium text-[#15803D]">{status}</p>}

                        <label htmlFor="username" className="mt-5 text-xs font-semibold">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            placeholder="nama.pengguna"
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('username', e.target.value)}
                            className="mt-1 h-10 rounded-lg border border-[#6B7280] px-3 text-sm focus:border-[#1D4ED8] focus:outline-2 focus:outline-[#1D4ED8]"
                        />
                        <InputError message={errors.username} className="mt-1" />

                        <label htmlFor="password" className="mt-4 text-xs font-semibold">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            placeholder="Password"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 h-10 rounded-lg border border-[#6B7280] px-3 text-sm focus:border-[#1D4ED8] focus:outline-2 focus:outline-[#1D4ED8]"
                        />
                        <InputError message={errors.password} className="mt-1" />

                        <p className="mt-3 text-[13px] text-[#4B5563]">Lupa password? Hubungi pemilik toko.</p>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-4 h-11 rounded-lg bg-[#1D4ED8] font-semibold text-white hover:brightness-95 disabled:opacity-60"
                        >
                            Masuk
                        </button>

                        <p className="mt-4 text-center text-[13px] text-[#4B5563]">
                            Akun dibuat dan diatur oleh pemilik toko.
                        </p>
                    </form>
                </section>
            </div>
        </>
    );
}