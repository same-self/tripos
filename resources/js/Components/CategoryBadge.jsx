import {
    BookMarked,
    BookOpen,
    Copy,
    FileText,
    Image as ImageIcon,
    Package,
    Paperclip,
    Pencil,
    Printer,
    Tag,
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { ICON_MAP } from '@/Components/categoryIconMap';

const STYLES = {
    'Alat Tulis': { icon: Pencil, bg: 'bg-[#FEF3C7] dark:bg-amber-950/60', fg: 'text-[#B45309] dark:text-amber-400' },
    Kertas: { icon: FileText, bg: 'bg-[#E0F2FE] dark:bg-sky-950/60', fg: 'text-[#0369A1] dark:text-sky-400' },
    Buku: { icon: BookOpen, bg: 'bg-[#DCFCE7] dark:bg-emerald-950/60', fg: 'text-[#15803D] dark:text-emerald-400' },
    Aksesoris: { icon: Paperclip, bg: 'bg-[#EDE9FE] dark:bg-purple-950/60', fg: 'text-[#6D28D9] dark:text-purple-400' },
    'Aksesoris Komputer': { icon: Paperclip, bg: 'bg-[#EDE9FE] dark:bg-purple-950/60', fg: 'text-[#6D28D9] dark:text-purple-400' },
    Fotokopi: { icon: Copy, bg: 'bg-[#DBEAFE] dark:bg-blue-950/60', fg: 'text-[#1D4ED8] dark:text-blue-400' },
    Print: { icon: Printer, bg: 'bg-[#FCE7F3] dark:bg-pink-950/60', fg: 'text-[#BE185D] dark:text-pink-400' },
    Jilid: { icon: BookMarked, bg: 'bg-[#FFEDD5] dark:bg-orange-950/60', fg: 'text-[#C2410C] dark:text-orange-400' },
    Banner: { icon: ImageIcon, bg: 'bg-[#CCFBF1] dark:bg-teal-950/60', fg: 'text-[#0F766E] dark:text-teal-400' },
    Semua: { icon: Package, bg: 'bg-[#F3F4F6] dark:bg-slate-800', fg: 'text-[#111827] dark:text-slate-200' },
};

// Categories the owner adds later are not in the list above. Instead of all turning grey,
// each one gets a stable color picked from its name (the same name always gives the same color).
const PALETTE = [
    { bg: 'bg-[#FEE2E2] dark:bg-red-950/60', fg: 'text-[#B91C1C] dark:text-red-400' },
    { bg: 'bg-[#FEF3C7] dark:bg-amber-950/60', fg: 'text-[#B45309] dark:text-amber-400' },
    { bg: 'bg-[#DCFCE7] dark:bg-emerald-950/60', fg: 'text-[#15803D] dark:text-emerald-400' },
    { bg: 'bg-[#CCFBF1] dark:bg-teal-950/60', fg: 'text-[#0F766E] dark:text-teal-400' },
    { bg: 'bg-[#E0F2FE] dark:bg-sky-950/60', fg: 'text-[#0369A1] dark:text-sky-400' },
    { bg: 'bg-[#EDE9FE] dark:bg-purple-950/60', fg: 'text-[#6D28D9] dark:text-purple-400' },
    { bg: 'bg-[#FCE7F3] dark:bg-pink-950/60', fg: 'text-[#BE185D] dark:text-pink-400' },
    { bg: 'bg-[#FFEDD5] dark:bg-orange-950/60', fg: 'text-[#C2410C] dark:text-orange-400' },
];

function styleFor(name) {
    if (STYLES[name]) return STYLES[name];

    let hash = 0;
    for (const char of String(name)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;

    return { icon: Tag, ...PALETTE[hash % PALETTE.length] };
}

export default function CategoryBadge({ name, size = 'md', icon, imageUrl }) {
    const custom = usePage().props.categoryIcons?.[name];
    const url = imageUrl ?? custom?.image_url ?? null;
    const key = icon ?? custom?.icon ?? null;
    const style = styleFor(name);
    const Icon = (key && ICON_MAP[key]) || style.icon;
    const box = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
    const iconSize = size === 'sm' ? 14 : 16;

    if (url) {
        return (
            <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg ${box} bg-white dark:bg-slate-800`}>
                <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </span>
        );
    }

    return (
        <span className={`flex shrink-0 items-center justify-center rounded-lg ${box} ${style.bg} ${style.fg}`}>
            <Icon size={iconSize} strokeWidth={2} aria-hidden="true" />
        </span>
    );
}
