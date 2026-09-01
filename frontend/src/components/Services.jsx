import { Building2, AppWindow, Footprints, Factory, HardHat, RefreshCw, ArrowUpRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { SERVICE_KEYS } from "@/i18n/translations";
import { IMAGES } from "@/config/site";
import { Reveal, SectionHeader } from "@/components/Reveal";
import { scrollToId } from "@/lib/scroll";

const ICONS = {
  office: Building2,
  glass: AppWindow,
  stairwell: Footprints,
  industrial: Factory,
  construction: HardHat,
  maintenance: RefreshCw,
};

const ServiceCard = ({ k, item, featured, index, more }) => {
  const Icon = ICONS[k];
  return (
    <Reveal
      delay={index * 0.06}
      className={`${featured ? "md:col-span-4 md:row-span-2" : "md:col-span-2"} h-full`}
    >
      <button
        data-testid={`service-card-${k}`}
        onClick={() => scrollToId("contact")}
        className={`lift-card group relative h-full w-full text-left overflow-hidden rounded-2xl border border-slate-200 bg-white ${
          featured ? "min-h-[420px]" : "min-h-[220px]"
        }`}
      >
        {featured && (
          <>
            <img src={IMAGES.office} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/10" />
          </>
        )}
        <div className={`relative flex h-full flex-col justify-between p-7 ${featured ? "text-white" : ""}`}>
          <div className="flex items-start justify-between">
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${featured ? "bg-white/15 backdrop-blur text-white" : "bg-sky-soft text-navy"}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className={`font-mono text-xs ${featured ? "text-white/60" : "text-slate-400"}`}>0{index + 1}</span>
          </div>
          <div className="mt-8">
            <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${featured ? "text-white" : "text-slate-900"}`}>{item.title}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${featured ? "text-slate-200 max-w-md" : "text-slate-600"}`}>{item.desc}</p>
            <span className={`mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest ${featured ? "text-cyan-300" : "text-azure"}`}>
              {more}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </button>
    </Reveal>
  );
};

export const Services = () => {
  const { t } = useLang();
  return (
    <section id="services" data-testid="services-section" className="relative bg-paper py-24 lg:py-36 grain">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <SectionHeader tag={t.services.tag} title={t.services.title} subtitle={t.services.subtitle} />
          <Reveal delay={0.2}>
            <p className="font-display italic text-2xl text-slate-400 lg:text-right lg:max-w-xs">
              „{t.marquee[0]} — {t.marquee[5]}“
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid md:grid-cols-6 gap-5 auto-rows-fr">
          {SERVICE_KEYS.map((k, i) => (
            <ServiceCard key={k} k={k} item={t.services.items[k]} featured={i === 0} index={i} more={t.services.more} />
          ))}
        </div>
      </div>
    </section>
  );
};
