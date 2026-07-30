interface Props {
  variant: "paid" | "pending" | "overdue" | "neutral";
  children: React.ReactNode;
}

export default function Chip({ variant, children }: Props) {
  return <span className={`chip ${variant}`}>{children}</span>;
}
