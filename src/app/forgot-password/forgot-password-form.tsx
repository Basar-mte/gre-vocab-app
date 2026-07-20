"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state?.success) {
    return (
      <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
        If an account exists for that email, we&apos;ve sent a link to reset your password. Check your inbox (and
        spam folder).
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-brand-900">
          Email
        </label>
        <input id="email" name="email" type="email" required className="input" placeholder="you@example.com" />
      </div>

      {state?.error && <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
