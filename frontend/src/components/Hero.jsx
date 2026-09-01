import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { IMAGES, SITE } from "@/config/site";
import { SplitLines } from "@/components/Reveal";
import { scrollToId } from "@/lib/scroll";

const EASE = [0.22, 1, 0.36, 1];
const fade = (delay) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE },
});

const GlassCard = ({ t }) => {
  const ref = useRef(null);
  const mx = useMotionValue(0.45);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 90, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), spring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), spring);
  const wipe = useSpring(useTransform(mx, [0, 1], [4, 96]), { stiffness: 120, damping: 22 });
  const clip = useTransform(wipe, (v) => `inset(0 ${100 - v}% 0 0)`);
  const squeegeeLeft = useTransform(wipe, (v) => `${v}%`);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    mx.set(0.45);
    my.set(0.5);
  };

  return (
    <div style={{ perspective: 1400 }} className="relative">
      <motion.div
        ref={ref}
        data-testid="hero-interactive-glass-card"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative aspect-[4/5] sm:aspect-[5/6] w-full overflow-hidden rounded-[28px] border border-white/60 bg-slate-200 shadow-[0_50px_100px_-40px_rgba(11,42,111,0.45)] cursor-crosshair select-none"
      >
        <img
          src={IMAGES.hero}
          alt="Facade"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "grayscale(0.7) blur(2.5px) brightness(0.78) contrast(0.9)" }}
          draggable={false}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)] mix-blend-overlay" />
        <motion.img
          src={IMAGES.hero}
          alt="Clean facade"
          style={{ clipPath: clip }}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <motion.div style={{ left: squeegeeLeft }} className="absolute top-0 bottom-0 -ml-[2px] w-[4px] bg-white shadow-[0_0_24px_6px_rgba(255,255,255,0.8)]">
          <div className="absolute top-1/2 -translate-y-1/2 -left-[22px] h-14 w-12 rounded-md bg-navy/90 border border-white/40 shadow-xl flex items-center justify-center">
            <div className="h-10 w-[3px] bg-cyan-300 rounded-full" />
          </div>
        </motion.div>
        <div className="absolute left-5 top-5 rounded-full bg-white/85 backdrop-blur px-3 py-1 text-[11px] font-bold tracking-widest uppercase text-navy">
          {t.hero.after}
        </div>
        <div className="absolute right-5 top-5 rounded-full bg-slate-900/60 backdrop-blur px-3 py-1 text-[11px] font-bold tracking-widest uppercase text-white">
          {t.hero.before}
        </div>
      </motion.div>
      <p className="mt-4 text-xs text-slate-500 leading-relaxed text-center font-mono">{t.hero.hint}</p>

      <motion.div
        {...fade(1.1)}
        data-testid="hero-experience-badge"
        className="absolute -left-6 sm:-left-10 bottom-20 rounded-2xl bg-white border border-slate-200 shadow-[0_30px_60px_-30px_rgba(11,42,111,0.4)] px-5 py-4 flex items-center gap-4"
      >
        <span className="font-display italic text-5xl leading-none text-navy">20</span>
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-azure">+</p>
          <p className="text-sm font-semibold text-slate-700 leading-tight">{t.hero.years}</p>
        </div>
      </motion.div>

      <motion.div
        {...fade(1.25)}
        className="absolute -right-4 sm:-right-8 top-10 rounded-full bg-navy text-white shadow-xl px-4 py-2 flex items-center gap-2 text-xs font-bold"
      >
        <Sparkles className="h-4 w-4 text-cyan-300" />
        ECO
      </motion.div>
    </div>
  );
};

export const Hero = () => {
  const { t, lang } = useLang();
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 800], [0, 110]);
  const textY = useTransform(scrollY, [0, 800], [0, -40]);

  return (
    <section id="hero" data-testid="hero-section" className="relative overflow-hidden bg-paper grid-lines pt-[76px]">
      <div className="absolute -top-40 -right-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(30,123,242,0.18),transparent_65%)]" />
      <div className="absolute -bottom-32 -left-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(11,42,111,0.12),transparent_65%)]" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-16 lg:py-24 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <motion.div style={{ y: textY }} className="lg:col-span-7 relative z-10">
          <motion.div
            {...fade(0.4)}
            data-testid="hero-badge"
            className="inline-flex items-center gap-2 rounded-full border border-azure/30 bg-white px-4 py-1.5 text-xs font-bold tracking-wider uppercase text-navy"
          >
            <ShieldCheck className="h-4 w-4 text-azure" />
            {t.hero.badge}
          </motion.div>

          <SplitLines
            key={lang}
            data-testid="hero-title"
            lines={t.hero.titleLines}
            delay={0.5}
            className="mt-7 text-4xl sm:text-5xl lg:text-6xl xl:text-[4.9rem] font-extrabold tracking-[-0.03em] leading-[1.02] text-slate-900"
          />

          <motion.p
            key={`sub-${lang}`}
            {...fade(0.95)}
            data-testid="hero-subtitle"
            className="mt-7 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div {...fade(1.1)} className="mt-9 flex flex-wrap items-center gap-4">
            <button
              data-testid="hero-cta-primary"
              onClick={() => scrollToId("contact")}
              className="btn-spring shine-sweep inline-flex items-center gap-2 rounded-full bg-azure px-7 py-3.5 text-sm font-bold text-white shadow-[0_20px_40px_-15px_rgba(30,123,242,0.6)] hover:bg-navy"
            >
              {t.hero.cta_primary}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              data-testid="hero-cta-secondary"
              onClick={() => scrollToId("services")}
              className="btn-spring inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-navy hover:border-navy"
            >
              {t.hero.cta_secondary}
            </button>
          </motion.div>

          <motion.div {...fade(1.3)} className="mt-14 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">{t.hero.trusted}</p>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
              {t.hero.trustedItems.map((item) => (
                <span key={item} className="font-display italic text-lg text-slate-500">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: EASE }}
          style={{ y: parallaxY }}
          className="lg:col-span-5 relative px-6 sm:px-10 lg:px-4"
        >
          <GlassCard t={t} />
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 pb-8 flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-widest">
        <span>{SITE.serviceArea[lang]}</span>
        <span>Est. {SITE.foundedYear}</span>
      </div>
    </section>
  );
};
