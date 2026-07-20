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
    <div className="card overflow-hidden p-0">
      <div className="table-ribbon flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm font-semibold text-white">
          {selected.size > 0 ? `${selected.size} selected` : `${words.length} word${words.length === 1 ? "" : "s"}`}
        </span>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={pending}
            className="font-semibold text-[#ff8a8f] hover:underline disabled:opacity-50"
          >
            {pending ? "Deleting…" : `Delete selected (${selected.size})`}
          </button>
        )}
      </div>
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="table-ribbon">
          <tr>
            <th className="table-head-cell">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="h-4 w-4 accent-[#D32C32]"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all words"
              />
            </th>
            <th className="table-head-cell">Term</th>
            <th className="table-head-cell">Meaning</th>
            <th className="table-head-cell">Part of speech</th>
            <th className="table-head-cell" />
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
