"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FlashWord = {
  id: string;
  term: string;
  meaning: string;
  mnemonic?: string | null;
  example?: string | null;
  synonyms?: string | null;
  setNumber: number;
  setTitle: string;
};

type AvailableSet = {
  number: number;
  title: string;
  wordCount: number;
};

const MULTI_VALUE = "__multi";

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardViewer({
  words,
  setNumbers,
  availableSets,
}: {
  words: FlashWord[];
  setNumbers: number[];
  availableSets: AvailableSet[];
}) {
  const router = useRouter();
  const [order, setOrder] = useState<FlashWord[]>(words);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());

  const serialMap = useMemo(() => {
    const map = new Map<string, number>();
    words.forEach((w, i) => map.set(w.id, i + 1));
    return map;
  }, [words]);

  const current = order[pos];
  const empty = order.length === 0;

  function buildOrder(shuffle: boolean, knownSet: Set<string>, review: boolean) {
    let list = words;
    if (review) list = list.filter((w) => !knownSet.has(w.id));
    if (shuffle) list = shuffleArr(list);
    setOrder(list);
    setPos(0);
    setFlipped(false);
  }

  function move(step: number) {
    if (order.length === 0) return;
    setFlipped(false);
    setTimeout(() => {
      setPos((p) => (p + step + order.length) % order.length);
    }, 120);
  }

  function toggleKnown() {
    if (!current) return;
    setKnown((prev) => {
      const next = new Set(prev);
      const nowKnown = !next.has(current.id);
      if (nowKnown) next.add(current.id);
      else next.delete(current.id);

      if (reviewMode && nowKnown) {
        setOrder((prevOrder) => {
          const idx = prevOrder.findIndex((w) => w.id === current.id);
          if (idx === -1) return prevOrder;
          const copy = [...prevOrder];
          copy.splice(idx, 1);
          setPos((p) => (p >= copy.length ? 0 : p));
          return copy;
        });
        setFlipped(false);
      }
      return next;
    });
  }

  function markAgain() {
    if (!current) return;
    setKnown((prev) => {
      const next = new Set(prev);
      next.delete(current.id);
      return next;
    });
    move(1);
  }

  function handleShuffle() {
    buildOrder(true, known, reviewMode);
  }

  function handleToggleReview() {
    const nextReview = !reviewMode;
    setReviewMode(nextReview);
    buildOrder(false, known, nextReview);
  }

  function handleSetChange(value: string) {
    if (!value || value === MULTI_VALUE) return;
    router.push(`/flashcards/play?sets=${value}`);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "ArrowRight") move(1);
      else if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key.toLowerCase() === "k") toggleKnown();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, pos, known, reviewMode]);

  const synonymList = current?.synonyms
    ? current.synonyms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const setLabel = `Set${setNumbers.length > 1 ? "s" : ""} ${setNumbers.join(", ")}`;
  const dropdownValue = setNumbers.length === 1 ? String(setNumbers[0]) : MULTI_VALUE;

  return (
    <>
      <header className="study-header">
        <div className="study-brandmark" aria-hidden="true">
          K
        </div>
        <div className="mr-auto leading-[1.15]">
          <h1 className="font-serif text-xl font-bold tracking-[.2px]">GRE Vocabulary Flashcards</h1>
          <span className="text-[12.5px] uppercase tracking-[.14em] text-[#c9c5c1]">
            Goldmine &middot; Word &middot; Mnemonic &middot; Meaning
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="study-btn"
            title="Choose set"
            value={dropdownValue}
            onChange={(e) => handleSetChange(e.target.value)}
          >
            {dropdownValue === MULTI_VALUE && (
              <option value={MULTI_VALUE} disabled>
                {setLabel} (custom)
              </option>
            )}
            {availableSets.map((s) => (
              <option key={s.number} value={s.number}>
                Set {String(s.number).padStart(2, "0")} ({s.wordCount} words)
              </option>
            ))}
          </select>
          <button className="study-btn" onClick={handleShuffle} title="Shuffle cards in this set">
            Shuffle
          </button>
          <button
            className={`study-btn ${reviewMode ? "active" : ""}`}
            onClick={handleToggleReview}
            title="Show only cards not yet marked as known"
          >
            Review mode
          </button>
          <Link href="/flashcards" className="study-btn">
            Exit
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full min-h-0 max-w-[1180px] flex-1 flex-col items-center justify-center overflow-y-auto px-6 pb-8 pt-6">
        <div className="mb-[18px] flex w-full max-w-[820px] items-center gap-3.5">
          <span className="whitespace-nowrap text-[14.5px] font-semibold text-[#6e6a66]">
            <b className="text-[color:var(--color-ink)]">{empty ? 0 : pos + 1}</b> / {order.length}
          </span>
          <div className="study-bar-track flex-1">
            <div
              className="study-bar-fill"
              style={{ width: empty ? "0%" : `${((pos + 1) / order.length) * 100}%` }}
            />
          </div>
          <span className="whitespace-nowrap text-[14.5px] font-semibold text-[#1e7b4d]">{known.size} known</span>
        </div>

        {empty ? (
          <div className="mt-[60px] max-w-[460px] text-center text-[17px] leading-[1.7] text-[#6e6a66]">
            Every card here is marked as known. 🎉
            <br />
            Turn off <b>Review mode</b> to go through the set again.
          </div>
        ) : (
          <>
            <div className="study-scene min-h-[420px] w-full max-w-[820px] flex-1 lg:min-h-[min(60dvh,660px)]">
              <div
                className={`study-cardflip h-full min-h-[420px] w-full ${flipped ? "flipped" : ""}`}
                role="button"
                tabIndex={0}
                aria-label="Flashcard. Press Enter or Space to flip."
                onClick={() => setFlipped((f) => !f)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFlipped((f) => !f);
                  }
                }}
              >
                <div className="study-face front items-center justify-center px-[40px] py-16 text-center">
                  <span className="study-tab">#{serialMap.get(current.id)}</span>
                  <div>
                    <div className="mx-auto mb-[22px] h-[3px] w-[54px] bg-[color:var(--color-brand-500)]" />
                    <div className="study-word text-[clamp(48px,9vw,84px)]">{current.term}</div>
                    <div className="mt-4 text-[13px] uppercase tracking-[.2em] text-[#6e6a66]">
                      Set {current.setNumber} &middot; {current.setTitle}
                    </div>
                  </div>
                  <span className="study-hint">Tap to reveal</span>
                </div>

                <div className="study-face back overflow-y-auto px-[40px] pb-[48px] pt-[56px]">
                  <span className="study-tab">#{serialMap.get(current.id)}</span>
                  <div className="study-word mb-4 text-3xl">{current.term}</div>

                  <div className="mb-4">
                    <span className="study-eyebrow">Meaning</span>
                    <div className="study-meaning">{current.meaning}</div>
                  </div>

                  {current.mnemonic && (
                    <div className="mb-4">
                      <span className="study-eyebrow">Mnemonic</span>
                      <div className="study-mnemonic">{current.mnemonic}</div>
                    </div>
                  )}

                  {current.example && (
                    <div className="mb-4">
                      <span className="study-eyebrow">Sentence</span>
                      <div className="study-sentence">&ldquo;{current.example}&rdquo;</div>
                    </div>
                  )}

                  <div className="mb-[26px]">
                    <span className="study-eyebrow">Synonyms</span>
                    <div className="flex flex-wrap gap-2">
                      {synonymList.length === 0 ? (
                        <span className="text-[14.5px] italic text-[#6e6a66]">— none listed —</span>
                      ) : (
                        synonymList.map((s, i) => (
                          <span key={i} className="study-syn">
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-[22px] flex items-center gap-3">
              <button className="study-navbtn" onClick={() => move(-1)} aria-label="Previous card">
                ← Prev
              </button>
              <button className="study-navbtn primary" onClick={() => setFlipped((f) => !f)}>
                {flipped ? "Show word" : "Flip card"}
              </button>
              <button className="study-navbtn" onClick={() => move(1)} aria-label="Next card">
                Next →
              </button>
            </div>

            <div className="mt-4 flex gap-2.5">
              <button
                className={`study-markbtn know ${known.has(current.id) ? "on" : ""}`}
                onClick={toggleKnown}
              >
                {known.has(current.id) ? "✓ Known" : "✓ I know this"}
              </button>
              <button className="study-markbtn again" onClick={markAgain}>
                ↻ Review again
              </button>
            </div>

            <div className="mt-[18px] text-center text-[13px] tracking-[.04em] text-[#a29d98]">
              <kbd className="study-kbd">←</kbd> <kbd className="study-kbd">→</kbd> navigate &nbsp;&middot;&nbsp;{" "}
              <kbd className="study-kbd">Space</kbd> flip &nbsp;&middot;&nbsp; <kbd className="study-kbd">K</kbd> known
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-[#e3dfda] px-[14px] py-3.5 text-center text-[12.5px] tracking-[.06em] text-[#a29d98]">
        <b className="text-[color:var(--color-brand-500)]">GREasy</b> &middot; {setLabel} loaded
      </footer>
    </>
  );
}
