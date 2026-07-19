"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/dashboard"} />

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-brand-900">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-brand-900">
          Password
        </label>
        <input id="password" name="password" type="password" required className="input" />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{state.error}</p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <div className="rounded-lg border border-dashed border-brand-200 bg-brand-50/60 p-3 text-xs text-brand-700/80">
        <p className="font-semibold">Demo accounts</p>
        <p>Admin: admin@goldmine.app / admin1234</p>
        <p>Student: student@goldmine.app / student1234</p>
      </div>
    </form>
  );
}
