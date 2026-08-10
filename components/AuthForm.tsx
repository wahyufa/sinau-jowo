"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/lib/actions";
import { useUiLang } from "@/lib/i18n";

type Props = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  variant: "login" | "signup";
  subtitle: string;
  submitLabel: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
};

export default function AuthForm({
  action,
  variant,
  subtitle,
  submitLabel,
  footerText,
  footerLinkText,
  footerLinkHref,
}: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const { t } = useUiLang();
  const title = t(variant === "login" ? "authLoginTitle" : "authSignupTitle");

  return (
    <div className="auth-card">
      <h1>{title}</h1>
      <p className="auth-subtitle">{subtitle}</p>

      <form action={formAction} className="auth-form">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
        />

        {state?.error && <p className="auth-error">{state.error}</p>}

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Mohon tunggu..." : submitLabel}
        </button>
      </form>

      <p className="auth-footer">
        {footerText}{" "}
        <Link href={footerLinkHref}>{footerLinkText}</Link>
      </p>
    </div>
  );
}
