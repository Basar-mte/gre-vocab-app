import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { setUserRole, deleteUser } from "./actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { attempts: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Users</h1>
        <p className="mt-1 text-brand-700/70">Promote students to admin, or remove accounts.</p>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-brand-700/70">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Exams taken</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUser.id;
              return (
                <tr key={user.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/40">
                  <td className="px-4 py-3 font-medium text-brand-900">
                    {user.name} {isSelf && <span className="badge ml-1">You</span>}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="badge">{user.role}</span>
                  </td>
                  <td className="px-4 py-3">{user._count.attempts}</td>
                  <td className="px-4 py-3">
                    {!isSelf && (
                      <div className="flex items-center gap-3">
                        <form action={setUserRole}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="role" value={user.role === "ADMIN" ? "STUDENT" : "ADMIN"} />
                          <button type="submit" className="font-semibold text-brand-700 hover:underline">
                            {user.role === "ADMIN" ? "Make student" : "Make admin"}
                          </button>
                        </form>
                        <form action={deleteUser}>
                          <input type="hidden" name="userId" value={user.id} />
                          <ConfirmSubmitButton
                            message={`Delete ${user.name} (${user.email})? This also deletes their exam history.`}
                            className="font-semibold text-red-700 hover:underline"
                          >
                            Delete
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
