import { useState } from "react";
import { Building2, AppWindow, Footprints, Factory, HardHat, RefreshCw, ArrowUpRight, Check, Tag, MapPin } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { SERVICE_KEYS } from "@/i18n/translations";
import { IMAGES } from "@/config/site";
import { Reveal, SectionHeader } from "@/components/Reveal";
import { scrollToId } from "@/lib/scroll";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ICONS = {
  office: Building2,
  glass: AppWindow,
  stairwell: Footprints,
  industrial: Factory,
  construction: HardHat,
  maintenance: RefreshCw,
};

const ServiceCard = ({ k, item, featured, index, more, onOpen }) => {
  const Icon = ICONS[k];
  return (
    <Reveal
      delay={index * 0.06}
      className={`${featured ? "md:col-span-4 md:row-span-2" : "md:col-span-2"} h-full`}
    >
      <button
        data-testid={`service-card-${k}`}
        onClick={() => onOpen(k)}
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

const ServiceModal = ({ k, onClose }) => {
  const { t } = useLang();
  const open = Boolean(k);
  const Icon = k ? ICONS[k] : Building2;
  const item = k ? t.services.items[k] : null;
  const detail = k ? t.services.details[k] : null;

  const requestQuote = () => {
    onClose();
    setTimeout(() => scrollToId("contact"), 250);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-testid="service-modal"
        className="max-w-lg gap-0 overflow-hidden rounded-2xl border-slate-200 p-0"
      >
        {item && detail && (
          <>
            <div className="relative bg-navy px-7 pt-8 pb-7 text-white">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur text-white">
                <Icon className="h-5 w-5" />
              </span>
              <DialogHeader className="mt-4 space-y-1.5 text-left">
                <DialogTitle data-testid="service-modal-title" className="text-2xl font-bold tracking-tight text-white">
                  {item.title}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-slate-300">
                  {item.desc}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="max-h-[55vh] space-y-7 overflow-y-auto px-7 py-7">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-azure">
                  <Check className="h-3.5 w-3.5" /> {t.services.modal_scope}
                </p>
                <ul className="mt-3 space-y-2">
                  {detail.scope.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-azure">
                  <Tag className="h-3.5 w-3.5" /> {t.services.modal_pricing}
                </p>
                <p className="mt-2 rounded-xl bg-sky-soft px-4 py-3 text-sm leading-relaxed text-navy">
                  {detail.pricing}
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-azure">
                  <MapPin className="h-3.5 w-3.5" /> {t.services.modal_typical}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.typical.map((o) => (
                    <span key={o} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-7 py-5">
              <button
                type="button"
                data-testid="service-modal-cta"
                onClick={requestQuote}
                className="btn-spring shine-sweep inline-flex w-full items-center justify-center gap-2 rounded-full bg-azure px-8 py-3.5 text-sm font-bold text-white shadow-[0_20px_40px_-15px_rgba(30,123,242,0.6)] hover:bg-navy"
              >
                {t.services.modal_cta}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const Services = () => {
  const { t } = useLang();
  const [active, setActive] = useState(null);
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
            <ServiceCard key={k} k={k} item={t.services.items[k]} featured={i === 0} index={i} more={t.services.more} onOpen={setActive} />
          ))}
        </div>
      </div>

      <ServiceModal k={active} onClose={() => setActive(null)} />
    </section>
  );
};
