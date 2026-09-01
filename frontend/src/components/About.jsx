import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { IMAGES } from "@/config/site";
import { Reveal, SectionHeader } from "@/components/Reveal";

const Counter = ({ value, suffix, label, id }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 40, damping: 20 });
  const decimals = Number.isInteger(value) ? 0 : 1;
  const display = useTransform(spring, (v) => v.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, mv, value]);
  return (
    <div ref={ref} data-testid={`stat-counter-${id}`} className="border-l-2 border-azure/40 pl-5">
      <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy tabular-nums">
        <motion.span>{display}</motion.span>
        <span className="text-azure">{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-slate-500 font-medium">{label}</p>
    </div>
  );
};

export const About = () => {
  const { t } = useLang();
  const imgRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="about" data-testid="about-section" className="relative bg-white py-24 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-14 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <div ref={imgRef} className="relative">
                  <div className="absolute -inset-3 border border-azure/30 clip-frame pointer-events-none" />
                  <div className="clip-frame overflow-hidden aspect-[4/5] bg-slate-100">
                    <motion.img
                      src={IMAGES.ropeCleaner}
                      alt={t.about.caption}
                      style={{ y: imgY, scale: 1.18 }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-6 -right-4 sm:right-8 bg-navy text-white px-5 py-3 text-xs font-mono tracking-wider max-w-[22ch] shadow-xl">
                    {t.about.caption}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-8">
            <SectionHeader tag={t.about.tag} title={t.about.title} subtitle={t.about.description} />

            <div className="mt-14 divide-y divide-slate-200">
              {t.about.chapters.map((c, i) => (
                <Reveal key={c.n} delay={i * 0.08}>
                  <div data-testid={`manifesto-chapter-${c.n}`} className="group grid sm:grid-cols-12 gap-4 py-8 hover:bg-paper transition-colors duration-300 -mx-4 px-4 rounded-xl">
                    <div className="sm:col-span-2">
                      <span className="font-display italic text-4xl text-azure/80 group-hover:text-azure transition-colors">{c.n}</span>
                    </div>
                    <div className="sm:col-span-10">
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{c.title}</h3>
                      <p className="mt-2 text-base text-slate-600 leading-relaxed max-w-xl">{c.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15}>
              <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
                {t.about.stats.map((s) => (
                  <Counter key={s.id} {...s} />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
