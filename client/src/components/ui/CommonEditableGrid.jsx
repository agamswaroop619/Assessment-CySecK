export function CommonEditableGrid({
    rows = [],
    columns = [],
    getKey,
    header,
    right,
    empty,
    className = "",
    tableWrapClassName = "overflow-x-auto rounded-2xl border border-violet-100 bg-slate-50/70",
    editable = true,
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
