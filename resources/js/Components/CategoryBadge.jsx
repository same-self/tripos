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

const STYLES = {
    'Alat Tulis': { icon: Pencil, bg: 'bg-[#FEF3C7]', fg: 'text-[#B45309]' },
    Kertas: { icon: FileText, bg: 'bg-[#E0F2FE]', fg: 'text-[#0369A1]' },
    Buku: { icon: BookOpen, bg: 'bg-[#DCFCE7]', fg: 'text-[#15803D]' },
    Aksesoris: { icon: Paperclip, bg: 'bg-[#EDE9FE]', fg: 'text-[#6D28D9]' },
    Fotokopi: { icon: Copy, bg: 'bg-[#DBEAFE]', fg: 'text-[#1D4ED8]' },
    Print: { icon: Printer, bg: 'bg-[#FCE7F3]', fg: 'text-[#BE185D]' },
    Jilid: { icon: BookMarked, bg: 'bg-[#FFEDD5]', fg: 'text-[#C2410C]' },
    Banner: { icon: ImageIcon, bg: 'bg-[#CCFBF1]', fg: 'text-[#0F766E]' },
    Semua: { icon: Package, bg: 'bg-[#F3F4F6]', fg: 'text-[#111827]' },
};

// Categories the owner adds later are not in the list above. Instead of all turning grey,
// each one gets a stable color picked from its name (the same name always gives the same color).
const PALETTE = [
    { bg: 'bg-[#FEE2E2]', fg: 'text-[#B91C1C]' },
    { bg: 'bg-[#FEF3C7]', fg: 'text-[#B45309]' },
    { bg: 'bg-[#DCFCE7]', fg: 'text-[#15803D]' },
    { bg: 'bg-[#CCFBF1]', fg: 'text-[#0F766E]' },
    { bg: 'bg-[#E0F2FE]', fg: 'text-[#0369A1]' },
    { bg: 'bg-[#EDE9FE]', fg: 'text-[#6D28D9]' },
    { bg: 'bg-[#FCE7F3]', fg: 'text-[#BE185D]' },
    { bg: 'bg-[#FFEDD5]', fg: 'text-[#C2410C]' },
];

function styleFor(name) {
    if (STYLES[name]) return STYLES[name];

    let hash = 0;
    for (const char of String(name)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;

    return { icon: Tag, ...PALETTE[hash % PALETTE.length] };
}

export default function CategoryBadge({ name, size = 'md' }) {
    const style = styleFor(name);
    const Icon = style.icon;
    const box = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
    const iconSize = size === 'sm' ? 14 : 16;

    return (
        <span className={`flex shrink-0 items-center justify-center rounded-lg ${box} ${style.bg} ${style.fg}`}>
            <Icon size={iconSize} strokeWidth={2} aria-hidden="true" />
        </span>
    );
}
