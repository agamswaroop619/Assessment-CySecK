import * as XLSX from "xlsx";

export const ONBOARDING_ALLOWED_ROLES = ["admin", "hr", "manager", "employee"];

export function normalizeOnboardingRow(input) {
    const name = String(input?.name ?? "").trim();
    const role = String(input?.role ?? "").trim().toLowerCase();
    const dept = String(input?.dept ?? "").trim();
    const pinRaw = input?.pin ?? "";
    const pinStr = String(pinRaw).trim();
    const pin = pinStr === "" ? NaN : Number(pinStr);

    return { name, pin, role, dept };
}

export function parseOnboardingCsvText(text) {
    return String(text ?? "")
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((line) => {
            const [name = "", pin = "", role = "", dept = ""] = line.split(",");
            return normalizeOnboardingRow({ name, pin, role, dept });
        });
}

function extractByHeaderMap(row) {
    const map = {};
    Object.entries(row || {}).forEach(([k, v]) => {
        const key = String(k ?? "").trim().toLowerCase();
        map[key] = v;
    });
    return normalizeOnboardingRow({
        name: map.name,
        pin: map.pin,
        role: map.role,
        dept: map.dept
    });
}

export async function parseOnboardingExcelFile(file) {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheetName = wb.SheetNames?.[0];
    if (!sheetName) return [];
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
    return rows
        .map(extractByHeaderMap)
        .filter(r => r.name || String(r.pin ?? "").trim() || r.role || r.dept);
}

export function downloadOnboardingTemplate() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        ["name", "pin", "role", "dept"],
        ["Jane Doe", 123456, "employee", "Engineering"]
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "users");

    const rolesWs = XLSX.utils.aoa_to_sheet([
        ["allowed_roles"],
        ...ONBOARDING_ALLOWED_ROLES.map(r => [r])
    ]);
    XLSX.utils.book_append_sheet(wb, rolesWs, "roles");

    const bytes = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "onboarding_template.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
