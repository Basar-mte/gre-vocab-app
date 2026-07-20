import ImportForm from "./import-form";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">CSV import</h1>
        <p className="mt-1 text-brand-700/70">
          Bring in your real word sets in bulk. Sets are created automatically if the number doesn&apos;t exist yet.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="mb-2 text-lg font-semibold text-brand-900">CSV format</h2>
        <p className="mb-3 text-sm text-brand-700/80">
          The first row must be a header. Required columns: <code className="rounded bg-brand-50 px-1">set_number</code>,{" "}
          <code className="rounded bg-brand-50 px-1">term</code>, <code className="rounded bg-brand-50 px-1">meaning</code>.
          Optional columns: <code className="rounded bg-brand-50 px-1">set_title</code>,{" "}
          <code className="rounded bg-brand-50 px-1">mnemonic</code>,{" "}
          <code className="rounded bg-brand-50 px-1">part_of_speech</code>,{" "}
          <code className="rounded bg-brand-50 px-1">example</code>,{" "}
          <code className="rounded bg-brand-50 px-1">synonyms</code>. Meaning and mnemonic can be in any language
          (e.g. Bengali) — they&apos;re stored and displayed as-is.
        </p>
        <p className="mb-3 text-sm text-brand-700/80">
          Re-importing a term that already exists in the same set updates it instead of duplicating it, so you can
          safely re-upload a corrected file.
        </p>
        <a href="/sample-import.csv" download className="btn btn-secondary text-sm">
          Download sample CSV
        </a>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-brand-900">Upload</h2>
        <ImportForm />
      </div>
    </div>
  );
}
