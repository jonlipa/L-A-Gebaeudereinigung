import { Clock, Leaf, UserCheck, ShieldCheck, Receipt, Quote } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { IMAGES } from "@/config/site";
import { Reveal, SectionHeader } from "@/components/Reveal";

const ICONS = { 247: Clock, eco: Leaf, staff: UserCheck, insured: ShieldCheck, pricing: Receipt };

export const Advantages = () => {
  const { t } = useLang();
  const items = t.advantages.items;
  return (
    <section id="advantages" data-testid="advantages-section" className="relative bg-white py-24 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <SectionHeader tag={t.advantages.tag} title={t.advantages.title} />

        <div className="mt-14 grid md:grid-cols-6 gap-5">
          <Reveal className="md:col-span-2 md:row-span-2">
            <div className="relative h-full min-h-[380px] overflow-hidden rounded-2xl clip-frame-alt">
              <img src={IMAGES.corridor} alt="Corridor" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <Quote className="h-6 w-6 text-cyan-300" />
                <p className="mt-3 font-display italic text-xl leading-snug">{t.advantages.quote}</p>
                <p className="mt-3 text-xs uppercase tracking-widest text-slate-300">— {t.advantages.quoteBy}</p>
              </div>
            </div>
          </Reveal>

          {items.map((a, i) => {
            const Icon = ICONS[a.id];
            const wide = i === 0;
            return (
              <Reveal key={a.id} delay={i * 0.07} className={wide ? "md:col-span-4" : "md:col-span-2"}>
                <div
                  data-testid={`advantage-card-${a.id}`}
                  className={`lift-card group h-full rounded-2xl border border-slate-200 p-7 ${
                    wide ? "bg-sky-soft flex flex-col sm:flex-row sm:items-center gap-6" : "bg-paper"
                  }`}
                >
                  <span className={`inline-flex shrink-0 h-12 w-12 items-center justify-center rounded-xl bg-navy text-white transition-transform duration-500 group-hover:rotate-6 ${wide ? "sm:h-16 sm:w-16" : ""}`}>
                    <Icon className={wide ? "h-7 w-7" : "h-5 w-5"} />
                  </span>
                  <div className={wide ? "" : "mt-6"}>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{a.title}</h3>
                    <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
