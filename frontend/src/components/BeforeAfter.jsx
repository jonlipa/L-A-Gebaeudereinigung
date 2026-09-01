import { useCallback, useEffect, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { Reveal, SectionHeader } from "@/components/Reveal";
import { BEFORE_AFTER } from "@/config/site";

const Slider = ({ before, after, beforeLabel, afterLabel, dragHint }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const update = useCallback((clientX) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      update(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const up = () => (dragging.current = false);
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, [update]);

  const start = (e) => {
    dragging.current = true;
    update(e.touches ? e.touches[0].clientX : e.clientX);
  };

  return (
    <div
      ref={ref}
      data-testid="before-after-slider"
      onMouseDown={start}
      onTouchStart={start}
      className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-3xl border border-slate-200 shadow-[0_30px_80px_-40px_rgba(11,42,111,0.5)] cursor-ew-resize bg-slate-100"
    >
      <img src={after} alt={afterLabel} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-navy backdrop-blur">
        {afterLabel}
      </span>

      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt={beforeLabel}
          draggable={false}
          style={{ width: ref.current ? ref.current.getBoundingClientRect().width : "100%" }}
          className="absolute inset-0 h-full max-w-none object-cover"
        />
        <span className="absolute left-4 top-4 z-10 rounded-full bg-navy/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
          {beforeLabel}
        </span>
      </div>

      <div className="absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_20px_rgba(0,0,0,0.4)]" style={{ left: `${pos}%` }}>
        <div
          data-testid="before-after-handle"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-navy shadow-lg ring-4 ring-white/40"
        >
          <MoveHorizontal className="h-5 w-5" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
        {dragHint}
      </div>
    </div>
  );
};

export const BeforeAfter = () => {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const item = t.gallery.items[active];
  const pair = BEFORE_AFTER[active];

  return (
    <section id="gallery" data-testid="gallery-section" className="relative bg-paper py-24 lg:py-36 overflow-hidden">
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <SectionHeader tag={t.gallery.tag} title={t.gallery.title} subtitle={t.gallery.subtitle} />

        <div className="mt-12 flex flex-wrap gap-3">
          {t.gallery.items.map((it, i) => (
            <button
              key={it.title}
              data-testid={`gallery-tab-${i}`}
              onClick={() => setActive(i)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                active === i
                  ? "bg-navy text-white"
                  : "border border-slate-300 bg-white text-slate-600 hover:border-navy"
              }`}
            >
              {it.title}
            </button>
          ))}
        </div>

        <div className="mt-8 grid lg:grid-cols-12 gap-10 items-center">
          <Reveal key={active} className="lg:col-span-8">
            <Slider
              before={pair.before}
              after={pair.after}
              beforeLabel={t.gallery.before}
              afterLabel={t.gallery.after}
              dragHint={t.gallery.drag}
            />
          </Reveal>
          <div className="lg:col-span-4">
            <Reveal delay={0.1}>
              <span className="font-display italic text-6xl leading-none text-navy/10">0{active + 1}</span>
              <h3 data-testid="gallery-item-title" className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {item.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-slate-600">{item.desc}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
