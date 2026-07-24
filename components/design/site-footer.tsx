export function SiteFooter() {
  return (
    <footer className="border-t border-border py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-xs text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} LeadDesk.</p>
      </div>
    </footer>
  );
}
