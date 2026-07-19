"use client";

import { useActionState, useState } from "react";
import { deleteWord, updateWord, type WordFormState } from "./actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

type WordData = {
  id: string;
  term: string;
  meaning: string;
  partOfSpeech: string | null;
  example: string | null;
  synonyms: string | null;
};

const initialState: WordFormState = {};

export default function WordRow({ word }: { word: WordData }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(async (prevState: WordFormState, formData: FormData) => {
    const result = await updateWord(prevState, formData);
    if (!result.error) setEditing(false);
    return result;
  }, initialState);

  if (editing) {
    return (
      <tr className="border-b border-brand-50 bg-brand-50/40 last:border-0">
        <td colSpan={4} className="px-4 py-4">
          <form action={formAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={word.id} />
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-900">Term</label>
              <input name="term" defaultValue={word.term} required className="input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-900">Part of speech</label>
              <input name="partOfSpeech" defaultValue={word.partOfSpeech ?? ""} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-brand-900">Meaning</label>
              <input name="meaning" defaultValue={word.meaning} required className="input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-900">Example</label>
              <input name="example" defaultValue={word.example ?? ""} className="input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-900">Synonyms</label>
              <input name="synonyms" defaultValue={word.synonyms ?? ""} className="input" />
            </div>

            {state?.error && (
              <p className="sm:col-span-2 rounded-lg bg-white px-3 py-2 text-sm text-brand-700">{state.error}</p>
            )}

            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-brand-50 last:border-0 hover:bg-brand-50/40">
      <td className="px-4 py-3 font-semibold text-brand-900">{word.term}</td>
      <td className="px-4 py-3 text-brand-800">{word.meaning}</td>
      <td className="px-4 py-3 text-brand-700/70">{word.partOfSpeech ?? "—"}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(true)} className="font-semibold text-brand-700 hover:underline">
            Edit
          </button>
          <form action={deleteWord}>
            <input type="hidden" name="id" value={word.id} />
            <ConfirmSubmitButton message={`Delete "${word.term}"?`} className="font-semibold text-red-700 hover:underline">
              Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </td>
    </tr>
  );
}
