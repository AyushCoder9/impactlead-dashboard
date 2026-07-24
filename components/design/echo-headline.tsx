import { cn } from "@/lib/utils";

const OFFSETS = ["-0.04em", "-0.08em", "-0.12em", "-0.16em"];
const COLORS = ["var(--echo-1)", "var(--echo-2)", "var(--echo-3)", "var(--echo-4)"];

/**
 * The style spec's signature "echo effect": the hero headline layered with
 * 4 background repetitions of itself, each offset diagonally and faded
 * lighter, in a single stacked block. See CLAUDE.md design-system section.
 */
export function EchoHeadline({
  children,
  as: Tag = "h1",
  className,
}: {
  children: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className="relative isolate">
      {OFFSETS.map((offset, i) => (
        <Tag
          key={i}
          aria-hidden="true"
          className={cn("absolute inset-0 -z-10 select-none whitespace-pre-wrap", className)}
          style={{
            transform: `translate(${offset}, ${offset})`,
            color: COLORS[i],
          }}
        >
          {children}
        </Tag>
      ))}
      <Tag className={cn("relative", className)}>{children}</Tag>
    </div>
  );
}
