"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  buildMultipleChoiceOptions,
  isTypedAnswerCorrect,
  pickQuestionWords,
  resolveDirectionForQuestion,
  type Direction,
} from "@/lib/exam";

const createExamSchema = z.object({
  sets: z
    .string()
    .min(1, "Select at least one set")
    .transform((val) =>
      val
        .split(",")
        .map((n) => parseInt(n, 10))
        .filter((n) => !Number.isNaN(n))
    )
    .refine((arr) => arr.length > 0, "Select at least one set"),
  shuffle: z.string().optional(),
  count: z.coerce.number().int().min(1).max(500),
  direction: z.enum(["TERM_TO_MEANING", "MEANING_TO_TERM", "MIXED"]),
  format: z.enum(["MULTIPLE_CHOICE", "TYPED"]),
});

export type CreateExamState = {
  error?: string;
};

export async function createExamAttempt(
  _prevState: CreateExamState,
  formData: FormData
): Promise<CreateExamState> {
  const user = await requireUser();

  const parsed = createExamSchema.safeParse({
    sets: formData.get("sets"),
    shuffle: formData.get("shuffle") ?? undefined,
    count: formData.get("count"),
    direction: formData.get("direction"),
    format: formData.get("format"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid exam configuration." };
  }

  const { sets: setNumbers, count, direction, format } = parsed.data;
  const shuffle = parsed.data.shuffle === "true";

  const words = await prisma.word.findMany({
    where: { set: { number: { in: setNumbers } } },
  });

  if (words.length === 0) {
    return { error: "The selected sets don't have any words yet." };
  }

  const questionWords = pickQuestionWords(words, count, shuffle);

  // Broader pool for MCQ distractors: everything in the selected sets, and if
  // that isn't enough for 4 options, fall back to the whole word bank.
  let distractorSourceWords = words;
  if (distractorSourceWords.length < 4) {
    distractorSourceWords = await prisma.word.findMany();
  }

  const answersData = questionWords.map((word, index) => {
    const resolvedDirection = resolveDirectionForQuestion(direction as Direction);
    const correctAnswer = resolvedDirection === "TERM_TO_MEANING" ? word.meaning : word.term;

    let optionsJson: string | null = null;
    if (format === "MULTIPLE_CHOICE") {
      const distractorPool =
        resolvedDirection === "TERM_TO_MEANING"
          ? distractorSourceWords.map((w) => w.meaning)
          : distractorSourceWords.map((w) => w.term);
      const options = buildMultipleChoiceOptions(correctAnswer, distractorPool, 4);
      optionsJson = JSON.stringify(options);
    }

    return {
      wordId: word.id,
      order: index,
      direction: resolvedDirection,
      termSnapshot: word.term,
      meaningSnapshot: word.meaning,
      optionsJson,
    };
  });

  const attempt = await prisma.examAttempt.create({
    data: {
      userId: user.id,
      mode: "EXAM",
      direction,
      format,
      setNumbers: JSON.stringify(setNumbers),
      requestedCount: count,
      totalQuestions: answersData.length,
      answers: { create: answersData },
    },
  });

  redirect(`/exam/${attempt.id}`);
}

const submitAnswerSchema = z.object({
  answerId: z.string().min(1),
  value: z.string(),
});

export async function submitExamAnswer(formData: FormData) {
  const user = await requireUser();
  const parsed = submitAnswerSchema.safeParse({
    answerId: formData.get("answerId"),
    value: formData.get("value") ?? "",
  });
  if (!parsed.success) return;

  const answer = await prisma.examAnswer.findUnique({
    where: { id: parsed.data.answerId },
    include: { attempt: true },
  });
  if (!answer || answer.attempt.userId !== user.id) return;

  const correctAnswer = answer.direction === "TERM_TO_MEANING" ? answer.meaningSnapshot : answer.termSnapshot;
  const isCorrect = isTypedAnswerCorrect(parsed.data.value, correctAnswer);

  await prisma.examAnswer.update({
    where: { id: answer.id },
    data: { userAnswer: parsed.data.value, isCorrect },
  });
}

export async function finishExamAttempt(attemptId: string) {
  const user = await requireUser();
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: true },
  });
  if (!attempt || attempt.userId !== user.id) redirect("/exam");

  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const scorePercent = attempt.answers.length > 0 ? (correctCount / attempt.answers.length) * 100 : 0;

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: { correctCount, scorePercent, completedAt: new Date() },
  });

  redirect(`/exam/${attemptId}/result`);
}
