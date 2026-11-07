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

const DEFAULT = { icon: Tag, bg: 'bg-[#F3F4F6] dark:bg-slate-800', fg: 'text-[#4B5563] dark:text-slate-400' };

export default function CategoryBadge({ name, size = 'md' }) {
    const style = STYLES[name] ?? DEFAULT;
    const Icon = style.icon;
    const box = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
    const iconSize = size === 'sm' ? 14 : 16;

    return (
        <span className={`flex shrink-0 items-center justify-center rounded-lg ${box} ${style.bg} ${style.fg}`}>
            <Icon size={iconSize} strokeWidth={2} aria-hidden="true" />
        </span>
    );
}
