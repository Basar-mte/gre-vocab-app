"use client";

import { useActionState, useRef } from "react";
import { createWord, type WordFormState } from "./actions";

const initialState: WordFormState = {};

export default function AddWordForm({ setId }: { setId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prevState: WordFormState, formData: FormData) => {
    const result = await createWord(prevState, formData);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="setId" value={setId} />
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Term</label>
        <input name="term" type="text" required className="input" placeholder="e.g. Ephemeral" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Part of speech (optional)</label>
        <input name="partOfSpeech" type="text" className="input" placeholder="e.g. adjective" />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-brand-900">Meaning</label>
        <input name="meaning" type="text" required className="input" placeholder="e.g. Lasting for a very short time" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Example (optional)</label>
        <input name="example" type="text" className="input" placeholder="Sentence using the word" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Synonyms (optional)</label>
        <input name="synonyms" type="text" className="input" placeholder="Comma-separated" />
      </div>

      {state?.error && (
        <p className="sm:col-span-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{state.error}</p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Adding…" : "Add word"}
        </button>
      </div>
    </form>
  );
}
