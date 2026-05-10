/** CSV / downloadable export helpers shared by grids and reports. */

export function escapeCsvCell(value) {
    const str = value === null || value === undefined ? "" : String(value);
    const needsQuotes = /[",\n\r]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
}

export function toCsv(columns, items, getCellValue) {
    const headerRow = columns.map((c) => escapeCsvCell(c.header ?? "")).join(",");
    const rows = items.map((item) =>
        columns.map((c) => escapeCsvCell(getCellValue(item, c))).join(",")
    );
    return [headerRow, ...rows].join("\n");
}

export function downloadBlob({ filename, mime, content }) {
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

export function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function exportAsPrintableTable({ title, columns, items, getCellText }) {
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
