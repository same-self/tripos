import { useEffect, useState } from 'react';

export function useTheme() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        setIsDark(root.classList.contains('dark'));

        const observer = new MutationObserver(() => {
            setIsDark(root.classList.contains('dark'));
        });
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const root = document.documentElement;
        const nextDark = !root.classList.contains('dark');
        if (nextDark) {
            root.classList.add('dark');
            localStorage.setItem('tripos_theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('tripos_theme', 'light');
        }
        setIsDark(nextDark);
    };

    return { isDark, toggleTheme };
}
