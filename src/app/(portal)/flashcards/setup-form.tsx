"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SetSelector, { type AvailableSet } from "@/components/set-selector";

const COUNT_PRESETS = [10, 15, 20, 25, 30, 50, 100];

export default function FlashcardSetupForm({ availableSets }: { availableSets: AvailableSet[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const [shuffle, setShuffle] = useState(true);
  const [count, setCount] = useState<"all" | number>("all");

  const totalWords = useMemo(
    () => availableSets.filter((s) => selected.includes(s.number)).reduce((sum, s) => sum + s.wordCount, 0),
    [availableSets, selected]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) return;
    const params = new URLSearchParams();
    params.set("sets", selected.join(","));
    params.set("shuffle", String(shuffle));
    if (count !== "all") params.set("count", String(count));
    router.push(`/flashcards/play?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SetSelector availableSets={availableSets} value={selected} onChange={setSelected} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm font-medium text-brand-900">
          <input
            type="checkbox"
            checked={shuffle}
            onChange={(e) => setShuffle(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Shuffle cards
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-900">Number of words</label>
          <select
            value={count}
            onChange={(e) => setCount(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="input"
          >
            <option value="all">All ({totalWords || 0})</option>
            {COUNT_PRESETS.filter((n) => n < totalWords).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <button type="submit" disabled={selected.length === 0} className="btn btn-primary">
          Start flashcards {totalWords > 0 ? `(${totalWords} words available)` : ""}
        </button>
        {selected.length === 0 && (
          <p className="mt-2 text-sm text-brand-700/70">Select at least one set to continue.</p>
        )}
      </div>
    </form>
  );
}
