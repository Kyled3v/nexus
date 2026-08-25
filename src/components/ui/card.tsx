import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ className, padding = "md", children, ...props }: CardProps) {
  return (
    <div className={["card", padding !== "md" ? "card--padding-" + padding : "", className ?? ""].join(" ").trim()} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={["card__header", className ?? ""].join(" ").trim()} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={["card__title", className ?? ""].join(" ").trim()} {...props}>{children}</h3>;
}
