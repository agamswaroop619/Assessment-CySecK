import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiColumns, FiDownload, FiGrid } from "react-icons/fi";

const MotionDiv = motion.div;

function escapeCsvCell(value) {
    const str = value === null || value === undefined ? "" : String(value);
    const needsQuotes = /[",\n\r]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
}

function toCsv(columns, items, getCellValue) {
    const headerRow = columns.map((c) => escapeCsvCell(c.header ?? "")).join(",");
    const rows = items.map((item) =>
        columns.map((c) => escapeCsvCell(getCellValue(item, c))).join(",")
    );
    return [headerRow, ...rows].join("\n");
}

function downloadBlob({ filename, mime, content }) {
    if (typeof window === "undefined") return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function exportAsPrintableTable({ title, columns, items, getCellText }) {
    if (typeof window === "undefined") return;
    const tableHead = `<tr>${columns
        .map((c) => `<th>${escapeHtml(String(c.header ?? ""))}</th>`)
        .join("")}</tr>`;
    const tableBody = items
        .map((item) => {
            const cells = columns
                .map((c) => `<td>${escapeHtml(String(getCellText(item, c) ?? ""))}</td>`)
                .join("");
            return `<tr>${cells}</tr>`;
        })
        .join("");

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
body{font-family:"Plus Jakarta Sans",ui-sans-serif,system-ui,sans-serif; color:#1f242d; padding:24px;}
h1{font-size:18px; margin:0 0 12px;}
table{width:100%; border-collapse:collapse; font-size:12px;}
th,td{border:1px solid #efdd98; padding:8px; text-align:left; vertical-align:top;}
th{background:#fff4c7; font-weight:600;}
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<table>
<thead>${tableHead}</thead>
<tbody>${tableBody}</tbody>
</table>
</body>
</html>`;

    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function AppShell({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-violet-50 text-slate-700">
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

export function Avatar({ src, alt = "", size = 32, className = "" }) {
    return (
        <img
            src={src}
            alt={alt}
            className={`shrink-0 rounded-full object-cover ring-2 ring-slate-200/80 ${className}`}
            style={{ width: size, height: size }}
            loading="lazy"
        />
    );
}

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

export function Input(props) {
    return (
        <input
            {...props}
            className={`w-full rounded-2xl border border-violet-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 ${props.className || ""}`}
        />
    );
}

export function Select(props) {
    return (
        <select
            {...props}
            className={`w-full rounded-2xl border border-violet-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 ${props.className || ""}`}
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
                    : "border-violet-200 bg-slate-50/90 text-slate-600 hover:bg-violet-100/70"
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
    columns,
    exportFileName,
    empty,
    header,
    storageKey,
    defaultView = "card",
    cardClassName = "grid gap-3 sm:grid-cols-2",
    tableWrapClassName = "overflow-x-auto rounded-2xl border border-violet-100 bg-slate-50/70",
    className = "",
}) {
    const canCard = !!renderCard;
    const canTable = Array.isArray(columns) && columns.length > 0;
    const viewOptions = [
        ...(canCard ? ["card"] : []),
        ...(canTable ? ["table"] : []),
    ];

    const resolveView = (value) => {
        if (viewOptions.includes(value)) return value;
        if (viewOptions.includes(defaultView)) return defaultView;
        return viewOptions[0] || "card";
    };

    const [view, setView] = useState(() => {
        const persisted = (() => {
            if (!storageKey) return null;
            try {
                return localStorage.getItem(storageKey);
            } catch {
                return null;
            }
        })();
        return resolveView(persisted || defaultView);
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
    const exportColumns = (columns || []).filter((c) => c && c.exportable !== false);
    const fileBase = exportFileName || (header ? String(header) : "grid");

    const getExportCellText = (item, col) => {
        if (col.getValue) return col.getValue(item);
        if (col.key) return item?.[col.key];
        return "";
    };

    const downloadCsv = () => {
        if (!exportColumns.length) return;
        const csv = toCsv(exportColumns, items, getExportCellText);
        downloadBlob({
            filename: `${fileBase}.csv`,
            mime: "text/csv;charset=utf-8",
            content: csv
        });
    };

    const downloadPdf = () => {
        if (!exportColumns.length) return;
        exportAsPrintableTable({
            title: fileBase,
            columns: exportColumns,
            items,
            getCellText: getExportCellText
        });
    };

    return (
        <div className={className}>
            {(header || renderCard || canTable) && (
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-700">{header}</div>
                    <div className="flex items-center gap-2">
                        {canCard && (
                            <button
                                type="button"
                                onClick={() => setViewAndPersist("card")}
                                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                                    view === "card"
                                        ? "border-violet-300 bg-violet-200 text-violet-800"
                                        : "border-violet-200 bg-slate-50/90 text-slate-600 hover:bg-violet-100/70"
                                }`}
                                aria-pressed={view === "card"}
                            >
                                <FiGrid size={16} />
                                Cards
                            </button>
                        )}
                        {canTable && (
                            <button
                                type="button"
                                onClick={() => setViewAndPersist("table")}
                                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                                    view === "table"
                                        ? "border-violet-300 bg-violet-200 text-violet-800"
                                        : "border-violet-200 bg-slate-50/90 text-slate-600 hover:bg-violet-100/70"
                                }`}
                                aria-pressed={view === "table"}
                            >
                                <FiColumns size={16} />
                                Table
                            </button>
                        )}

                        {exportColumns.length > 0 && !showEmpty && (
                            <>
                                <button
                                    type="button"
                                    onClick={downloadCsv}
                                    className="flex items-center gap-2 rounded-2xl border border-violet-200 bg-slate-50/90 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-violet-100/70"
                                >
                                    <FiDownload size={16} />
                                    Excel
                                </button>
                                <button
                                    type="button"
                                    onClick={downloadPdf}
                                    className="flex items-center gap-2 rounded-2xl border border-violet-200 bg-slate-50/90 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-violet-100/70"
                                >
                                    <FiDownload size={16} />
                                    PDF
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showEmpty ? (
                empty || <p className="py-4 text-center text-sm text-slate-500">No items</p>
            ) : view === "table" ? (
                <div className={tableWrapClassName}>
                    <table className="min-w-full divide-y divide-violet-100">
                        <thead className="bg-violet-50/40">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th
                                        key={col.key ?? idx}
                                        className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 ${
                                            col.headerClassName || ""
                                        }`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-violet-100 bg-slate-50/60">
                            {items.map((item, rowIdx) => (
                                <tr key={keyFn(item, rowIdx)} className="hover:bg-violet-50/30">
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={col.key ?? colIdx}
                                            className={`px-3 py-2 text-sm text-slate-700 ${col.className || ""}`}
                                        >
                                            {col.render ? col.render(item, rowIdx) : getExportCellText(item, col)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : view === "card" ? (
                <div className={cardClassName}>
                    {items.map((item, idx) => (
                        <div key={keyFn(item, idx)}>
                            {renderCard ? renderCard(item, idx) : null}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export function CommonEditableGrid({
    rows = [],
    columns = [],
    getKey,
    header,
    right,
    empty,
    className = "",
    tableWrapClassName = "overflow-x-auto rounded-2xl border border-violet-100 bg-slate-50/70",
    editable = true
}) {
    const showEmpty = rows.length === 0;
    const keyFn = getKey || ((row, idx) => idx);

    return (
        <div className={className}>
            {(header || right) && (
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-700">{header}</div>
                    {right}
                </div>
            )}

            {showEmpty ? (
                empty || <p className="py-4 text-center text-sm text-slate-500">No items</p>
            ) : (
                <div className={tableWrapClassName}>
                    <table className="min-w-full divide-y divide-violet-100">
                        <thead className="bg-violet-50/40">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th
                                        key={col.key ?? idx}
                                        className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 ${
                                            col.headerClassName || ""
                                        }`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-violet-100 bg-slate-50/60">
                            {rows.map((row, rowIdx) => (
                                <tr key={keyFn(row, rowIdx)} className="hover:bg-violet-50/30">
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={col.key ?? colIdx}
                                            className={`px-3 py-2 text-sm text-slate-700 ${col.className || ""}`}
                                        >
                                            {editable && col.renderEdit
                                                ? col.renderEdit(row, rowIdx)
                                                : col.render
                                                  ? col.render(row, rowIdx)
                                                  : col.key
                                                    ? row?.[col.key]
                                                    : ""}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export function AnimatedPanel({
    activeKey,
    children,
    className = "",
    initial = { opacity: 0, y: 8 },
    animate = { opacity: 1, y: 0 },
    exit = { opacity: 0, y: -8 },
    transition = { duration: 0.18 }
}) {
    return (
        <AnimatePresence mode="wait">
            <MotionDiv
                key={String(activeKey)}
                initial={initial}
                animate={animate}
                exit={exit}
                transition={transition}
                className={className}
            >
                {children}
            </MotionDiv>
        </AnimatePresence>
    );
}

export function SideNav({
    items = [],
    activeKey,
    onChange,
    className = ""
}) {
    return (
        <div className={`rounded-3xl border border-white/60 bg-white/80 p-3 shadow-sm backdrop-blur-sm ${className}`}>
            <div className="space-y-1.5">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = item.key === activeKey;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => onChange?.(item.key)}
                            className={`relative flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                                active ? "text-violet-800" : "text-slate-600 hover:bg-violet-50/70"
                            }`}
                            aria-current={active ? "page" : undefined}
                        >
                            {active && (
                                <MotionDiv
                                    layoutId="sideNavActive"
                                    className="absolute inset-0 rounded-2xl bg-violet-100/80"
                                    transition={{ type: "spring", stiffness: 520, damping: 42 }}
                                />
                            )}
                            <span className="relative flex items-center gap-3">
                                {Icon ? <Icon size={18} /> : null}
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function BottomNav({
    items = [],
    activeKey,
    onChange,
    className = ""
}) {
    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-40 border-t border-violet-100 bg-white/80 backdrop-blur-sm ${className}`}
        >
            <div className="mx-auto flex max-w-4xl items-stretch justify-around gap-2 px-3 py-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = item.key === activeKey;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => onChange?.(item.key)}
                            className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                                active ? "text-violet-800" : "text-slate-500"
                            }`}
                            aria-current={active ? "page" : undefined}
                        >
                            {active && (
                                <MotionDiv
                                    layoutId="bottomNavActive"
                                    className="absolute inset-0 rounded-2xl bg-violet-100/80"
                                    transition={{ type: "spring", stiffness: 520, damping: 42 }}
                                />
                            )}
                            <span className="relative flex flex-col items-center gap-1">
                                {Icon ? <Icon size={18} /> : null}
                                <span>{item.label}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
