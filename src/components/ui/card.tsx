import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };

export function Card({ className, padding = "md", children, ...props }: CardProps) {
  return (
    <div className={cn("bg-card border border-base rounded-xl shadow-card", paddingMap[padding], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between mb-4", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold text-primary", className)} {...props}>{children}</h3>;
}
