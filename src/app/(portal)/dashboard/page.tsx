import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();

  const [setCount, wordCount, recentAttempts] = await Promise.all([
    prisma.vocabSet.count(),
    prisma.word.count(),
    prisma.examAttempt.findMany({
      where: { userId: user.id, mode: "EXAM", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Welcome back, {user.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-brand-700/70">
          {setCount} sets · {wordCount} words available to practice.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          href="/flashcards"
          title="Flashcards"
          description="Flip through terms and meanings at your own pace."
          cta="Study now"
        />
        <ActionCard
          href="/exam"
          title="Take an exam"
          description="Choose sets, a range, and how many words to be tested on."
          cta="Start exam"
        />
        <ActionCard
          href="/history"
          title="History"
          description="Review your past exam attempts and scores."
          cta="View history"
        />
        {user.role === "ADMIN" && (
          <ActionCard
            href="/admin"
            title="Admin Portal"
            description="Manage sets, words, users, and import CSV data."
            cta="Open admin"
          />
        )}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-900">Recent exam attempts</h2>
        {recentAttempts.length === 0 ? (
          <p className="text-sm text-brand-700/70">
            No exams yet. <Link href="/exam" className="font-semibold text-brand-700 hover:underline">Take your first exam</Link>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-brand-700/70">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Sets</th>
                  <th className="py-2 pr-4 font-medium">Questions</th>
                  <th className="py-2 pr-4 font-medium">Score</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-brand-50 last:border-0">
                    <td className="py-2 pr-4">{attempt.completedAt?.toLocaleDateString()}</td>
                    <td className="py-2 pr-4">{JSON.parse(attempt.setNumbers).join(", ")}</td>
                    <td className="py-2 pr-4">{attempt.totalQuestions}</td>
                    <td className="py-2 pr-4 font-semibold text-brand-800">
                      {attempt.correctCount}/{attempt.totalQuestions} ({Math.round(attempt.scorePercent)}%)
                    </td>
                    <td className="py-2">
                      <Link href={`/exam/${attempt.id}/result`} className="text-brand-700 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  cta,
}: {
  href: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link href={href} className="card flex flex-col gap-2 p-5 transition hover:border-brand-400 hover:shadow-md">
      <h3 className="font-semibold text-brand-900">{title}</h3>
      <p className="flex-1 text-sm text-brand-700/70">{description}</p>
      <span className="text-sm font-semibold text-brand-700">{cta} →</span>
    </Link>
  );
}
