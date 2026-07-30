// Helpers for mapping a Google Sheet to Supabase rows BY COLUMN NAME instead of
// by position — so a sheet's column order can change (and English/Portuguese
// headers can be mixed) without breaking a sync.

// Normalize a header/label for matching: lowercase, strip accents, collapse
// whitespace/punctuation to single spaces.
export function normKey(s: string): string {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // drop accents (ç, á, ã, …)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Build a { normalizedHeaderName -> columnIndex } map from a header row.
export function headerIndex(header: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  header.forEach((h, i) => {
    const key = normKey(h);
    if (key && !(key in map)) map[key] = i;
  });
  return map;
}

// Read a cell from a row by trying each candidate column name in order.
export function pick(
  row: string[],
  idx: Record<string, number>,
  names: string[]
): string | undefined {
  for (const name of names) {
    const i = idx[normKey(name)];
    if (i !== undefined && row[i] !== undefined && row[i] !== "") {
      return String(row[i]);
    }
  }
  return undefined;
}

// Coerce a currency-ish cell ("€ 2.784,00", "1,120", "R$ 500") to a number.
export function num(v: string | undefined): number | null {
  if (v === undefined || v === null || v === "") return null;
  let s = String(v).replace(/[^0-9.,-]/g, "");
  // If both separators appear, assume the last one is the decimal separator.
  if (s.includes(",") && s.includes(".")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (s.includes(",")) {
    // Only commas — treat as decimal separator (European style).
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  return isFinite(n) ? n : null;
}

// Trim a string cell, returning undefined when empty.
export function str(v: string | undefined): string | undefined {
  if (v === undefined || v === null) return undefined;
  const t = String(v).trim();
  return t === "" ? undefined : t;
}
