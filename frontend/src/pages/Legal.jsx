import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { SITE } from "@/config/site";

export default function Legal({ doc }) {
  const { t, lang, toggle } = useLang();
  const page = t.legal[doc];

  return (
    <div data-testid={`legal-page-${doc}`} className="min-h-screen bg-paper">
      <header className="glass-nav border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 h-[68px] flex items-center justify-between">
          <Link data-testid="legal-logo-link" to="/" className="flex items-center gap-3">
            <img src={SITE.logo} alt={SITE.name} className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <button data-testid="legal-language-toggle" onClick={toggle} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-navy">
              {lang === "DE" ? "EN" : "DE"}
            </button>
            <Link data-testid="legal-back-link" to="/" className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-azure transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.legal.back}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-12 py-16">
        <p className="overline flex items-center gap-3">
          <span className="h-px w-8 bg-azure inline-block" />
          {t.footer.legal}
        </p>
        <h1 data-testid="legal-title" className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          {page.title}
        </h1>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t.legal.demo_note}
        </div>

        <div className="mt-12 space-y-10">
          {page.sections.map((s) => (
            <section key={s.heading} data-testid="legal-section">
              <h2 className="text-lg font-bold text-navy">{s.heading}</h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-slate-600">{s.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-16 border-t border-slate-200 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} {SITE.name} · {t.footer.demo}
        </p>
      </main>
    </div>
  );
}
