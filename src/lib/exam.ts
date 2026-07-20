import type { Word } from "@prisma/client";

export type Direction = "TERM_TO_MEANING" | "MEANING_TO_TERM" | "MIXED";
export type ResolvedDirection = "TERM_TO_MEANING" | "MEANING_TO_TERM";

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickQuestionWords<T extends Word>(allWords: T[], count: number, shuffle: boolean): T[] {
  const pool = shuffle ? shuffleArray(allWords) : allWords;
  return pool.slice(0, Math.max(0, Math.min(count, pool.length)));
}

export function resolveDirectionForQuestion(direction: Direction): ResolvedDirection {
  if (direction === "MIXED") {
    return Math.random() < 0.5 ? "TERM_TO_MEANING" : "MEANING_TO_TERM";
  }
  return direction;
}

export function buildMultipleChoiceOptions(
  correct: string,
  distractorPool: string[],
  optionCount = 4
): string[] {
  const uniqueDistractors = Array.from(new Set(distractorPool.filter((d) => d.trim() !== correct.trim())));
  const chosenDistractors = shuffleArray(uniqueDistractors).slice(0, Math.max(0, optionCount - 1));
  return shuffleArray([correct, ...chosenDistractors]);
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isTypedAnswerCorrect(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}
