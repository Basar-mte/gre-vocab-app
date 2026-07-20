import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [setCount, wordCount, userCount, attemptCount, recentAttempts] = await Promise.all([
    prisma.vocabSet.count(),
    prisma.word.count(),
    prisma.user.count(),
    prisma.examAttempt.count({ where: { mode: "EXAM", completedAt: { not: null } } }),
    prisma.examAttempt.findMany({
      where: { mode: "EXAM", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-2xl text-brand-900 md:text-3xl">Admin overview</h1>
        <p className="mt-1 text-brand-700/70">Manage sets, words, users, and review activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sets" value={setCount} />
        <StatCard label="Words" value={wordCount} />
        <StatCard label="Users" value={userCount} />
        <StatCard label="Exams taken" value={attemptCount} />
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-900">Recent exam activity</h2>
          <Link href="/admin/sets" className="text-sm font-semibold text-brand-700 hover:underline">
            Manage sets →
          </Link>
        </div>
        {recentAttempts.length === 0 ? (
          <p className="text-sm text-brand-700/70">No exams taken yet.</p>
        ) : (
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3dfda]">
                <th className="table-head-cell">Student</th>
                <th className="table-head-cell">Date</th>
                <th className="table-head-cell">Sets</th>
                <th className="table-head-cell">Score</th>
              </tr>
            </thead>
            <tbody>
              {recentAttempts.map((a) => (
                <tr key={a.id} className="border-b border-[#f1eeea] last:border-0 hover:bg-[#f9f7f6]">
                  <td className="px-4 py-2.5">{a.user.name}</td>
                  <td className="px-4 py-2.5">{a.completedAt?.toLocaleDateString()}</td>
                  <td className="px-4 py-2.5">{JSON.parse(a.setNumbers).join(", ")}</td>
                  <td className="px-4 py-2.5 font-semibold text-brand-800">
                    {a.correctCount}/{a.totalQuestions} ({Math.round(a.scorePercent)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <div className="text-3xl font-extrabold text-brand-700">{value}</div>
      <div className="text-sm text-brand-700/70">{label}</div>
    </div>
  );
}
