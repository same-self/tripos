import CashierLayout from '@/Layouts/CashierLayout';
import TriposLayout from '@/Layouts/TriposLayout';
import PageTitle from '@/Components/PageTitle';
import PasswordInput from '@/Components/PasswordInput';
import { Head, useForm, usePage } from '@inertiajs/react';
import { KeyRound, User } from 'lucide-react';
import Field from '@/Components/Field';

const inputClass =
    'h-11 w-full rounded-xl border border-[#6B7280] bg-white px-3.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]';

function Card({ icon: Icon, title, text, children }) {
    return (
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-400">
                    <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <p className="text-xs text-[#4B5563] dark:text-slate-400">{text}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

export default function Edit({ profile, isAdmin }) {
    const Layout = isAdmin ? TriposLayout : CashierLayout;
    const { flash } = usePage().props;

    const nameForm = useForm({ name: profile.name });
    const passwordForm = useForm({ password: '', password_confirmation: '' });

    function saveName(e) {
        e.preventDefault();
        nameForm.patch(route('profile.update'), { preserveScroll: true });
    }

    function savePassword(e) {
        e.preventDefault();
        passwordForm.put(route('profile.password'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    }

    return (
        <Layout active="Profil">
            <Head title="Profil Saya" />

            <div className="mx-auto flex max-w-2xl flex-col gap-5">
                <div>
                    <PageTitle icon={User}>Profil Saya</PageTitle>
                    <p className="mt-1 text-[13px] text-[#4B5563] dark:text-slate-400">
                        Masuk sebagai <strong>{profile.username}</strong> · {profile.role}. Nama dan password bisa Anda ubah sendiri.
                    </p>
                </div>

                {!isAdmin && flash?.success && (
                    <p className="rounded-xl bg-[#DCFCE7] px-4 py-3 text-sm font-medium text-[#15803D] dark:border dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {flash.success}
                    </p>
                )}

                <Card icon={User} title="Nama" text="Nama yang tampil di pojok kanan atas dan di struk.">
                    <form onSubmit={saveName} className="grid gap-4">
                        <Field label="Nama lengkap" error={nameForm.errors.name}>
                            <input
                                type="text"
                                value={nameForm.data.name}
                                onChange={(e) => nameForm.setData('name', e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={nameForm.processing || nameForm.data.name === profile.name}
                                className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                            >
                                Simpan Nama
                            </button>
                        </div>
                    </form>
                </Card>

                <Card icon={KeyRound} title="Ganti password" text="Isi password baru minimal 6 karakter.">
                    <form onSubmit={savePassword} className="grid gap-4">
                        <Field label="Password baru" error={passwordForm.errors.password}>
                            <PasswordInput
                                name="password"
                                value={passwordForm.data.password}
                                placeholder="Password baru"
                                autoComplete="new-password"
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Ulangi password baru" error={passwordForm.errors.password_confirmation}>
                            <PasswordInput
                                name="password_confirmation"
                                value={passwordForm.data.password_confirmation}
                                placeholder="Ulangi password baru"
                                autoComplete="new-password"
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                            >
                                Ganti Password
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
        </Layout>
    );
}
