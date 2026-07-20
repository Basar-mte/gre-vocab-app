import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Row = {
  set_number: string;
  set_title: string;
  term: string;
  meaning: string;
  mnemonic: string;
  part_of_speech: string;
  example: string;
  synonyms: string;
};

async function main() {
  const csvPath = path.join(__dirname, "data", "goldmine-import.csv");
  const text = fs.readFileSync(csvPath, "utf8");
  const parsed = Papa.parse<Row>(text, { header: true, skipEmptyLines: true });

  if (parsed.errors.length) {
    console.error("CSV parse errors:", parsed.errors.slice(0, 5));
    process.exitCode = 1;
    return;
  }

  const setCache = new Map<number, string>();
  let wordsCreated = 0;
  let wordsUpdated = 0;

  for (const row of parsed.data) {
    const setNumber = parseInt(row.set_number, 10);
    if (!setNumber || !row.term?.trim() || !row.meaning?.trim()) continue;

    let setId = setCache.get(setNumber);
    if (!setId) {
      const vocabSet = await prisma.vocabSet.upsert({
        where: { number: setNumber },
        update: { title: row.set_title?.trim() || `Set ${setNumber}` },
        create: { number: setNumber, title: row.set_title?.trim() || `Set ${setNumber}` },
      });
      setId = vocabSet.id;
      setCache.set(setNumber, setId);
    }

    const term = row.term.trim();
    const data = {
      meaning: row.meaning.trim(),
      mnemonic: row.mnemonic?.trim() || null,
      partOfSpeech: row.part_of_speech?.trim() || null,
      example: row.example?.trim() || null,
      synonyms: row.synonyms?.trim() || null,
    };

    const existing = await prisma.word.findUnique({ where: { setId_term: { setId, term } } });
    if (existing) {
      await prisma.word.update({ where: { id: existing.id }, data });
      wordsUpdated++;
    } else {
      await prisma.word.create({ data: { setId, term, ...data } });
      wordsCreated++;
    }
  }

  console.log(`Sets touched: ${setCache.size}. Words created: ${wordsCreated}, updated: ${wordsUpdated}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
