import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={["badge", "badge--" + variant, className ?? ""].join(" ").trim()}
      data-variant={variant}
      {...props}
    >
      {children}
    </span>
  );
}
