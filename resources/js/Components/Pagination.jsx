import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Page-at-a-time helper for long tables.
 *
 * Rows outside the current page get `hidden print:table-row`, so the screen stays light
 * but "Ekspor PDF" (print) still shows every row.
 */
export function usePagination(total, size = 10) {
    const [page, setPage] = useState(1);
    const pages = Math.max(1, Math.ceil(total / size));

    // If the list gets shorter (another period), never stay on a page that no longer exists
    useEffect(() => {
        if (page > pages) setPage(pages);
    }, [page, pages]);

    return {
        page,
        pages,
        size,
        total,
        setPage,
        rowClass: (index) => (Math.floor(index / size) + 1 === page ? '' : 'hidden print:table-row'),
    };
}

export default function Pagination({ pager }) {
    const { page, pages, size, total, setPage } = pager;

    if (total <= size) return null;

    const from = (page - 1) * size + 1;
    const to = Math.min(page * size, total);
    const button =
        'flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';

    return (
        <nav className="mt-4 flex flex-wrap items-center justify-between gap-3 print:hidden" aria-label="Halaman">
            <p className="text-xs text-[#4B5563] dark:text-slate-400">
                Menampilkan {from}–{to} dari {total}
            </p>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    aria-label="Halaman sebelumnya"
                    className={`${button} border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800`}
                >
                    <ChevronLeft size={16} aria-hidden="true" />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
                    .map((n, i, all) => (
                        <span key={n} className="flex items-center gap-1">
                            {i > 0 && n - all[i - 1] > 1 && <span className="px-1 text-[#6B7280]">…</span>}
                            <button
                                type="button"
                                onClick={() => setPage(n)}
                                aria-current={n === page ? 'page' : undefined}
                                className={`${button} ${
                                    n === page
                                        ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white dark:border-blue-600 dark:bg-blue-600'
                                        : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                            >
                                {n}
                            </button>
                        </span>
                    ))}
                <button
                    type="button"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pages}
                    aria-label="Halaman berikutnya"
                    className={`${button} border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800`}
                >
                    <ChevronRight size={16} aria-hidden="true" />
                </button>
            </div>
        </nav>
    );
}
