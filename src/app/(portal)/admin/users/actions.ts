"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function setUserRole(formData: FormData) {
  const admin = await requireAdmin();
  const userId = formData.get("userId");
  const role = formData.get("role");
  if (typeof userId !== "string" || (role !== "ADMIN" && role !== "STUDENT")) return;
  if (userId === admin.id) return; // can't change your own role from here

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const admin = await requireAdmin();
  const userId = formData.get("userId");
  if (typeof userId !== "string") return;
  if (userId === admin.id) return; // can't delete yourself

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
