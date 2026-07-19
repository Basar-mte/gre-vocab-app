"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { shuffleArray } from "@/lib/exam";

type FlashWord = {
  id: string;
  term: string;
  meaning: string;
  partOfSpeech?: string | null;
  example?: string | null;
};

export default function FlashcardViewer({
  words,
  setNumbers,
  shuffle,
}: {
  words: FlashWord[];
  setNumbers: number[];
  shuffle: boolean;
}) {
  const [deck, setDeck] = useState(words);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unsure, setUnsure] = useState<Set<string>>(new Set());

  const current = deck[index];
  const progress = `${index + 1} / ${deck.length}`;

  const finished = index >= deck.length;

  function goNext() {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, deck.length));
  }

  function goPrev() {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  }

  function markAndAdvance(bucket: "known" | "unsure") {
    if (!current) return;
    if (bucket === "known") {
      setKnown((s) => new Set(s).add(current.id));
      setUnsure((s) => {
        const next = new Set(s);
        next.delete(current.id);
        return next;
      });
    } else {
      setUnsure((s) => new Set(s).add(current.id));
    }
    goNext();
  }

  function reshuffle() {
    setDeck(shuffleArray(words));
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnsure(new Set());
  }

  function restart() {
    setDeck(words);
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnsure(new Set());
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (finished) return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.code === "ArrowRight") {
        goNext();
      } else if (e.code === "ArrowLeft") {
        goPrev();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, deck.length]);

  const setLabel = useMemo(() => `Set${setNumbers.length > 1 ? "s" : ""} ${setNumbers.join(", ")}`, [setNumbers]);

  if (deck.length === 0) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="mb-4 text-brand-800">No words to show.</p>
        <Link href="/flashcards" className="btn btn-primary">
          Back to setup
        </Link>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold text-brand-900">Deck complete 🎉</h2>
          <p className="mt-2 text-brand-700/70">{setLabel} · {deck.length} cards</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="text-2xl font-bold text-green-700">{known.size}</div>
              <div className="text-sm text-green-700/80">Marked known</div>
            </div>
            <div className="rounded-lg bg-brand-50 p-4">
              <div className="text-2xl font-bold text-brand-700">{unsure.size}</div>
              <div className="text-sm text-brand-700/80">Marked unsure</div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={restart} className="btn btn-secondary">
              Restart deck
            </button>
            <button onClick={reshuffle} className="btn btn-secondary">
              Shuffle &amp; restart
            </button>
            <Link href="/flashcards" className="btn btn-primary">
              New selection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center justify-between text-sm text-brand-700/70">
        <span>{setLabel}</span>
        <span>{progress}</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${(index / deck.length) * 100}%` }}
        />
      </div>

      <div className="flip-card h-64 w-full cursor-pointer" onClick={() => setFlipped((f) => !f)}>
        <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
          <div className="flip-card-face card flex flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="badge">Term</span>
            <h2 className="text-3xl font-bold text-brand-900">{current.term}</h2>
            {current.partOfSpeech && (
              <span className="text-sm italic text-brand-700/60">{current.partOfSpeech}</span>
            )}
            <p className="mt-2 text-xs text-brand-700/50">Click card or press space to flip</p>
          </div>
          <div className="flip-card-face flip-card-back card flex flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="badge">Meaning</span>
            <p className="text-lg font-medium text-brand-900">{current.meaning}</p>
            {current.example && (
              <p className="mt-2 text-sm italic text-brand-700/70">&ldquo;{current.example}&rdquo;</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button onClick={goPrev} disabled={index === 0} className="btn btn-secondary">
          ← Prev
        </button>
        <div className="flex gap-2">
          <button onClick={() => markAndAdvance("unsure")} className="btn btn-secondary">
            Unsure
          </button>
          <button onClick={() => markAndAdvance("known")} className="btn btn-primary">
            Known ✓
          </button>
        </div>
        <button onClick={goNext} className="btn btn-secondary">
          Next →
        </button>
      </div>

      <div className="flex justify-center gap-3 text-sm">
        <button onClick={reshuffle} className="btn btn-ghost">
          Shuffle
        </button>
        <Link href="/flashcards" className="btn btn-ghost">
          Change selection
        </Link>
      </div>
    </div>
  );
}
