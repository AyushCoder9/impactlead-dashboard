"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { leadFormSchema, BUDGET_RANGES, BUDGET_RANGE_LABELS, type LeadFormInput } from "@/lib/validation/lead";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/forms/submit-button";
import { cn } from "@/lib/utils";

type Step = 1 | 2;

/**
 * Two-step lead capture form: contact info, then project details. Step
 * transitions are a trimmed adaptation of superdesign.dev's "Animated
 * Stepper" (real production source pulled during research — see
 * CLAUDE.md), not a full generic wizard component, since this form only
 * ever has two steps.
 */
export function LeadForm() {
  const renderedAt = useRef(Date.now());
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { budgetRange: undefined, company: "" },
  });

  const budgetRange = watch("budgetRange");

  async function goToStep2() {
    const valid = await trigger(["name", "email"]);
    if (valid) setStep(2);
  }

  const onSubmit = handleSubmit(async (data) => {
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, renderedAt: renderedAt.current }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  });

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-8 py-16 text-center"
      >
        <CheckCircle2 className="size-10" strokeWidth={1.5} />
        <h3 className="font-heading text-2xl font-semibold">Message sent</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          We&apos;ve got your details. A real person will follow up within one business day.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      {/* Honeypot — invisible to real users, any value here means a bot filled it */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className="mb-6 flex items-center gap-2">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-xs font-medium",
                step >= n ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
              )}
            >
              {n}
            </span>
            {n === 1 && <span className="h-px w-6 bg-border" />}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">
          Step {step} of 2 — {step === 1 ? "Your details" : "Your project"}
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Jordan Blake" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="jordan@company.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="button" className="w-full rounded-full" onClick={goToStep2}>
              Continue
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Budget range</Label>
              <div className="grid grid-cols-2 gap-2">
                {BUDGET_RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setValue("budgetRange", range, { shouldValidate: true })}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                      budgetRange === range
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-foreground/40",
                    )}
                  >
                    {BUDGET_RANGE_LABELS[range]}
                  </button>
                ))}
              </div>
              {errors.budgetRange && (
                <p className="text-xs text-destructive">{errors.budgetRange.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Tell us about the project</Label>
              <Textarea id="message" rows={4} placeholder="What are you trying to build?" {...register("message")} />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setStep(1)}>
                Back
              </Button>
              <SubmitButton
                loading={status === "submitting"}
                idleLabel="Send message"
                loadingLabel="Sending"
                className="flex-1"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
