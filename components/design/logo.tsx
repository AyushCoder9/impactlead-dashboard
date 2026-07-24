import { cn } from "@/lib/utils";

/**
 * LeadDesk mark — an "L" stencil-cut out of a solid rounded square.
 * Deliberately not a wordmark or a literal icon (inbox/checkmark/etc);
 * ties back to the same "L" nose motif used in the aurora character
 * (components/design/aurora-character.tsx) as a recurring brand shape.
 * Uses evenodd fill so the "L" is a true cutout — the background shows
 * through it — rather than a separate shape drawn on top.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground", className)}
      role="img"
      aria-label="LeadDesk"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 4C5.79086 4 4 5.79086 4 8V32C4 34.2091 5.79086 36 8 36H32C34.2091 36 36 34.2091 36 32V8C36 5.79086 34.2091 4 32 4H8ZM14 11C13.4477 11 13 11.4477 13 12V26C13 26.5523 13.4477 27 14 27H27C27.5523 27 28 26.5523 28 26V23C28 22.4477 27.5523 22 27 22H19C18.4477 22 18 21.5523 18 21V12C18 11.4477 17.5523 11 17 11H14Z"
        fill="currentColor"
      />
    </svg>
  );
}
