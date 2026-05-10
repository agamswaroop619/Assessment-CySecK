export function Card({ children, className = "", ...props }) {
    return (
        <div
            {...props}
            className={`rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm backdrop-blur-sm ${className}`}
        >
            {children}
        </div>
    );
}
