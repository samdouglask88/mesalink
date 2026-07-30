"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-urban-primary focus-visible:ring-offset-2 focus-visible:ring-offset-urban-bg " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-urban-primary text-urban-bg hover:bg-urban-primary-600 shadow-glow-sm hover:shadow-glow",
  secondary:
    "border border-urban-line bg-urban-surface/60 text-urban-light hover:border-urban-primary hover:text-urban-primary",
  ghost: "text-urban-muted hover:text-urban-light",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
