"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import SetSelector, { type AvailableSet } from "@/components/set-selector";
import { createExamAttempt, type CreateExamState } from "./actions";

const COUNT_PRESETS = [10, 15, 20, 25, 30, 50, 100];
const initialState: CreateExamState = {};

export default function ExamSetupForm({ availableSets }: { availableSets: AvailableSet[] }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [shuffle, setShuffle] = useState(true);
  const [count, setCount] = useState(10);
  const [state, formAction, pending] = useActionState(createExamAttempt, initialState);

  const totalWords = useMemo(
    () => availableSets.filter((s) => selected.includes(s.number)).reduce((sum, s) => sum + s.wordCount, 0),
    [availableSets, selected]
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="sets" value={selected.join(",")} />
      <input type="hidden" name="shuffle" value={String(shuffle)} />

      <SetSelector availableSets={availableSets} value={selected} onChange={setSelected} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex items-center gap-2 text-sm font-medium text-brand-900">
          <input
            type="checkbox"
            checked={shuffle}
            onChange={(e) => setShuffle(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Shuffle questions
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-900">Number of words</label>
          <select
            name="count"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="input"
          >
            {COUNT_PRESETS.map((n) => (
              <option key={n} value={n} disabled={totalWords > 0 && n > totalWords}>
                {n}
              </option>
            ))}
            {totalWords > 0 && !COUNT_PRESETS.includes(totalWords) && <option value={totalWords}>{totalWords} (all)</option>}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-900">Direction</label>
          <select name="direction" defaultValue="TERM_TO_MEANING" className="input">
            <option value="TERM_TO_MEANING">Word → Meaning</option>
            <option value="MEANING_TO_TERM">Meaning → Word</option>
            <option value="MIXED">Mixed</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-900">Question style</label>
          <select name="format" defaultValue="MULTIPLE_CHOICE" className="input">
            <option value="MULTIPLE_CHOICE">Multiple choice</option>
            <option value="TYPED">Typed answer</option>
          </select>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{state.error}</p>
      )}

      <div>
        <button type="submit" disabled={selected.length === 0 || pending} className="btn btn-primary">
          {pending ? "Preparing exam…" : `Start exam${totalWords > 0 ? ` (${Math.min(count, totalWords)} of ${totalWords} words)` : ""}`}
        </button>
        {selected.length === 0 && (
          <p className="mt-2 text-sm text-brand-700/70">Select at least one set to continue.</p>
        )}
      </div>
    </form>
  );
}
