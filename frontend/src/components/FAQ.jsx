import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLang } from "@/i18n/LanguageContext";
import { Reveal, SectionHeader } from "@/components/Reveal";
import { scrollToId } from "@/lib/scroll";
import { ArrowRight } from "lucide-react";

export const FAQ = () => {
  const { t } = useLang();
  return (
    <section id="faq" data-testid="faq-section" className="relative bg-paper py-24 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeader tag={t.faq.tag} title={t.faq.title} />
            <Reveal delay={0.25}>
              <button
                data-testid="faq-contact-button"
                onClick={() => scrollToId("contact")}
                className="btn-spring mt-8 inline-flex items-center gap-2 rounded-full border border-navy px-6 py-3 text-sm font-bold text-navy hover:bg-navy hover:text-white"
              >
                {t.nav.cta}
                <ArrowRight className="h-4 w-4" />
              </button>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-8">
          <Reveal>
            <Accordion type="single" collapsible className="divide-y divide-slate-200 border-y border-slate-200">
              {t.faq.items.map((f, i) => (
                <AccordionItem key={i} value={`q${i}`} data-testid={`faq-accordion-item-${i + 1}`} className="border-0">
                  <AccordionTrigger className="py-6 text-left text-base sm:text-lg font-bold text-slate-900 hover:text-navy hover:no-underline [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-azure">
                    <span className="flex gap-5">
                      <span className="font-mono text-xs text-slate-400 pt-1.5">0{i + 1}</span>
                      {f.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-10 text-base text-slate-600 leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
