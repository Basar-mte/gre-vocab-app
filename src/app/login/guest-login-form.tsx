"use client";

import { useActionState } from "react";
import { guestLoginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function GuestLoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(guestLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/dashboard"} />

      <div>
        <label htmlFor="guest-email" className="mb-1 block text-sm font-medium text-brand-900">
          Email
        </label>
        <input
          id="guest-email"
          name="email"
          type="email"
          required
          className="input"
          placeholder="you@example.com"
        />
      </div>

      {state?.error && <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-secondary w-full">
        {pending ? "Continuing…" : "Continue as guest"}
      </button>
      <p className="text-xs text-brand-700/60">
        No password — just enough to save your progress. You can register properly any time.
      </p>
    </form>
  );
}
