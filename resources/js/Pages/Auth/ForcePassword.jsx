import { Head, Link, useForm, usePage } from '@inertiajs/react';

const inputClass = 'h-11 rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm';

export default function ForcePassword() {
    const { auth } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        put(route('password.force.update'));
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] p-6">
            <Head title="Ganti Password" />

            <div className="w-full max-w-[420px] rounded-2xl border border-[#E5E7EB] bg-white p-8">
                <p className="text-lg font-bold text-[#1D4ED8]">TRIPOS</p>
                <h1 className="mt-4 text-[22px] font-bold">Ganti password</h1>
                <p className="mt-1 text-sm text-[#4B5563]">
                    Halo {auth?.user?.name}. Demi keamanan, buat password baru sebelum melanjutkan.
                </p>

                <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-xs font-medium text-[#4B5563]">
                            Password baru
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                            autoFocus
                            className={inputClass}
                        />
                        {errors.password && <p className="text-xs text-[#B91C1C]">{errors.password}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password_confirmation" className="text-xs font-medium text-[#4B5563]">
                            Ulangi password baru
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                            className={inputClass}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-2 h-11 rounded-xl bg-[#1D4ED8] font-semibold text-white disabled:opacity-60"
                    >
                        Simpan password baru
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <Link href={route('logout')} method="post" as="button" className="font-medium text-[#B91C1C]">
                        Keluar
                    </Link>
                </div>
            </div>
        </div>
    );
}