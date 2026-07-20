"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const wordSchema = z.object({
  setId: z.string().min(1),
  term: z.string().trim().min(1, "Term is required").max(120),
  meaning: z.string().trim().min(1, "Meaning is required").max(500),
  mnemonic: z.string().trim().max(500).optional(),
  partOfSpeech: z.string().trim().max(40).optional(),
  example: z.string().trim().max(500).optional(),
  synonyms: z.string().trim().max(300).optional(),
});

export type WordFormState = {
  error?: string;
};

export async function createWord(_prevState: WordFormState, formData: FormData): Promise<WordFormState> {
  await requireAdmin();

  const parsed = wordSchema.safeParse({
    setId: formData.get("setId"),
    term: formData.get("term"),
    meaning: formData.get("meaning"),
    mnemonic: formData.get("mnemonic") || undefined,
    partOfSpeech: formData.get("partOfSpeech") || undefined,
    example: formData.get("example") || undefined,
    synonyms: formData.get("synonyms") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid word." };
  }

  await prisma.word.create({ data: parsed.data });
  revalidatePath(`/admin/sets/${parsed.data.setId}`);
  return {};
}

const updateWordSchema = wordSchema.omit({ setId: true }).extend({ id: z.string().min(1) });

export async function updateWord(_prevState: WordFormState, formData: FormData): Promise<WordFormState> {
  await requireAdmin();

  const parsed = updateWordSchema.safeParse({
    id: formData.get("id"),
    term: formData.get("term"),
    meaning: formData.get("meaning"),
    mnemonic: formData.get("mnemonic") || undefined,
    partOfSpeech: formData.get("partOfSpeech") || undefined,
    example: formData.get("example") || undefined,
    synonyms: formData.get("synonyms") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid word." };
  }

  const { id, ...data } = parsed.data;
  const word = await prisma.word.update({ where: { id }, data });
  revalidatePath(`/admin/sets/${word.setId}`);
  return {};
}

export async function deleteWord(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  const word = await prisma.word.delete({ where: { id } });
  revalidatePath(`/admin/sets/${word.setId}`);
}

export async function deleteWords(setId: string, ids: string[]): Promise<void> {
  await requireAdmin();
  if (ids.length === 0) return;

  await prisma.word.deleteMany({ where: { id: { in: ids }, setId } });
  revalidatePath(`/admin/sets/${setId}`);
}
