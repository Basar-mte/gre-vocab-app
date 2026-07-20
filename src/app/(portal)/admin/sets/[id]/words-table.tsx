"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteWords } from "./actions";
import WordRow from "./word-row";

type WordData = {
  id: string;
  term: string;
  meaning: string;
  mnemonic: string | null;
  partOfSpeech: string | null;
  example: string | null;
  synonyms: string | null;
};

export default function WordsTable({ setId, words }: { setId: string; words: WordData[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allSelected = words.length > 0 && selected.size === words.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(words.map((w) => w.id)));
  }

  function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} selected word${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) {
      return;
    }
    const ids = Array.from(selected);
    startTransition(async () => {
      await deleteWords(setId, ids);
      setSelected(new Set());
    });
  }

  const selectAllRef = useMemo(
    () => (el: HTMLInputElement | null) => {
      if (el) el.indeterminate = someSelected;
    },
    [someSelected]
  );

  return (
    <div className="card overflow-x-auto p-0">
      <div className="flex items-center justify-between gap-3 border-b border-brand-100 px-4 py-3">
        <span className="text-sm font-medium text-brand-700/70">
          {selected.size > 0 ? `${selected.size} selected` : `${words.length} word${words.length === 1 ? "" : "s"}`}
        </span>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={pending}
            className="font-semibold text-red-700 hover:underline disabled:opacity-50"
          >
            {pending ? "Deleting…" : `Delete selected (${selected.size})`}
          </button>
        )}
      </div>
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-brand-100 text-brand-700/70">
            <th className="px-4 py-3 font-medium">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="h-4 w-4 accent-brand-600"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all words"
              />
            </th>
            <th className="px-4 py-3 font-medium">Term</th>
            <th className="px-4 py-3 font-medium">Meaning</th>
            <th className="px-4 py-3 font-medium">Part of speech</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {words.map((word) => (
            <WordRow key={word.id} word={word} selected={selected.has(word.id)} onToggleSelected={toggleOne} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
