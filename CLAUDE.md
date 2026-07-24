# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**LeadDesk** — a production-grade lead capture platform, built as the submission for Digital Heroes' "Full Stack Development" internship task (see `FullStack_Development_Assignment_Pages_2_9_10.md.txt` for the original brief). Deliberately built well beyond the brief's 5-7 hour estimate: real auth, layered spam defense, lead scoring, audit trail, a public no-login `/demo` sandbox, and a Swiss-brutalist design system adapted from real reference research (below). Full architecture plan lives at `/Users/ayushkumarsingh/.claude/plans/peaceful-splashing-pond.md`.

Every public page must carry the footer credit line: `Built for Digital Heroes Training Task`, linked to `digitalheroesco.com` (hard requirement from the brief, not optional).

## Commands

_To be filled in once the project is scaffolded (package.json scripts for dev/build/lint/test/db)._

## Stack

Next.js 16 (App Router — note `middleware.ts` is renamed `proxy.ts` as of this version) + React 19 + TypeScript strict + Tailwind CSS v4. Neon Postgres (via Vercel Marketplace) + Drizzle ORM, using the **`neon-serverless` driver (`Pool`, WebSocket) everywhere** — not `neon-http`. `neon-http` is stateless-per-request and does not support multi-statement transactions at all; this was discovered the hard way when `updateLeadStatus`'s transactional status+history write threw `Error: No transactions support in neon-http driver` against a real database. Don't mix drivers to "optimize" simple reads back onto `neon-http` — one driver, no split-brain about which queries can and can't transact. better-auth for admin auth (email+password, public signup explicitly disabled). Zod validation shared client/server. Upstash Redis rate limiting. Resend for email. TanStack Query (polling, not websockets) for admin live-ness. Recharts for charts. shadcn/ui re-skinned to the design tokens below (note: shadcn's `radix` base preset generated `button.tsx` and `badge.tsx` without a `"use client"` directive even though both import `Slot` from `radix-ui` — a real bug in that generator output, not a Next.js issue; both needed it added manually to stop RSC `createContext` crashes. Same preset's generated `command.tsx` has a second bug: `CommandDialog` renders `{children}` directly inside `DialogContent` without wrapping them in the `<Command>` primitive that establishes cmdk's internal store — every `CommandInput`/`CommandList`/`CommandItem` throws `Cannot read properties of undefined (reading 'subscribe')` until you wrap children in `<Command>` yourself inside `CommandDialog`. Don't trust this preset's generated files blindly — read what they actually render before using them). `motion` for animation. Vitest + Playwright for tests. Deployed on Vercel free tier. Full rationale for every choice is in the plan file above — don't re-litigate these without a real reason.

## Design system — Swiss/brutalist, researched from superdesign.dev

Visual direction is adapted from superdesign.dev's "High Contrast Landing Page" prompt (library category: landing-pages, style). This is **pattern inspiration**, re-implemented in our own components — never literal copy-paste of a third-party site's code into a public hiring-evaluation repo, and our copy is written for LeadDesk, not the source's fictional travel brand.

**Tokens:**
- Background: `#f2f2f2` (off-white). Primary text: `#111111` (near-black). Secondary/muted: `#b6b5b5`, `#838282`. Echo-layer gradient grays: `#bfbfbf` → `#d9d9d9`.
- Headlines: 'Clash Display', weight 700, tracking `-0.05em`, leading `0.9`. Body: 'Satoshi', weight 500. Both self-hosted via `next/font/local` (Fontshare, free) — never a runtime CDN dependency on these fonts.
- **Echo effect**: hero headline layered with 4-5 background repetitions of itself, offsets `-0.04em / -0.08em / -0.12em / -0.16em`, colors fading `#bfbfbf` → `#d9d9d9`.
- Standard micro-interaction: `700ms cubic-bezier(0.77, 0, 0.175, 1)` for image reveals (`clip-path: inset`); interactive elements use grayscale→color transitions and `1.05x` scale transforms on hover.
- Page structure for editorial/marketing sections: Navigation → Hero → Philosophy/Narrative → Asymmetrical Showcase Grid → Feature/Service Cards → Footer.

## Animation & component research — rule for this repo

**Hard constraint (from the user, do not relax without being asked again):** when pulling design/animation/component inspiration from an external prompt library (e.g. superdesign.dev), you must actually navigate to and read each candidate item's real detail page content — not infer behavior from a thumbnail or screenshot alone, and never fabricate a spec. `get_page_text` after a real navigation (allow ~2s for the SPA to hydrate before reading) reliably returns the item's full prompt text, and for many "ui component"/"animation" entries the complete production-ready source (README, `App.tsx`, `package.json`, `Component.tsx`) is rendered directly in the DOM once loaded — read it from there. Do **not** rely on `navigator.clipboard.readText()` via the browser automation tools to get a "Copy full prompt" payload — it reliably hangs the tab waiting on a clipboard permission prompt that cannot be dismissed programmatically; this was tested and confirmed dead, don't retry it.

