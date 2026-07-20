export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="hero-band p-6 md:p-8">
        <div className="relative">
          <div className="hero-rule mb-3" />
          <h1 className="page-title text-2xl md:text-3xl">About GREasy</h1>
          <p className="mt-1 text-[#c9c5c1]">Flashcards &amp; exams built for focused GRE vocabulary practice.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-dark p-6 md:p-7">
          <span className="text-[11px] font-bold uppercase tracking-[.1em] text-[#f0d9d9]">Built by</span>
          <p className="mt-2 font-serif text-xl font-bold text-white">The creator of GREasy</p>
          <p className="mt-3 text-white/75">
            GREasy is an independent project — a study tool built from a personal vocabulary set, mnemonics, and
            example sentences, turned into flashcards and exams for anyone preparing for the GRE.
          </p>
        </div>

        <div className="card-accent p-6 md:p-7">
          <span className="text-[11px] font-bold uppercase tracking-[.1em] text-white/75">Contact</span>
          <p className="mt-2">
            <a href="mailto:m.a.basar.mte@gmail.com" className="font-serif text-xl font-bold text-white hover:underline">
              m.a.basar.mte@gmail.com
            </a>
          </p>
          <p className="mt-3 text-white/85">Questions, bug reports, or word-set contributions are welcome.</p>
        </div>
      </div>
    </div>
  );
}
