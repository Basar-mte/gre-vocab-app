import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import ExamRunner from "./exam-runner";

export default async function ExamTakePage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const user = await requireUser();

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: { orderBy: { order: "asc" } } },
  });

  if (!attempt || attempt.userId !== user.id) notFound();
  if (attempt.completedAt) redirect(`/exam/${attemptId}/result`);

  const questions = attempt.answers.map((a) => ({
    id: a.id,
    order: a.order,
    direction: a.direction,
    prompt: a.direction === "TERM_TO_MEANING" ? a.termSnapshot : a.meaningSnapshot,
    options: a.optionsJson ? (JSON.parse(a.optionsJson) as string[]) : null,
    userAnswer: a.userAnswer,
  }));

  return <ExamRunner attemptId={attempt.id} format={attempt.format} questions={questions} />;
}
