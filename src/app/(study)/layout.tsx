import { requireUser } from "@/lib/session";

export default async function StudyLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <div className="study-shell">{children}</div>;
}
