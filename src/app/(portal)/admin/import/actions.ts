"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export type ImportRow = {
  setNumber: number;
  setTitle?: string;
  term: string;
  meaning: string;
  partOfSpeech?: string;
  example?: string;
  synonyms?: string;
};

export type ImportSummary = {
  setsCreated: number;
  wordsCreated: number;
  wordsUpdated: number;
  errors: string[];
};

export async function bulkImportWords(rows: ImportRow[]): Promise<ImportSummary> {
  await requireAdmin();

  const summary: ImportSummary = { setsCreated: 0, wordsCreated: 0, wordsUpdated: 0, errors: [] };
  const setCache = new Map<number, string>(); // setNumber -> setId

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowLabel = `Row ${i + 2}`; // +2 accounts for header row + 1-index

    if (!row.setNumber || Number.isNaN(row.setNumber)) {
      summary.errors.push(`${rowLabel}: missing/invalid set number.`);
      continue;
    }
    if (!row.term?.trim()) {
      summary.errors.push(`${rowLabel}: missing term.`);
      continue;
    }
    if (!row.meaning?.trim()) {
      summary.errors.push(`${rowLabel}: missing meaning.`);
      continue;
    }

    let setId = setCache.get(row.setNumber);
    if (!setId) {
      const existingSet = await prisma.vocabSet.findUnique({ where: { number: row.setNumber } });
      if (existingSet) {
        setId = existingSet.id;
      } else {
        const created = await prisma.vocabSet.create({
          data: {
            number: row.setNumber,
            title: row.setTitle?.trim() || `Set ${row.setNumber}`,
          },
        });
        setId = created.id;
        summary.setsCreated += 1;
      }
      setCache.set(row.setNumber, setId);
    }

    const existingWord = await prisma.word.findUnique({
      where: { setId_term: { setId, term: row.term.trim() } },
    });

    const data = {
      meaning: row.meaning.trim(),
      partOfSpeech: row.partOfSpeech?.trim() || null,
      example: row.example?.trim() || null,
      synonyms: row.synonyms?.trim() || null,
    };

    if (existingWord) {
      await prisma.word.update({ where: { id: existingWord.id }, data });
      summary.wordsUpdated += 1;
    } else {
      await prisma.word.create({ data: { setId, term: row.term.trim(), ...data } });
      summary.wordsCreated += 1;
    }
  }

  revalidatePath("/admin/sets");
  revalidatePath("/flashcards");
  revalidatePath("/exam");

  return summary;
}
