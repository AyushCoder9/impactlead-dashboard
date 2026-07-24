import Link from "next/link";
import { EchoHeadline } from "@/components/design/echo-headline";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
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
