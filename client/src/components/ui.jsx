import { useState } from "react";
import { FiGrid, FiList } from "react-icons/fi";

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
            <div className="flex items-center gap-3">
                <img
                    src="/CySeck.png"
                    alt="CySecK logo"
                    className="h-10 w-10 rounded-lg object-cover"
                />
                <h1 className="text-3xl font-semibold tracking-tight text-slate-800">{title}</h1>
            </div>
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
            className={`rounded-2xl bg-violet-200 px-4 py-2.5 text-sm font-medium text-violet-800 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {children}
        </button>
    );
}

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

export function Pill({ active = false, children, className = "", ...props }) {
    return (
        <button
            {...props}
            className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                    ? "border-violet-300 bg-violet-200 text-violet-800"
                    : "border-violet-200 bg-white/90 text-slate-600 hover:bg-violet-100/70"
            } ${className}`}
        >
            {children}
        </button>
    );
}

export function CommonGrid({
    items = [],
    getKey,
    renderCard,
    renderRow,
    empty,
    header,
    storageKey,
    defaultView = "list",
    listClassName = "space-y-2",
    cardClassName = "grid gap-3 sm:grid-cols-2",
    className = "",
}) {
    const [view, setView] = useState(() => {
        if (!storageKey) return defaultView;
        try {
            return localStorage.getItem(storageKey) || defaultView;
        } catch {
            return defaultView;
        }
    });

    const setViewAndPersist = (next) => {
        setView(next);
        if (!storageKey) return;
        try {
            localStorage.setItem(storageKey, next);
        } catch {
            return;
        }
    };

    const showEmpty = items.length === 0;
    const keyFn = getKey || ((item, idx) => idx);

    return (
        <div className={className}>
            {(header || renderRow || renderCard) && (
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-700">{header}</div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setViewAndPersist("list")}
                            className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                                view === "list"
                                    ? "border-violet-300 bg-violet-200 text-violet-800"
                                    : "border-violet-200 bg-white/90 text-slate-600 hover:bg-violet-100/70"
                            }`}
                            aria-pressed={view === "list"}
                        >
                            <FiList size={16} />
                            List
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewAndPersist("card")}
                            className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                                view === "card"
                                    ? "border-violet-300 bg-violet-200 text-violet-800"
                                    : "border-violet-200 bg-white/90 text-slate-600 hover:bg-violet-100/70"
                            }`}
                            aria-pressed={view === "card"}
                        >
                            <FiGrid size={16} />
                            Cards
                        </button>
                    </div>
                </div>
            )}

            {showEmpty ? (
                empty || <p className="py-4 text-center text-sm text-slate-500">No items</p>
            ) : view === "card" ? (
                <div className={cardClassName}>
                    {items.map((item, idx) => (
                        <div key={keyFn(item, idx)}>
                            {renderCard ? renderCard(item, idx) : null}
                        </div>
                    ))}
                </div>
            ) : (
                <div className={listClassName}>
                    {items.map((item, idx) => (
                        <div key={keyFn(item, idx)}>
                            {renderRow ? renderRow(item, idx) : renderCard ? renderCard(item, idx) : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
