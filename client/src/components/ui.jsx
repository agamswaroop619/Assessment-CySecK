import { useState } from "react";
import { FiColumns, FiDownload, FiGrid, FiList } from "react-icons/fi";

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
body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; color:#0f172a; padding:24px;}
h1{font-size:18px; margin:0 0 12px;}
table{width:100%; border-collapse:collapse; font-size:12px;}
th,td{border:1px solid #e2e8f0; padding:8px; text-align:left; vertical-align:top;}
th{background:#f8fafc; font-weight:600;}
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
    columns,
    exportFileName,
    empty,
    header,
    storageKey,
    defaultView = "list",
    listClassName = "space-y-2",
    cardClassName = "grid gap-3 sm:grid-cols-2",
    tableWrapClassName = "overflow-x-auto rounded-2xl border border-violet-100 bg-white",
    className = "",
}) {
    const canList = !!(renderRow || renderCard);
    const canCard = !!renderCard;
    const canTable = Array.isArray(columns) && columns.length > 0;
    const viewOptions = [
        ...(canList ? ["list"] : []),
        ...(canCard ? ["card"] : []),
        ...(canTable ? ["table"] : []),
    ];

    const resolveView = (value) => {
        if (viewOptions.includes(value)) return value;
        if (viewOptions.includes(defaultView)) return defaultView;
        return viewOptions[0] || "list";
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
            {(header || renderRow || renderCard || canTable) && (
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-700">{header}</div>
                    <div className="flex items-center gap-2">
                        {canList && (
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
                        )}
                        {canCard && (
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
                        )}
                        {canTable && (
                            <button
                                type="button"
                                onClick={() => setViewAndPersist("table")}
                                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                                    view === "table"
                                        ? "border-violet-300 bg-violet-200 text-violet-800"
                                        : "border-violet-200 bg-white/90 text-slate-600 hover:bg-violet-100/70"
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
                                    className="flex items-center gap-2 rounded-2xl border border-violet-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-violet-100/70"
                                >
                                    <FiDownload size={16} />
                                    Excel
                                </button>
                                <button
                                    type="button"
                                    onClick={downloadPdf}
                                    className="flex items-center gap-2 rounded-2xl border border-violet-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-violet-100/70"
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
                        <tbody className="divide-y divide-violet-100 bg-white">
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
