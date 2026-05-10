export function SoftButton({ children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={`rounded-2xl border border-violet-200 bg-violet-100/70 px-4 py-2.5 text-sm font-medium text-violet-800 transition hover:bg-violet-200/80 ${className}`}
        >
            {children}
        </button>
    );
}
