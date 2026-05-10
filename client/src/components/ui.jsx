export function AppShell({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-violet-50 text-slate-700">
            {children}
        </div>
    );
}

export function PageWrap({ children, max = "max-w-4xl" }) {
    return (
        <div className={`mx-auto w-full ${max} px-4 py-8 sm:px-6 sm:py-10`}>
            {children}
        </div>
    );
}

export function PageHeader({ title, right }) {
    return (
        <div className="mb-8 flex items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800">{title}</h1>
            {right}
        </div>
    );
}

export function Card({ children, className = "", ...props }) {
    return (
        <div
            {...props}
            className={`rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm ${className}`}
        >
            {children}
        </div>
    );
}

export function Input(props) {
    return (
        <input
            {...props}
            className={`w-full rounded-2xl border border-violet-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 ${props.className || ""}`}
        />
    );
}

export function Select(props) {
    return (
        <select
            {...props}
            className={`w-full rounded-2xl border border-violet-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 ${props.className || ""}`}
        />
    );
}

export function PrimaryButton({ children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={`rounded-2xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {children}
        </button>
    );
}

export function SoftButton({ children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={`rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 transition hover:bg-violet-100 ${className}`}
        >
            {children}
        </button>
    );
}

export function Pill({ active = false, children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                    ? "border-violet-300 bg-violet-500 text-white"
                    : "border-violet-200 bg-white text-slate-600 hover:bg-violet-50"
            } ${className}`}
        >
            {children}
        </button>
    );
}
