import { Star, Quote, ExternalLink } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { REVIEWS, SITE } from "@/config/site";
import { Reveal, SectionHeader } from "@/components/Reveal";

const GoogleG = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.3 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z" />
    <path fill="#FBBC05" d="M10.5 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.5-5.7l-7.6-5.9c-2.1 1.4-4.8 2.3-7.9 2.3-6.3 0-11.6-3.8-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

const Stars = ({ n, size = "h-3.5 w-3.5" }) => (
  <span className="inline-flex gap-0.5" aria-label={`${n} / 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`${size} ${i <= n ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
    ))}
  </span>
);

const ReviewCard = ({ r, lang }) => (
  <article
    data-testid="review-card"
    className="lift-card group relative w-[320px] sm:w-[380px] shrink-0 rounded-2xl border border-slate-200 bg-white p-7 flex flex-col"
  >
    <Quote className="absolute right-6 top-6 h-8 w-8 text-sky-soft group-hover:text-azure/30 transition-colors" />
    <Stars n={r.rating} />
    <p className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">„{r.text[lang]}“</p>
    <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-bold text-sm text-white">
        {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900">{r.name}</p>
        <p className="truncate text-xs text-slate-500">{r.role[lang]} · {r.city}</p>
      </div>
      <GoogleG className="ml-auto h-4 w-4 shrink-0 opacity-70" />
    </div>
  </article>
);

export const Testimonials = () => {
  const { t, lang } = useLang();
  const items = [...REVIEWS.items, ...REVIEWS.items];
  return (
    <section id="reviews" data-testid="testimonials-section" className="relative overflow-hidden bg-paper py-24 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <SectionHeader tag={t.reviews.tag} title={t.reviews.title} subtitle={t.reviews.subtitle} />
          <Reveal delay={0.2}>
            <a
              href={REVIEWS.profileUrl}
              target="_blank"
              rel="noreferrer"
              data-testid="google-rating-badge"
              className="lift-card inline-flex items-center gap-5 rounded-2xl border border-slate-200 bg-white px-6 py-5"
            >
              <GoogleG className="h-9 w-9" />
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">{REVIEWS.average.toFixed(1)}</span>
                  <Stars n={Math.round(REVIEWS.average)} size="h-4 w-4" />
                </div>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  {REVIEWS.count} {t.reviews.google_label}
                  <ExternalLink className="h-3 w-3" />
                </p>
              </div>
            </a>
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.15} className="mt-14">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper to-transparent" />
          <div data-testid="reviews-track" className="marquee-track reviews-track flex w-max items-stretch gap-5 px-5">
            {items.map((r, i) => (
              <ReviewCard key={`${r.name}-${i}`} r={r} lang={lang} />
            ))}
          </div>
        </div>
      </Reveal>

      {SITE.isDemo && (
        <p data-testid="reviews-demo-note" className="mx-auto mt-10 max-w-[1440px] px-5 sm:px-8 lg:px-12 font-mono text-xs text-slate-400">
          {t.reviews.demo_note}
        </p>
      )}
    </section>
  );
};
