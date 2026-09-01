import { Sparkles } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

export const Marquee = () => {
  const { t } = useLang();
  const items = [...t.marquee, ...t.marquee];
  return (
    <div data-testid="editorial-marquee-ribbon" className="relative overflow-hidden border-y border-slate-200 bg-white py-5">
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-10 text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-slate-400">
            {item}
            <Sparkles className="h-4 w-4 text-azure" />
          </span>
        ))}
      </div>
    </div>
  );
};
