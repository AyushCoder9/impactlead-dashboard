import Link from "next/link";
import { EchoHeadline } from "@/components/design/echo-headline";
import { Logo } from "@/components/design/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
        <Logo className="size-6" />
        LeadDesk
      </Link>
      <EchoHeadline as="h1" className="font-heading text-6xl font-bold">
        404
      </EchoHeadline>
      <p className="text-muted-foreground">That page doesn&apos;t exist.</p>
      <Button asChild className="rounded-full">
        <Link href="/">Back to LeadDesk</Link>
      </Button>
    </div>
  );
}
