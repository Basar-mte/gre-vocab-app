"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { deleteSet, deleteSets } from "./actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

type SetData = {
  id: string;
  number: number;
  title: string;
  color: string | null;
  wordCount: number;
};

export default function SetsTable({ sets }: { sets: SetData[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allSelected = sets.length > 0 && selected.size === sets.length;
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
    setSelected(allSelected ? new Set() : new Set(sets.map((s) => s.id)));
  }

  function handleDeleteSelected() {
    if (selected.size === 0) return;
    const totalWords = sets.filter((s) => selected.has(s.id)).reduce((sum, s) => sum + s.wordCount, 0);
    if (
      !window.confirm(
        `Delete ${selected.size} selected set${selected.size > 1 ? "s" : ""} and ${totalWords} word${totalWords === 1 ? "" : "s"}? This cannot be undone.`
      )
    ) {
      return;
    }
    const ids = Array.from(selected);
    startTransition(async () => {
      await deleteSets(ids);
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
          {selected.size > 0 ? `${selected.size} selected` : `${sets.length} set${sets.length === 1 ? "" : "s"}`}
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
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-brand-100 text-brand-700/70">
            <th className="px-4 py-3 font-medium">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="h-4 w-4 accent-brand-600"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all sets"
              />
            </th>
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Words</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {sets.map((set) => (
            <tr
              key={set.id}
              className={`border-b border-brand-50 last:border-0 hover:bg-brand-50/40 ${
                selected.has(set.id) ? "bg-brand-50/60" : ""
              }`}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-brand-600"
                  checked={selected.has(set.id)}
                  onChange={() => toggleOne(set.id)}
                  aria-label={`Select set ${set.number}`}
                />
              </td>
              <td className="px-4 py-3 font-semibold text-brand-800">{set.number}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {set.color && (
                    <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: set.color }} />
                  )}
                  {set.title}
                </div>
              </td>
              <td className="px-4 py-3">{set.wordCount}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/sets/${set.id}`} className="font-semibold text-brand-700 hover:underline">
                    Manage
                  </Link>
                  <form action={deleteSet}>
                    <input type="hidden" name="id" value={set.id} />
                    <ConfirmSubmitButton
                      message={`Delete "${set.title}" and all ${set.wordCount} of its words? This cannot be undone.`}
                      className="font-semibold text-red-700 hover:underline"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
