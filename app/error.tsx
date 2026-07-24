"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/design/logo";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
        <Logo className="size-6" />
        LeadDesk
      </Link>
      <h1 className="font-heading text-3xl font-bold">Something went wrong</h1>
      <p className="max-w-sm text-muted-foreground">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset} className="rounded-full">
          Try again
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/">Back to LeadDesk</Link>
        </Button>
      </div>
    </div>
  );
}
