export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-2xl text-brand-900 md:text-3xl">About GREasy</h1>
        <p className="mt-1 text-brand-700/70">Flashcards &amp; exams built for focused GRE vocabulary practice.</p>
      </div>

      <div className="card p-6 md:p-8">
        <span className="table-head-cell !p-0">Built by</span>
        <p className="mt-2 text-lg font-semibold text-brand-900">The creator of GREasy</p>
        <p className="mt-2 max-w-2xl text-brand-700/80">
          GREasy is an independent project — a study tool built from a personal vocabulary set, mnemonics, and
          example sentences, turned into flashcards and exams for anyone preparing for the GRE.
        </p>

        <div className="mt-6 border-t border-[#e3dfda] pt-6">
          <span className="table-head-cell !p-0">Contact</span>
          <p className="mt-2">
            <a
              href="mailto:m.a.basar.mte@gmail.com"
              className="text-lg font-semibold text-brand-700 hover:underline"
            >
              m.a.basar.mte@gmail.com
            </a>
          </p>
          <p className="mt-1 text-sm text-brand-700/70">
            Questions, bug reports, or word-set contributions are welcome.
          </p>
        </div>
      </div>
    </div>
  );
}
