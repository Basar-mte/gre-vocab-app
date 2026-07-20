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
        <h1 className="page-title text-2xl text-brand-900 md:text-3xl">Welcome back, {user.name?.split(" ")[0]}</h1>
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
                <tr className="border-b border-[#e3dfda]">
                  <th className="table-head-cell !pl-0">Date</th>
                  <th className="table-head-cell">Sets</th>
                  <th className="table-head-cell">Questions</th>
                  <th className="table-head-cell">Score</th>
                  <th className="table-head-cell" />
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-[#f1eeea] last:border-0 hover:bg-[#f9f7f6]">
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
    <Link
      href={href}
      className="card flex flex-col gap-2 p-5 transition hover:-translate-y-0.5 hover:border-[#D32C32] hover:shadow-md"
    >
      <h3 className="font-semibold text-brand-900">{title}</h3>
      <p className="flex-1 text-sm text-brand-700/70">{description}</p>
      <span className="text-sm font-semibold text-[#D32C32]">{cta} →</span>
    </Link>
  );
}
