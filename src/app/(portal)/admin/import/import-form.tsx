"use client";

import { useState, useTransition } from "react";
import Papa from "papaparse";
import { bulkImportWords, type ImportRow, type ImportSummary } from "./actions";

const HEADER_ALIASES: Record<string, keyof ImportRow> = {
  set_number: "setNumber",
  setnumber: "setNumber",
  set: "setNumber",
  set_title: "setTitle",
  settitle: "setTitle",
  title: "setTitle",
  term: "term",
  word: "term",
  meaning: "meaning",
  definition: "meaning",
  mnemonic: "mnemonic",
  mnemonics: "mnemonic",
  memory_trick: "mnemonic",
  part_of_speech: "partOfSpeech",
  partofspeech: "partOfSpeech",
  pos: "partOfSpeech",
  example: "example",
  sentence: "example",
  synonyms: "synonyms",
  synonym: "synonyms",
};

function normalizeHeader(header: string): keyof ImportRow | null {
  const key = header.trim().toLowerCase().replace(/\s+/g, "_");
  return HEADER_ALIASES[key] ?? null;
}

export default function ImportForm() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(file: File) {
    setFileName(file.name);
    setSummary(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fieldMap = new Map<string, keyof ImportRow>();
        for (const header of results.meta.fields ?? []) {
          const mapped = normalizeHeader(header);
          if (mapped) fieldMap.set(header, mapped);
        }

        const parsedRows: ImportRow[] = [];
        const errors: string[] = [];

        results.data.forEach((raw, i) => {
          const row: Partial<ImportRow> = {};
          for (const [header, value] of Object.entries(raw)) {
            const field = fieldMap.get(header);
            if (!field) continue;
            if (field === "setNumber") {
              const num = parseInt(String(value).trim(), 10);
              if (!Number.isNaN(num)) row.setNumber = num;
            } else {
              (row as Record<string, string>)[field] = String(value ?? "").trim();
            }
          }

          if (!row.setNumber || !row.term || !row.meaning) {
            errors.push(`Row ${i + 2}: missing required field(s) (set_number, term, meaning).`);
            return;
          }

          parsedRows.push(row as ImportRow);
        });

        setRows(parsedRows);
        setParseErrors(errors);
      },
      error: (err) => {
        setParseErrors([err.message]);
      },
    });
  }

  function handleImport() {
    startTransition(async () => {
      const result = await bulkImportWords(rows);
      setSummary(result);
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">CSV file</label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="input"
        />
        {fileName && <p className="mt-1 text-xs text-brand-700/60">Selected: {fileName}</p>}
      </div>

      {parseErrors.length > 0 && (
        <div className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
          <p className="font-semibold">Some rows couldn&apos;t be read:</p>
          <ul className="mt-1 list-inside list-disc">
            {parseErrors.slice(0, 10).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
          {parseErrors.length > 10 && <p className="mt-1">…and {parseErrors.length - 10} more.</p>}
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-brand-900">
            Parsed {rows.length} valid row{rows.length === 1 ? "" : "s"}. Preview (first 10):
          </p>
          <div className="overflow-x-auto rounded-lg border border-brand-100">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead>
                <tr className="border-b border-brand-100 bg-brand-50 text-brand-700">
                  <th className="px-3 py-2">Set #</th>
                  <th className="px-3 py-2">Term</th>
                  <th className="px-3 py-2">Meaning</th>
                  <th className="px-3 py-2">Mnemonic</th>
                  <th className="px-3 py-2">POS</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-brand-50 last:border-0">
                    <td className="px-3 py-2">{row.setNumber}</td>
                    <td className="px-3 py-2 font-medium">{row.term}</td>
                    <td className="px-3 py-2">{row.meaning}</td>
                    <td className="px-3 py-2">{row.mnemonic ?? "—"}</td>
                    <td className="px-3 py-2">{row.partOfSpeech ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={handleImport} disabled={pending} className="btn btn-primary">
            {pending ? "Importing…" : `Import ${rows.length} row${rows.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      {summary && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
          <p className="font-semibold">Import complete</p>
          <p>
            {summary.setsCreated} set{summary.setsCreated === 1 ? "" : "s"} created · {summary.wordsCreated} word
            {summary.wordsCreated === 1 ? "" : "s"} created · {summary.wordsUpdated} updated
          </p>
          {summary.errors.length > 0 && (
            <div className="mt-2 text-amber-800">
              <p className="font-semibold">{summary.errors.length} row(s) skipped:</p>
              <ul className="mt-1 list-inside list-disc">
                {summary.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
