export function Pill({ active = false, children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                    ? "border-violet-300 bg-violet-200 text-violet-800"
                    : "border-violet-200 bg-slate-50/90 text-slate-600 hover:bg-violet-100/70"
            } ${className}`}
        >
            {children}
        </button>
    );
}
