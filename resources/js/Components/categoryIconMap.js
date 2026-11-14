import {
    Battery, BookMarked, BookOpen, Box, Calculator, Copy, Eraser, FileText, Folder, Gift,
    Headphones, Heart, Image as ImageIcon, Keyboard, Layers, Lightbulb, Mouse, Newspaper,
    Package, Paperclip, Palette, Pencil, Printer, Ruler, Scissors, ShoppingBag, Smartphone, Star,
} from 'lucide-react';

/** Kunci ikon preset (harus sama dengan App\Support\CategoryIcons::ALL) -> komponen lucide. */
export const ICON_MAP = {
    package: Package, pencil: Pencil, eraser: Eraser, ruler: Ruler, scissors: Scissors,
    paperclip: Paperclip, 'file-text': FileText, 'book-open': BookOpen, 'book-marked': BookMarked,
    newspaper: Newspaper, folder: Folder, copy: Copy, printer: Printer, image: ImageIcon,
    palette: Palette, calculator: Calculator, layers: Layers, box: Box, keyboard: Keyboard,
    mouse: Mouse, headphones: Headphones, smartphone: Smartphone, battery: Battery,
    lightbulb: Lightbulb, 'shopping-bag': ShoppingBag, gift: Gift, star: Star, heart: Heart,
};
