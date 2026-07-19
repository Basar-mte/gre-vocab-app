"use client";

import { useActionState, useRef } from "react";
import { createSet, type SetFormState } from "./actions";

const initialState: SetFormState = {};

export default function CreateSetForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prevState: SetFormState, formData: FormData) => {
    const result = await createSet(prevState, formData);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Set number</label>
        <input name="number" type="number" min={1} required className="input" placeholder="1" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-brand-900">Title</label>
        <input name="title" type="text" required className="input" placeholder="Set 01" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Color (optional)</label>
        <input name="color" type="color" defaultValue="#dc1f1f" className="input h-[42px] p-1" />
      </div>
      <div className="sm:col-span-4">
        <label className="mb-1 block text-sm font-medium text-brand-900">Description (optional)</label>
        <input name="description" type="text" className="input" placeholder="Optional notes about this set" />
      </div>

      {state?.error && (
        <p className="sm:col-span-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{state.error}</p>
      )}

      <div className="sm:col-span-4">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Adding…" : "Add set"}
        </button>
      </div>
    </form>
  );
}
