"use client";

import { useActionState } from "react";
import { updateSet, type SetFormState } from "../actions";

const initialState: SetFormState = {};

export default function EditSetForm({
  set,
}: {
  set: { id: string; title: string; description: string | null; color: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateSet, initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-4">
      <input type="hidden" name="id" value={set.id} />
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-brand-900">Title</label>
        <input name="title" type="text" defaultValue={set.title} required className="input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Color</label>
        <input name="color" type="color" defaultValue={set.color ?? "#dc1f1f"} className="input h-[42px] p-1" />
      </div>
      <div className="sm:col-span-4">
        <label className="mb-1 block text-sm font-medium text-brand-900">Description</label>
        <input name="description" type="text" defaultValue={set.description ?? ""} className="input" />
      </div>

      {state?.error && (
        <p className="sm:col-span-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{state.error}</p>
      )}

      <div className="sm:col-span-4">
        <button type="submit" disabled={pending} className="btn btn-secondary">
          {pending ? "Saving…" : "Save details"}
        </button>
      </div>
    </form>
  );
}
