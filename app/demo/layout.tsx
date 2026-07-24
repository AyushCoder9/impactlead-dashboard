import Link from "next/link";
import { SiteFooter } from "@/components/design/site-footer";
import { ThemeToggle } from "@/components/design/theme-toggle";
import { Logo } from "@/components/design/logo";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border bg-accent px-6 py-2.5 text-center text-xs font-medium">
        You&apos;re in the live demo — sandbox data, no login required, resets automatically.{" "}
        <Link href="/" className="underline underline-offset-2">
          Back to LeadDesk
        </Link>
      </div>
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
          <Logo className="size-6" />
          LeadDesk <span className="text-muted-foreground">/ demo</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/admin/login" className="text-sm underline underline-offset-4">
            Admin login
          </Link>
        </div>
      </header>
      <main className="flex-1 px-6 pb-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