When only a short natural-language prompt is available for an item (not full source), that's a legitimate outcome for that particular entry — record it as such rather than inventing code that wasn't shown.

**Items actually researched (real content pulled, not guessed) and how they're used in LeadDesk:**

| Source item | What it actually is | How we use it |
|---|---|---|
| Character Staggered Fade | Per-character blur→focus + opacity reveal, 0.02s stagger | Landing hero/section headline reveal |
| Cinematic SlideUp Headline | Word-mask slide-up, Power4.out ease | Landing hero sub-headline entrance |
| Hover reveal effect | Blob-cursor image reveal (portfolio-oriented source) | Simplified to grayscale→color image reveal on showcase-grid hover (matches the style spec's own micro-interaction rule, not the literal blob-cursor version) |
| Text Color Inversion | `mix-blend-mode: difference` scroll-driven text | Sticky section labels that stay legible over changing backgrounds |
| "Spotlight" Mask | Scroll-tied circular clip-path reveal over a dark overlay | Philosophy/Narrative section reveal |
| Scroll Journey Line | SVG line that draws itself with scroll progress (Framer Motion) | Connects the "how it works" / asymmetrical showcase section |
| Text slidedown animation | Vertical clip slide-down, letter by letter | Secondary headline entrances |
| Gradual Blur | Full production component: multi-layer `backdrop-filter` edge fade, configurable position/strength/curve/divCount | Edge fade on the admin leads table scroll container |
| Tilted Card | Full production component: 3D parallax tilt on mouse move, spring physics, cursor tooltip (`framer-motion`) | Feature/showcase cards on the landing page |
| Shrinking Sticky Header | Header shrinks + glassmorphism after 100px scroll | Landing + admin nav |
| Animated Stepper | Full production multi-step wizard component, dynamic height, slide transitions | Multi-step lead capture form on `/` |
| Luminous Switch | Full skeuomorphic dark-mode toggle (very heavy/ornate CSS) | **Not ported as-is** — clashes with the flat monochrome brutalist aesthetic; only the on/off state-transition *concept* carries over to a much simpler flat segmented control for the admin New/Contacted/Closed status toggle |
| Counter (RollingCounter) | Full production odometer-style rolling digit counter (`framer-motion`) | Admin dashboard stat tiles (total leads, conversion rate, etc.) |
| Radiant Prompt Input | Full production component: rotating conic-gradient border input, AI-chat-styled | **Not ported as-is** — rainbow conic gradient clashes with monochrome palette; only the focus-state affordance concept carries over as a simple monochrome pulse/border treatment on lead-form inputs |
| Pill Nav | Full production component: GSAP "rising circle" hover-fill pill navigation, rotating logo, mobile menu | Landing nav and/or admin status-filter pills |
| Button loading state | Star icon + letter-by-letter text swap ("Generate" → "Generating") pattern | Lead form submit button's loading state ("Send" → "Sending") |
| Bento (MagicBento) | Full production component: spotlight, border-glow, particle stars, 3D tilt, magnetism, ripple click, GSAP | `MagicCard` — reskinned to flat monochrome, particles/purple glow dropped (too loud for Swiss restraint), spotlight+border-glow+tilt kept. Powers the landing page's asymmetric bento feature grid |
| Card Swap | Full production component: GSAP-animated stacked cards, front card drops away, stack promotes, elastic easing | `CardSwap`/`SwapCard` — cycles real product screenshots (admin dashboard, lead form) instead of the original's stock photography, in the "One system, three real views" section. Also click-to-advance (`swapOnClick`), not just the auto-cycle |
| Interactive virtual character | **Image-generation prompt, not a code component** — "minimalist character, head only... diffused glowing sphere of flowing aurora light... geometric white vector lines, high curved eyebrows, dot eyes, 'L' shaped nose" | No source to adapt, so this is an original CSS/SVG build (`AuroraCharacter`) matching the description exactly — the one deliberate color accent (cyan/violet/blue) on an otherwise monochrome site, placed in the hero's right whitespace with a small "New lead scored 92" notification bubble and caption copy |

Full catalog names/tags for both the Animation and UI Component categories were also captured at the grid-listing level (not deep-dived individually) during research — if a future task wants something not in the table above, check the plan file/session history before assuming it wasn't considered, and re-research properly (real navigation + real page read) rather than guessing.

## Product/scope rules

- Backend and frontend are built **together**, not backend-then-a-hard-stop — wire up UI against real endpoints/schemas as they're built rather than building a fully bare backend first.
- `/demo` must be usable by anyone with zero login, mirrors the real `/admin` UI, and only ever touches `is_demo = true` rows through its own isolated action file — never the authenticated admin code path. See the plan file's "Demo isolation is structural, not conventional" section before touching either.
- No fabricated social proof (fake testimonials, fake customer logos, fake numbers) anywhere on the public site.
