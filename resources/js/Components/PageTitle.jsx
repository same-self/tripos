/** The page's <h1> with a small colored icon in front of it. Put the subtitle <p> right after it. */
export default function PageTitle({ icon: Icon, children }) {
    return (
        <h1 className="flex items-center gap-3 text-[22px] font-bold">
            {Icon && (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#1D4ED8]">
                    <Icon size={22} strokeWidth={2} aria-hidden="true" />
                </span>
            )}
            {children}
        </h1>
    );
}
