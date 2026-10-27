import { Link, usePage } from '@inertiajs/react';
import {
    FileText,
    LayoutDashboard,
    LogOut,
    Package,
    Receipt,
    RefreshCw,
    Truck,
    Users,
    Warehouse,
    Wrench,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MENU = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Transaksi (POS)', href: '/riwayat', icon: Receipt },
    { label: 'Barang', href: '/barang', icon: Package },
    { label: 'Layanan', href: '/layanan', icon: Wrench },
    { label: 'Supplier', href: '/supplier', icon: Truck },
    { label: 'Restok', href: '/restok', icon: RefreshCw },
    { label: 'Stok', href: '/stok', icon: Warehouse },
    { label: 'Laporan', href: '/laporan', icon: FileText },
    { label: 'Pengguna', href: '/pengguna', icon: Users },
];

export default function TriposLayout({ active = 'Dashboard', children }) {
    const { auth, flash } = usePage().props;
    const userName = auth?.user?.name ?? 'Pengguna';
    const initial = userName.charAt(0).toUpperCase();

    const [menuOpen, setMenuOpen] = useState(false);
    const profileRef = useRef(null);

    // Close the profile menu when clicking outside it or pressing Escape
    useEffect(() => {
        function handleClick(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        function handleKey(event) {
            if (event.key === 'Escape') setMenuOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, []);

    const now = new Date();
    const today =
        now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen bg-[#F5F7FA] text-[#111827]">
            <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#E5E7EB] bg-white px-6 print:hidden">
                <div className="flex items-baseline gap-2.5">
                    <span className="text-lg font-bold text-[#1D4ED8]">TRIPOS</span>
                    <span className="hidden text-sm text-[#4B5563] md:inline">Point of Sale · UMKM Fotocopy Trisanet</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="hidden text-xs text-[#4B5563] md:inline">{today}</span>

                    <div ref={profileRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-haspopup="true"
                            aria-expanded={menuOpen}
                            className="flex items-center gap-2.5 rounded-xl px-2 py-1 hover:bg-[#F3F4F6]"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DBEAFE] font-bold text-[#1D4ED8]">
                                {initial}
                            </span>
                            <span className="flex flex-col text-left">
                                <strong className="text-sm">{userName}</strong>
                                <span className="text-xs text-[#4B5563]">Admin</span>
                            </span>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[200px] rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-lg">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#B91C1C] hover:bg-[#F3F4F6]"
                                >
                                    <LogOut size={16} aria-hidden="true" />
                                    Keluar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex min-h-[calc(100vh-72px)]">
                <aside className="hidden w-60 shrink-0 border-r border-[#E5E7EB] bg-white p-4 print:hidden md:block">
                    <p className="px-3 pb-2 text-xs tracking-wide text-[#4B5563]">MENU</p>
                    <nav className="flex flex-col gap-1" aria-label="Menu utama">
                        {MENU.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.label === active;

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                                        isActive
                                            ? 'bg-[#DBEAFE] font-semibold text-[#1D4ED8]'
                                            : 'text-[#111827] hover:bg-[#F3F4F6]'
                                    }`}
                                >
                                    <Icon size={18} strokeWidth={2} aria-hidden="true" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <main className="flex-1 p-6 md:p-8">
                    {flash?.success && (
                        <p className="mb-5 rounded-xl bg-[#DCFCE7] px-4 py-3 text-sm font-medium text-[#15803D] print:hidden">
                            {flash.success}
                        </p>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
