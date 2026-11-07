import { useTheme } from '@/Hooks/useTheme';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900 active:scale-90 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white ${className}`}
        >
            {isDark ? (
                <Sun size={17} className="text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" aria-hidden="true" />
            ) : (
                <Moon size={17} className="text-gray-600 transition-transform duration-200 -rotate-12 hover:rotate-0 dark:text-gray-300" aria-hidden="true" />
            )}
        </button>
    );
}
