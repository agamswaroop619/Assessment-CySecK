import { toTitleCaseName } from "./formatName.js";

/** Ensure each employee has `password` (migrate legacy `pin`) and title-cased name. */
export function normalizeStoredEmp(raw) {
    if (!raw || typeof raw !== "object") return raw;
    const pin = raw.pin;
    const { pin: _drop, ...rest } = raw;
    const hasPassword =
        rest.password !== undefined &&
        rest.password !== null &&
        String(rest.password).trim() !== "";
    const password = hasPassword
        ? rest.password
        : pin !== undefined && pin !== null && String(pin).trim() !== ""
          ? pin
          : rest.password;

    return {
        ...rest,
        name: toTitleCaseName(rest.name ?? ""),
        password
    };
}
