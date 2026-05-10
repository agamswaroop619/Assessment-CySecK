/**
 * Human name title case: collapse whitespace, capitalize each word,
 * support hyphenated parts (e.g. "mary-jane smith" → "Mary-Jane Smith").
 */
export function toTitleCaseName(raw) {
    const s = String(raw ?? "")
        .trim()
        .replace(/\s+/g, " ");
    if (!s) return "";
    return s
        .split(" ")
        .map((word) =>
            word
                .split("-")
                .map((part) =>
                    part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""
                )
                .join("-")
        )
        .join(" ");
}
