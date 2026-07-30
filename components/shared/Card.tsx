import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  eyebrow?: string;
  className?: string;
  style?: React.CSSProperties;
}

// White card with 1px beige border + hover shadow, matching the brand system.
export default function Card({ children, eyebrow, className = "", style }: Props) {
  return (
    <div className={`card ${className}`} style={style}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      {children}
    </div>
  );
}
