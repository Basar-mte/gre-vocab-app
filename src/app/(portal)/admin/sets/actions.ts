"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const createSetSchema = z.object({
  number: z.coerce.number().int().min(1, "Set number must be at least 1").max(999),
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional(),
  color: z.string().trim().max(20).optional(),
});

export type SetFormState = {
  error?: string;
};

export async function createSet(_prevState: SetFormState, formData: FormData): Promise<SetFormState> {
  await requireAdmin();

  const parsed = createSetSchema.safeParse({
    number: formData.get("number"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid set." };
  }

  const existing = await prisma.vocabSet.findUnique({ where: { number: parsed.data.number } });
  if (existing) {
    return { error: `Set number ${parsed.data.number} already exists.` };
  }

  await prisma.vocabSet.create({ data: parsed.data });
  revalidatePath("/admin/sets");
  revalidatePath("/flashcards");
  revalidatePath("/exam");
  return {};
}

export async function deleteSet(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.vocabSet.delete({ where: { id } });
  revalidatePath("/admin/sets");
  revalidatePath("/flashcards");
  revalidatePath("/exam");
}

const updateSetSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional(),
  color: z.string().trim().max(20).optional(),
});

export async function updateSet(_prevState: SetFormState, formData: FormData): Promise<SetFormState> {
  await requireAdmin();

  const parsed = updateSetSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid set." };
  }

  const { id, ...data } = parsed.data;
  await prisma.vocabSet.update({ where: { id }, data });
  revalidatePath("/admin/sets");
  revalidatePath(`/admin/sets/${id}`);
  return {};
}
