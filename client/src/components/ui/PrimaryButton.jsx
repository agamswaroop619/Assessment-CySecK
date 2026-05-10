export function PrimaryButton({ children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={`rounded-2xl bg-violet-200 px-4 py-2.5 text-sm font-medium text-violet-800 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {children}
        </button>
    );
}
