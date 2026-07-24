"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";
import { EchoHeadline } from "@/components/design/echo-headline";
import { Logo } from "@/components/design/logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (signInError) {
      // Deliberately generic — never confirm whether the email exists, to
      // avoid user enumeration.
      setError("Invalid email or password.");
      return;
    }
    router.push("/admin");
    router.refresh();
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="mb-10 flex flex-col items-center gap-3">
        <Logo className="size-10" />
        <EchoHeadline as="h1" className="font-heading text-4xl font-bold tracking-tight">
          LeadDesk
        </EchoHeadline>
      </div>
      <form
        onSubmit={onSubmit}
        noValidate
        className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8"
      >
        <div>
          <h2 className="font-heading text-xl font-semibold">Admin sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Authorized access only.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="username" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <SubmitButton loading={loading} idleLabel="Sign in" loadingLabel="Signing in" className="w-full" />
        <p className="text-center text-xs text-muted-foreground">
          Just curious? <Link href="/demo" className="underline">Try the no-login demo</Link> instead.
        </p>
      </form>
    </div>
  );
}
