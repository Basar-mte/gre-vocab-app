"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SetSelector, { type AvailableSet } from "@/components/set-selector";

const COUNT_PRESETS = [10, 15, 20, 25, 30, 50, 100];
const RANDOM_PRESETS = [10, 15, 20, 25, 30, 50];

export default function FlashcardSetupForm({
  availableSets,
  totalWords,
}: {
  availableSets: AvailableSet[];
  totalWords: number;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"sets" | "random">("sets");

  const [selected, setSelected] = useState<number[]>([]);
  const [shuffle, setShuffle] = useState(true);
  const [count, setCount] = useState<"all" | number>("all");

  const [randomCount, setRandomCount] = useState(10);

  const totalSelectedWords = useMemo(
    () => availableSets.filter((s) => selected.includes(s.number)).reduce((sum, s) => sum + s.wordCount, 0),
    [availableSets, selected]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "random") {
      const params = new URLSearchParams();
      params.set("sets", "all");
      params.set("shuffle", "true");
      params.set("count", String(Math.max(1, Math.min(randomCount, totalWords || randomCount))));
      router.push(`/flashcards/play?${params.toString()}`);
      return;
    }

    if (selected.length === 0) return;
    const params = new URLSearchParams();
    params.set("sets", selected.join(","));
    params.set("shuffle", String(shuffle));
    if (count !== "all") params.set("count", String(count));
    router.push(`/flashcards/play?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="inline-flex rounded-lg border border-[#e3dfda] p-1">
        <button
          type="button"
          onClick={() => setMode("sets")}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
            mode === "sets" ? "bg-[#D32C32] text-white" : "text-brand-800 hover:bg-[#f5f5f5]"
          }`}
        >
          Choose sets
        </button>
        <button
          type="button"
          onClick={() => setMode("random")}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
            mode === "random" ? "bg-[#D32C32] text-white" : "text-brand-800 hover:bg-[#f5f5f5]"
          }`}
        >
          Random mix
        </button>
      </div>

      {mode === "sets" ? (
        <>
          <SetSelector availableSets={availableSets} value={selected} onChange={setSelected} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm font-medium text-brand-900">
              <input
                type="checkbox"
                checked={shuffle}
                onChange={(e) => setShuffle(e.target.checked)}
                className="h-4 w-4 accent-[#D32C32]"
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
                <option value="all">All ({totalSelectedWords || 0})</option>
                {COUNT_PRESETS.filter((n) => n < totalSelectedWords).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button type="submit" disabled={selected.length === 0} className="btn btn-primary">
              Start flashcards {totalSelectedWords > 0 ? `(${totalSelectedWords} words available)` : ""}
            </button>
            {selected.length === 0 && (
              <p className="mt-2 text-sm text-brand-700/70">Select at least one set to continue.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-brand-700/70">
            Pulls a shuffled mix from your entire word bank — {totalWords} words across every set. Just say how
            many you want to study.
          </p>

          <div className="max-w-xs">
            <label className="mb-1 block text-sm font-medium text-brand-900">How many words?</label>
            <input
              type="number"
              min={1}
              max={Math.max(1, totalWords)}
              value={randomCount}
              onChange={(e) => setRandomCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="input"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {RANDOM_PRESETS.filter((n) => n <= totalWords).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRandomCount(n)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    randomCount === n
                      ? "border-[#D32C32] bg-[#D32C32] text-white"
                      : "border-[#e3dfda] text-brand-800 hover:border-[#D32C32]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button type="submit" disabled={totalWords === 0} className="btn btn-primary">
              Start random mix ({Math.min(randomCount, totalWords || randomCount)} words)
            </button>
            {totalWords === 0 && <p className="mt-2 text-sm text-brand-700/70">No words in the bank yet.</p>}
          </div>
        </>
      )}
    </form>
  );
}
