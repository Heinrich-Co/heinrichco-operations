import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  numeric?: boolean;
  primary?: boolean; // becomes the card title on mobile
  render?: (row: T) => ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, i: number) => string | number;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
}

// Renders a table on desktop and a stacked card list on mobile — so data never
// needs horizontal scroll on a phone (Camila between meetings).
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyLabel = "No data yet — sync will populate this.",
}: Props<T>) {
  if (rows.length === 0) {
    return <div className="note">{emptyLabel}</div>;
  }

  const cell = (col: Column<T>, row: T): ReactNode =>
    col.render ? col.render(row) : (row as Record<string, ReactNode>)[col.key];

  return (
    <>
      <div className="dt-table scroll-x">
        <table className="hco">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.numeric ? "tr-num" : ""}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={c.numeric ? "tr-num" : ""}
                    style={c.primary ? { fontWeight: 500, color: "var(--black)" } : undefined}
                  >
                    {cell(c, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dt-cards">
        {rows.map((row, i) => (
          <div
            className="dt-card"
            key={rowKey(row, i)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            style={onRowClick ? { cursor: "pointer" } : undefined}
          >
            {columns
              .filter((c) => c.primary)
              .map((c) => (
                <div className="dt-primary" key={c.key}>
                  {cell(c, row)}
                </div>
              ))}
            {columns
              .filter((c) => !c.primary)
              .map((c) => (
                <div className="dt-row" key={c.key}>
                  <span className="dt-k">{c.label}</span>
                  <span className="dt-v">{cell(c, row)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}
