import { useMemo, useState } from "react";
import {
    FiChevronDown,
    FiChevronUp,
    FiColumns,
    FiDownload,
    FiFileText,
    FiGrid,
    FiSearch
} from "react-icons/fi";
import {
    columnContributesSearch,
    columnIsSortable,
    compareSortValues,
    gridColumnId
} from "../../shared/gridColumnUtils.js";
import { downloadBlob, exportAsPrintableTable, toCsv } from "../../shared/exportTable.js";
import { Input } from "./Input.jsx";

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
    cardClassName = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    tableWrapClassName = "overflow-x-auto rounded-2xl border border-violet-100 bg-slate-50/70",
    className = "",
    getSearchText,
    /** When false, keeps columns for export/search but hides table view toggle and table rendering. */
    showTableView = true,
}) {
    const canCard = !!renderCard;
    const canTable = showTableView && Array.isArray(columns) && columns.length > 0;
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

    /** Never render table UI when table view is disabled (e.g. persisted "table"). */
    const contentView = canTable ? view : "card";

    const showViewSwitcher = canCard && canTable;

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
                        {showViewSwitcher && (
                            <div className="flex items-center md:gap-2">
                                {canCard && (
                                    <button
                                        type="button"
                                        onClick={() => setViewAndPersist("card")}
                                        title="Cards"
                                        className={`flex items-center rounded-2xl border px-3 py-2 text-sm font-medium transition max-md:px-2.5 md:gap-2 ${
                                            contentView === "card"
                                                ? "border-violet-300 bg-violet-200 text-violet-800"
                                                : "border-violet-200 bg-slate-50/90 text-slate-600 hover:bg-violet-100/70"
                                        }`}
                                        aria-label="Cards view"
                                        aria-pressed={contentView === "card"}
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
                                            contentView === "table"
                                                ? "border-violet-300 bg-violet-200 text-violet-800"
                                                : "border-violet-200 bg-slate-50/90 text-slate-600 hover:bg-violet-100/70"
                                        }`}
                                        aria-label="Table view"
                                        aria-pressed={contentView === "table"}
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
            ) : contentView === "table" ? (
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
            ) : contentView === "card" ? (
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
