import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function TriposTopbar({ role = 'Admin' }) {
    const { auth } = usePage().props;
    const userName = auth?.user?.name ?? 'Pengguna';
    const initial = userName.charAt(0).toUpperCase();

    const [menuOpen, setMenuOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        function handleClick(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) setMenuOpen(false);
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
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#E5E7EB] bg-white px-6">
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
                            <span className="text-xs text-[#4B5563]">{role}</span>
                        </span>
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[200px] rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-lg">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#B91C1C] hover:bg-[#F3F4F6]"
                            >
                                Keluar
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}