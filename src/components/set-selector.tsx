"use client";

import { useMemo, useState } from "react";
import { parseSetRanges } from "@/lib/sets";

export type AvailableSet = {
  number: number;
  title: string;
  wordCount: number;
};

export default function SetSelector({
  availableSets,
  value,
  onChange,
  formFieldName,
}: {
  availableSets: AvailableSet[];
  value: number[];
  onChange: (next: number[]) => void;
  /** If provided, renders a hidden input so a native <form> can read the selection. */
  formFieldName?: string;
}) {
  const [rangeText, setRangeText] = useState("");

  const selectedSet = useMemo(() => new Set(value), [value]);
  const availableNumbers = useMemo(() => availableSets.map((s) => s.number), [availableSets]);

  function toggle(num: number) {
    const next = selectedSet.has(num) ? value.filter((n) => n !== num) : [...value, num];
    onChange(next.sort((a, b) => a - b));
  }

  function applyRange() {
    const parsed = parseSetRanges(rangeText).filter((n) => availableNumbers.includes(n));
    if (parsed.length === 0) return;
    const merged = Array.from(new Set([...value, ...parsed])).sort((a, b) => a - b);
    onChange(merged);
    setRangeText("");
  }

  function selectAll() {
    onChange([...availableNumbers].sort((a, b) => a - b));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div className="space-y-3">
      {formFieldName && <input type="hidden" name={formFieldName} value={value.join(",")} />}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={rangeText}
          onChange={(e) => setRangeText(e.target.value)}
          placeholder="e.g. 1-5, 8, 12-15"
          className="input max-w-[220px]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyRange();
            }
          }}
        />
        <button type="button" onClick={applyRange} className="btn btn-secondary text-sm">
          Add range
        </button>
        <button type="button" onClick={selectAll} className="btn btn-ghost text-sm">
          Select all
        </button>
        <button type="button" onClick={clearAll} className="btn btn-ghost text-sm">
          Clear
        </button>
        <span className="ml-auto text-sm font-medium text-brand-700">{value.length} selected</span>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-10">
        {availableSets.map((set) => {
          const active = selectedSet.has(set.number);
          return (
            <button
              key={set.number}
              type="button"
              onClick={() => toggle(set.number)}
              title={`${set.title} (${set.wordCount} words)`}
              className={
                "rounded-lg border px-2 py-2 text-sm font-semibold transition " +
                (active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-200 bg-white text-brand-800 hover:border-brand-400")
              }
            >
              {set.number}
            </button>
          );
        })}
      </div>

      {availableSets.length === 0 && (
        <p className="text-sm text-brand-700/70">
          No sets available yet. Ask an admin to add sets and words.
        </p>
      )}
    </div>
  );
}
