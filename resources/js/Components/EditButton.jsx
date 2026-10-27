import { Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

export default function EditButton({ href, label = 'Ubah' }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#93C5FD] bg-[#DBEAFE] px-2.5 py-1.5 text-[13px] font-semibold text-[#1D4ED8] hover:bg-[#BFDBFE]"
        >
            <Pencil size={14} strokeWidth={2.25} aria-hidden="true" />
            {label}
        </Link>
    );
}
