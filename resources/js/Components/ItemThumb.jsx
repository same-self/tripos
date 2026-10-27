import { Package } from 'lucide-react';

export default function ItemThumb({ src, name, size = 'md' }) {
    const box = size === 'lg' ? 'h-24 w-full' : 'h-9 w-9';

    if (src) {
        return <img src={src} alt={name} className={`${box} shrink-0 rounded-lg object-cover`} />;
    }

    return (
        <span
            className={`flex ${box} shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#9CA3AF]`}
            aria-label={`Belum ada gambar ${name}`}
        >
            <Package size={size === 'lg' ? 32 : 18} strokeWidth={1.75} aria-hidden="true" />
        </span>
    );
}
