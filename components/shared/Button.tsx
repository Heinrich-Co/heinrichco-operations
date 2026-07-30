import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "green";
  size?: "md" | "sm";
}

// Black bg + green text primary; ghost and green variants match the prototype.
export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Props) {
  const v = variant === "ghost" ? "ghost" : variant === "green" ? "green" : "";
  const s = size === "sm" ? "sm" : "";
  return (
    <button className={`btn ${v} ${s} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
