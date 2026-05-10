/** Shared column semantics for searchable / sortable data grids. */

export function gridColumnId(col, idx) {
    return String(col?.key ?? col?.header ?? idx);
}

export function columnIsSortable(col) {
    if (!col) return false;
    if (col.sortable === false) return false;
    if (col.exportable === false) return false;
    return !!(col.getSortValue || col.getValue || col.key);
}

export function columnContributesSearch(col) {
    if (!col || col.excludeFromSearch) return false;
    if (col.exportable === false) return false;
    return !!(col.getValue || col.key);
}

export function sortComparableValue(item, col) {
    if (typeof col.getSortValue === "function") return col.getSortValue(item);
    if (typeof col.getValue === "function") return col.getValue(item);
    if (col.key) return item?.[col.key];
    return "";
}

export function compareSortValues(a, b, col, dir) {
    const flip = dir === "desc" ? -1 : 1;
    const va = sortComparableValue(a, col);
    const vb = sortComparableValue(b, col);

    let cmp = 0;
    if (
        typeof va === "number" &&
        typeof vb === "number" &&
        Number.isFinite(va) &&
        Number.isFinite(vb)
    ) {
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
