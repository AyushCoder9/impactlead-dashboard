import { ShieldCheck, Search, ListChecks, Gauge, Users, Database } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { StickyHeader } from "@/components/design/sticky-header";
import { EchoHeadline } from "@/components/design/echo-headline";
import { StaggeredFade } from "@/components/design/staggered-fade";
import { Reveal } from "@/components/design/reveal";
import { MagicCard } from "@/components/design/magic-card";
import { CardSwap, SwapCard } from "@/components/design/card-swap";
import { HeroCharacter } from "@/components/design/hero-character";
import { LeadForm } from "@/components/forms/lead-form";
import { SiteFooter } from "@/components/design/site-footer";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Layered spam defense",
    description:
      "Honeypot fields, fill-time heuristics, IP+email rate limiting, and optional Turnstile — before a single bad row ever hits your table.",
    span: "sm:col-span-2",
  },
  {
    icon: Gauge,
    title: "Lead scoring, explained",
    description: "Every submission gets a transparent 0–100 score from budget tier, message quality, and email domain.",
    span: "sm:col-span-1",
  },
  {
    icon: Search,
    title: "Duplicate detection",
    description: "Same email within 24 hours gets flagged automatically, so your team never double-works a conversation.",
    span: "sm:col-span-1 sm:row-span-2",
  },
  {
    icon: ListChecks,
    title: "Full audit trail",
    description: "Every status change is logged — who, when, from what to what.",
    span: "sm:col-span-1",
  },
  {
    icon: Users,
    title: "Real authentication",
    description:
      "Database-backed sessions, brute-force rate limiting, no hardcoded admin string. Built to be handed to a client.",
    span: "sm:col-span-2",
  },
  {
    icon: Database,
    title: "Your data, your database",
    description: "Postgres under the hood. Export to CSV whenever you want. Nothing proprietary.",
    span: "sm:col-span-1",
  },
];

export default function Home() {
  return (
    <>
      <StickyHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 pb-24 pt-20 sm:pt-28 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col items-start gap-8">
            <EchoHeadline
              as="h1"
              className="font-heading text-[13vw] font-bold uppercase leading-[0.9] tracking-tight sm:text-[6.5rem]"
            >
              LEADDESK
            </EchoHeadline>
            <div className="max-w-xl">
              <StaggeredFade as="h2" className="font-heading text-2xl font-semibold sm:text-3xl">
                Capture every lead. Miss nothing.
              </StaggeredFade>
              <Reveal delay={0.5}>
                <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                  A lead capture desk built like a real product: validated forms, spam
                  defense, scoring, and an admin view your team will actually use —
                  not a demo that falls apart under real traffic.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild size="lg" className="rounded-full px-8">
                    <Link href="#capture">Get started</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                    <Link href="/demo">Try the live demo</Link>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Aurora character — the one deliberate color accent on an
              otherwise monochrome site. See components/design/aurora-character.tsx. */}
          <HeroCharacter />
        </section>

        {/* Philosophy / narrative */}
        <section className="border-y border-border bg-secondary/40 py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <p className="font-heading text-3xl font-medium leading-tight sm:text-4xl">
                Most lead forms are an afterthought bolted onto a landing page.
                LeadDesk treats the form, the database, and the follow-through
                as one system — because a lead you can&apos;t find again is the
                same as a lead you never captured.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Bento feature grid */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
              Built for the parts that usually get skipped
            </h2>
          </Reveal>
          <div className="mt-12 grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.05} className={feature.span}>
                <MagicCard className="h-full">
                  <div className="flex h-full flex-col gap-3 p-6">
                    <feature.icon className="size-6" strokeWidth={1.5} />
                    <h3 className="font-heading text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </MagicCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Asymmetrical showcase grid — real product screenshots */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
              See it before you build with it
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-6">
            <Reveal className="sm:col-span-4">
              {/* Aspect matches the source screenshot's actual ratio
                  (1540:784) so object-cover doesn't symmetrically crop
                  content off both edges. */}
              <div className="hover-reveal relative aspect-[1540/784] overflow-hidden rounded-3xl border border-border">
                <Image
                  src="/screenshots/admin-dashboard.jpg"
                  alt="LeadDesk admin dashboard showing stat tiles, a leads-over-time chart, and a searchable leads table"
                  fill
                  className="object-cover object-top"
                  sizes="(min-width: 640px) 66vw, 100vw"
                />
              </div>
              <p className="mt-3 text-sm font-medium">The admin desk — search, filter, and status in one view</p>
            </Reveal>
            <Reveal delay={0.1} className="sm:col-span-2">
              <div className="hover-reveal relative aspect-square overflow-hidden rounded-3xl border border-border">
                <Image
                  src="/screenshots/lead-form.jpg"
                  alt="LeadDesk two-step lead capture form"
                  fill
                  className="object-cover object-top"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
              <p className="mt-3 text-sm font-medium">Every lead, scored on arrival</p>
            </Reveal>
          </div>
        </section>

        {/* Product tour — auto-cycling stacked cards */}
        <section className="overflow-hidden border-y border-border bg-secondary/40 py-24">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
            <Reveal>
              <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
                One system, three real views
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                The public form, the admin desk, and the no-login demo all run on the
                same components and the same data model — what you see here is
                exactly what ships.
              </p>
            </Reveal>
            <Reveal delay={0.15} className="flex justify-center">
              <CardSwap width={420} height={280} cardDistance={36} verticalDistance={36} delay={3200}>
                <SwapCard>
                  <div className="relative h-full w-full">
                    <Image src="/screenshots/admin-dashboard.jpg" alt="Admin dashboard" fill sizes="420px" className="object-cover object-top" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                      <p className="text-sm font-medium text-white">Admin dashboard</p>
                    </div>
                  </div>
                </SwapCard>
                <SwapCard>
                  <div className="relative h-full w-full">
                    <Image src="/screenshots/lead-form.jpg" alt="Lead capture form" fill sizes="420px" className="object-cover object-top" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                      <p className="text-sm font-medium text-white">Public lead form</p>
                    </div>
                  </div>
                </SwapCard>
                <SwapCard>
                  <div className="flex h-full w-full flex-col justify-center gap-2 bg-primary p-8 text-primary-foreground">
                    <p className="font-heading text-2xl font-semibold">/demo</p>
                    <p className="text-sm opacity-80">
                      The exact admin experience, zero login, sandboxed data that resets on a schedule.
                    </p>
                  </div>
                </SwapCard>
              </CardSwap>
            </Reveal>
          </div>
        </section>

        {/* Lead capture form */}
        <section id="capture" className="mx-auto max-w-2xl px-6 py-24">
          <Reveal>
            <div className="mb-8 text-center">
              <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Tell us about your project</h2>
              <p className="mt-3 text-muted-foreground">
                Two minutes. Real validation on both ends, so what you send is what we see.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <LeadForm />
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
