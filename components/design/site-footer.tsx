import Link from "next/link";

// Hard requirement from the brief: this exact credit line, linked to
// digitalheroesco.com, visible on every public page. Do not remove or
// reword.
export function SiteFooter() {
  return (
    <footer className="border-t border-border py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-xs text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} LeadDesk.</p>
        <Link
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Built for Digital Heroes Training Task
        </Link>
      </div>
    </footer>
  );
}
