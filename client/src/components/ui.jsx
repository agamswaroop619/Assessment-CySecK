import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiChevronUp, FiColumns, FiDownload, FiFileText, FiGrid, FiSearch } from "react-icons/fi";

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

function gridColumnId(col, idx) {
    return String(col?.key ?? col?.header ?? idx);
}

function columnIsSortable(col) {
    if (!col) return false;
    if (col.sortable === false) return false;
    if (col.exportable === false) return false;
    return !!(col.getSortValue || col.getValue || col.key);
}

function columnContributesSearch(col) {
    if (!col || col.excludeFromSearch) return false;
    if (col.exportable === false) return false;
    return !!(col.getValue || col.key);
}

function sortComparableValue(item, col) {
    if (typeof col.getSortValue === "function") return col.getSortValue(item);
    if (typeof col.getValue === "function") return col.getValue(item);
    if (col.key) return item?.[col.key];
    return "";
}

function compareSortValues(a, b, col, dir) {
    const flip = dir === "desc" ? -1 : 1;
    const va = sortComparableValue(a, col);
    const vb = sortComparableValue(b, col);

    let cmp = 0;
    if (typeof va === "number" && typeof vb === "number" && Number.isFinite(va) && Number.isFinite(vb)) {
        cmp = va - vb;
    } else if (typeof va === "number" && Number.isFinite(va)) {
        cmp = -1;
    } else if (typeof vb === "number" && Number.isFinite(vb)) {
        cmp = 1;
    } else {
        cmp = String(va ?? "").localeCompare(String(vb ?? ""), undefined, {
            numeric: true,
            sensitivity: "base"
        });
    }
    return cmp * flip;
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
    getSearchText,
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

    const [searchQuery, setSearchQuery] = useState("");
    const [sortSpec, setSortSpec] = useState({ columnId: null, dir: "asc" });

    const showEmpty = items.length === 0;
    const keyFn = getKey || ((item, idx) => idx);
    const exportColumns = (columns || []).filter((c) => c && c.exportable !== false);
    const fileBase = exportFileName || (header ? String(header) : "grid");

    const getExportCellText = (item, col) => {
        if (col.getValue) return col.getValue(item);
        if (col.key) return item?.[col.key];
        return "";
    };

    const searchColumns = useMemo(
        () => (Array.isArray(columns) ? columns.filter(columnContributesSearch) : []),
        [columns]
    );

    const filteredItems = useMemo(() => {
        if (showEmpty) return [];
        const trimmed = searchQuery.trim().toLowerCase();
        if (!trimmed) return items;
        const words = trimmed.split(/\s+/).filter(Boolean);

        if (typeof getSearchText === "function") {
            return items.filter((item) => {
                const blob = String(getSearchText(item) ?? "").toLowerCase();
                return words.every((w) => blob.includes(w));
            });
        }
        if (!searchColumns.length) return items;
        return items.filter((item) => {
            const blob = searchColumns
                .map((c) => String(getExportCellText(item, c) ?? "").toLowerCase())
                .join(" ");
            return words.every((w) => blob.includes(w));
        });
    }, [items, searchQuery, showEmpty, searchColumns, getSearchText]);

    const activeSortColumn = useMemo(() => {
        if (!sortSpec.columnId || !Array.isArray(columns)) return null;
        const idx = columns.findIndex((c, i) => gridColumnId(c, i) === sortSpec.columnId);
        const col = idx >= 0 ? columns[idx] : null;
        if (!col || !columnIsSortable(col)) return null;
        return col;
    }, [sortSpec.columnId, columns]);

    const displayItems = useMemo(() => {
        if (!activeSortColumn) return filteredItems;
        const next = [...filteredItems];
        next.sort((a, b) => compareSortValues(a, b, activeSortColumn, sortSpec.dir));
        return next;
    }, [filteredItems, activeSortColumn, sortSpec.dir]);

    const noMatches = !showEmpty && filteredItems.length === 0 && searchQuery.trim() !== "";

    const toggleSortColumn = (col, idx) => {
        if (!columnIsSortable(col)) return;
        const id = gridColumnId(col, idx);
        setSortSpec((prev) => {
            if (prev.columnId !== id) return { columnId: id, dir: "asc" };
            if (prev.dir === "asc") return { columnId: id, dir: "desc" };
            return { columnId: null, dir: "asc" };
        });
    };

    const downloadCsv = () => {
        if (!exportColumns.length) return;
        const csv = toCsv(exportColumns, displayItems, getExportCellText);
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
            items: displayItems,
            getCellText: getExportCellText
        });
    };

    return (
        <div className={className}>
            {(header || renderCard || canTable) && (
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0 text-sm font-medium text-slate-700">{header}</div>
                    <div className="flex min-w-0 flex-shrink-0 flex-wrap items-center justify-start gap-x-3 gap-y-2 sm:justify-end">
                        {(canCard || canTable) && (
                            <div className="flex items-center md:gap-2">
                                {canCard && (
                                    <button
                                        type="button"
                                        onClick={() => setViewAndPersist("card")}
                                        title="Cards"
                                        className={`flex items-center rounded-2xl border px-3 py-2 text-sm font-medium transition max-md:px-2.5 md:gap-2 ${
                                            view === "card"
                                                ? "border-violet-300 bg-violet-200 text-violet-800"
                                                : "border-violet-200 bg-slate-50/90 text-slate-600 hover:bg-violet-100/70"
                                        }`}
                                        aria-label="Cards view"
                                        aria-pressed={view === "card"}
                                    >
                                        <FiGrid size={16} aria-hidden />
                                        <span className="hidden md:inline">Cards</span>
                                    </button>
                                )}
                                {canCard && canTable && (
                                    <span className="px-2 text-xs font-light text-slate-300 md:hidden" aria-hidden>
                                        |
                                    </span>
                                )}
                                {canTable && (
                                    <button
                                        type="button"
                                        onClick={() => setViewAndPersist("table")}
                                        title="Table"
                                        className={`flex items-center rounded-2xl border px-3 py-2 text-sm font-medium transition max-md:px-2.5 md:gap-2 ${
                                            view === "table"
                                                ? "border-violet-300 bg-violet-200 text-violet-800"
                                                : "border-violet-200 bg-slate-50/90 text-slate-600 hover:bg-violet-100/70"
                                        }`}
                                        aria-label="Table view"
                                        aria-pressed={view === "table"}
                                    >
                                        <FiColumns size={16} aria-hidden />
                                        <span className="hidden md:inline">Table</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {exportColumns.length > 0 && displayItems.length > 0 && (
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={downloadCsv}
                                    title="Export Excel (CSV)"
                                    aria-label="Export Excel spreadsheet"
                                    className="rounded-2xl border border-violet-200 bg-slate-50/90 p-2.5 text-slate-600 transition hover:bg-violet-100/70"
                                >
                                    <FiDownload size={16} aria-hidden />
                                </button>
                                <span className="px-2 text-xs font-light text-slate-300" aria-hidden>
                                    |
                                </span>
                                <button
                                    type="button"
                                    onClick={downloadPdf}
                                    title="Export PDF"
                                    aria-label="Export PDF"
                                    className="rounded-2xl border border-violet-200 bg-slate-50/90 p-2.5 text-slate-600 transition hover:bg-violet-100/70"
                                >
                                    <FiFileText size={16} aria-hidden />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!showEmpty && (
                <div className="mb-3">
                    <div className="relative">
                        <FiSearch
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            aria-hidden
                        />
                        <Input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search…"
                            className="pl-9"
                            aria-label="Search this list"
                        />
                    </div>
                </div>
            )}

            {showEmpty ? (
                empty || <p className="py-4 text-center text-sm text-slate-500">No items</p>
            ) : noMatches ? (
                <p className="py-4 text-center text-sm text-slate-500">No matching results</p>
            ) : view === "table" ? (
                <div className={tableWrapClassName}>
                    <table className="min-w-full divide-y divide-violet-100">
                        <thead className="bg-violet-50/40">
                            <tr>
                                {columns.map((col, idx) => {
                                    const sortable = columnIsSortable(col);
                                    const cid = gridColumnId(col, idx);
                                    const active = sortSpec.columnId === cid;
                                    return (
                                        <th
                                            key={col.key ?? idx}
                                            className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 ${
                                                col.headerClassName || ""
                                            }`}
                                            aria-sort={
                                                !sortable
                                                    ? undefined
                                                    : !active
                                                      ? "none"
                                                      : sortSpec.dir === "asc"
                                                        ? "ascending"
                                                        : "descending"
                                            }
                                        >
                                            {sortable ? (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSortColumn(col, idx)}
                                                    className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-lg text-left font-[inherit] tracking-[inherit] text-slate-600 outline-none transition hover:text-violet-700 focus-visible:ring-2 focus-visible:ring-violet-200"
                                                >
                                                    <span className="min-w-0 truncate">{col.header}</span>
                                                    {active &&
                                                        (sortSpec.dir === "asc" ? (
                                                            <FiChevronUp
                                                                className="shrink-0 text-violet-600"
                                                                size={14}
                                                                aria-hidden
                                                            />
                                                        ) : (
                                                            <FiChevronDown
                                                                className="shrink-0 text-violet-600"
                                                                size={14}
                                                                aria-hidden
                                                            />
                                                        ))}
                                                </button>
                                            ) : (
                                                col.header
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-violet-100 bg-slate-50/60">
                            {displayItems.map((item, rowIdx) => (
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
                    {displayItems.map((item, idx) => (
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
