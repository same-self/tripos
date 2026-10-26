import TriposTopbar from '@/Components/TriposTopbar';
import { Link } from '@inertiajs/react';

export default function CashierLayout({ active = 'Transaksi (POS)', children }) {
    const tabClass = (isActive) =>
        `rounded-lg px-3.5 py-2 text-[13px] ${
            isActive ? 'bg-[#DBEAFE] font-semibold text-[#1D4ED8]' : 'font-medium text-[#4B5563] hover:bg-[#F3F4F6]'
        }`;

    return (
        <div className="min-h-screen bg-[#F5F7FA] text-[#111827]">
            <TriposTopbar role="Kasir" />

            <nav className="flex gap-2 px-6 py-2.5 print:hidden" aria-label="Menu kasir">
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
            </nav>

            <main className="px-6 pb-6">{children}</main>
        </div>
    );
}