import { motion } from "framer-motion";
import { ClipboardCheck, FileText, Users, BadgeCheck } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { Reveal, SectionHeader } from "@/components/Reveal";

const ICONS = [ClipboardCheck, FileText, Users, BadgeCheck];

export const HowItWorks = () => {
  const { t } = useLang();
  return (
    <section id="how-it-works" data-testid="how-it-works-section" className="relative bg-navy-deep text-white py-24 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07] grid-lines [background-image:linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)]" />
      <div className="absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(30,123,242,0.35),transparent_65%)]" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <SectionHeader tag={t.how.tag} title={t.how.title} light />

        <div className="mt-20 relative grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block absolute top-7 left-0 right-0 h-px bg-gradient-to-r from-azure via-cyan-300 to-azure/20 origin-left"
          />
          {t.how.steps.map((s, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={s.id} delay={i * 0.12}>
                <div data-testid={`step-${i + 1}-${s.id}`} className="relative group">
                  <div className="flex items-center gap-4">
                    <span className="relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy-deep border-2 border-azure text-cyan-300 shadow-[0_0_30px_-6px_rgba(30,123,242,0.8)] transition-transform duration-500 group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="font-display italic text-6xl leading-none text-white/10 group-hover:text-azure/40 transition-colors duration-500">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl sm:text-2xl font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
