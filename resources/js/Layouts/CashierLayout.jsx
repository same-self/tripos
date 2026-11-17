import TriposTopbar from '@/Components/TriposTopbar';
import { Link, usePage } from '@inertiajs/react';

export default function CashierLayout({ active = 'Transaksi (POS)', children }) {
    const isAdmin = usePage().props.auth?.user?.role === 'admin';

    const tabClass = (isActive) =>
        `rounded-lg px-3.5 py-2 text-[13px] transition-colors duration-150 ${
            isActive
                ? 'bg-[#DBEAFE] font-semibold text-[#1D4ED8] dark:bg-blue-600 dark:text-white dark:shadow-sm'
                : 'font-medium text-[#4B5563] hover:bg-[#F3F4F6] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`;

    return (
        <div className="min-h-screen bg-[#F5F7FA] text-[#111827] dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
            <TriposTopbar role={isAdmin ? 'Admin' : 'Kasir'} />

            <nav className="flex flex-wrap items-center gap-2 px-6 py-2.5 print:hidden" aria-label="Menu kasir">
                {isAdmin && (
                    <Link
                        href={route('dashboard')}
                        className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#4B5563] transition-colors duration-150 hover:bg-[#F3F4F6] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        ← Dashboard
                    </Link>
                )}
                <Link
                    href={route('kasir.pos')}
                    className={tabClass(active === 'Transaksi (POS)')}
                    aria-current={active === 'Transaksi (POS)' ? 'page' : undefined}
                >
                    Transaksi (POS)
                </Link>
                <Link
                    href={route('kasir.harga')}
                    className={tabClass(active === 'Price List')}
                    aria-current={active === 'Price List' ? 'page' : undefined}
                >
                    Price List
                </Link>
                <Link
                    href={route('kasir.riwayat')}
                    className={tabClass(active === 'Riwayat Transaksi')}
                    aria-current={active === 'Riwayat Transaksi' ? 'page' : undefined}
                >
                    Riwayat Transaksi
                </Link>
            </nav>

            <main className="px-6 pb-6">{children}</main>
        </div>
    );
}
