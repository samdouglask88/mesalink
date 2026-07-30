import { Crown } from "lucide-react";
import { cn } from "@/lib/cn";

// Lockup Urban Burger: coroa street + lettering condensado.
// Reproduz a vibe do logo (grafite) em SVG/tipografia, 100% escalável.
// - compact: só "URBAN" (sem "BURGER").
// - iconOnly: só a marca (coroa), sem texto — ideal p/ avatares.
export function Logo({
  className,
  compact = false,
  iconOnly = false,
}: {
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
}) {
  if (iconOnly) {
    return (
      <Crown
        className={cn("text-urban-primary", className ?? "h-8 w-8")}
        fill="currentColor"
        strokeWidth={1.5}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <Crown
        className="h-7 w-7 shrink-0 text-urban-primary"
        fill="currentColor"
        strokeWidth={1.5}
      />
      <span className="display-title leading-none">
        <span className="block text-lg tracking-wide text-urban-light">
          URBAN
        </span>
        {!compact && (
          <span className="block text-sm tracking-[0.22em] text-urban-primary">
            BURGER
          </span>
        )}
      </span>
    </span>
  );
}
