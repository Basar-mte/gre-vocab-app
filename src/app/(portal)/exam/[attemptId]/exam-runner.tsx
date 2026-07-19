"use client";

import { useMemo, useState, useTransition } from "react";
import { submitExamAnswer, finishExamAttempt } from "../actions";

type Question = {
  id: string;
  order: number;
  direction: "TERM_TO_MEANING" | "MEANING_TO_TERM" | "MIXED";
  prompt: string;
  options: string[] | null;
  userAnswer: string | null;
};

export default function ExamRunner({
  attemptId,
  format,
  questions,
}: {
  attemptId: string;
  format: "MULTIPLE_CHOICE" | "TYPED";
  questions: Question[];
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.userAnswer ?? ""]))
  );
  const [pending, startTransition] = useTransition();

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const answeredCount = useMemo(() => Object.values(answers).filter((v) => v.trim() !== "").length, [answers]);

  function setAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  async function persistCurrent() {
    const value = answers[current.id] ?? "";
    const fd = new FormData();
    fd.set("answerId", current.id);
    fd.set("value", value);
    await submitExamAnswer(fd);
  }

  function handleNext() {
    startTransition(async () => {
      await persistCurrent();
      setIndex((i) => Math.min(i + 1, questions.length - 1));
    });
  }

  function handlePrev() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  function handleFinish() {
    startTransition(async () => {
      await persistCurrent();
      await finishExamAttempt(attemptId);
    });
  }

  const directionLabel =
    current.direction === "TERM_TO_MEANING" ? "What does this word mean?" : "Which word means this?";

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center justify-between text-sm text-brand-700/70">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>{answeredCount} answered</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="card space-y-5 p-6">
        <div>
          <span className="badge">{directionLabel}</span>
          <h2 className="mt-3 text-2xl font-bold text-brand-900">{current.prompt}</h2>
        </div>

        {format === "MULTIPLE_CHOICE" && current.options ? (
          <div className="space-y-2">
            {current.options.map((option, i) => {
              const active = answers[current.id] === option;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAnswer(option)}
                  className={
                    "block w-full rounded-lg border px-4 py-3 text-left transition " +
                    (active
                      ? "border-brand-600 bg-brand-50 text-brand-900"
                      : "border-brand-100 bg-white text-brand-800 hover:border-brand-300")
                  }
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            value={answers[current.id] ?? ""}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer"
            className="input"
            autoFocus
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={handlePrev} disabled={index === 0 || pending} className="btn btn-secondary">
          ← Prev
        </button>
        {isLast ? (
          <button onClick={handleFinish} disabled={pending} className="btn btn-primary">
            {pending ? "Submitting…" : "Finish exam"}
          </button>
        ) : (
          <button onClick={handleNext} disabled={pending} className="btn btn-primary">
            {pending ? "Saving…" : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}
