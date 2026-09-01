import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ArrowUpRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { SITE } from "@/config/site";
import { scrollToId } from "@/lib/scroll";

const LINKS = [
  ["about", "about"],
  ["services", "services"],
  ["how-it-works", "how_it_works"],
  ["advantages", "advantages"],
  ["reviews", "reviews"],
  ["faq", "faq"],
  ["contact", "contact"],
];

export const Navbar = () => {
  const { t, lang, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <motion.header
      data-testid="sticky-navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className={`fixed top-0 inset-x-0 z-50 glass-nav border-b transition-shadow duration-300 ${
        scrolled ? "border-slate-200 shadow-[0_8px_30px_-16px_rgba(11,42,111,0.25)]" : "border-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 h-[76px] flex items-center justify-between gap-6">
        <button data-testid="brand-logo" onClick={() => go("hero")} className="flex items-center gap-3 shrink-0">
          <img src={SITE.logo} alt={SITE.name} className="h-16 w-auto object-contain" />
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map(([id, key]) => (
            <button
              key={id}
              data-testid={`nav-link-${id}`}
              onClick={() => go(id)}
              className="relative px-4 py-2 text-sm font-semibold text-slate-700 hover:text-navy transition-colors group"
            >
              {t.nav[key]}
              <span className="absolute left-4 right-4 -bottom-0.5 h-[2px] bg-azure scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            data-testid="language-toggle-button"
            onClick={toggle}
            className="btn-spring inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-3.5 py-2 text-xs font-bold tracking-wider text-navy hover:border-azure"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className={lang === "DE" ? "text-azure" : "text-slate-400"}>DE</span>
            <span className="text-slate-300">/</span>
            <span className={lang === "EN" ? "text-azure" : "text-slate-400"}>EN</span>
          </button>
          <button
            data-testid="header-cta-button"
            onClick={() => go("contact")}
            className="btn-spring hidden sm:inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-azure shadow-lg shadow-navy/20"
          >
            {t.nav.cta}
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <Link
            data-testid="admin-link"
            to="/admin"
            className="hidden xl:inline-flex text-xs font-semibold text-slate-400 hover:text-navy transition-colors px-2"
          >
            {t.nav.admin}
          </Link>
          <button
            data-testid="mobile-menu-button"
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-navy"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-slate-200 bg-white/95"
          >
            <div className="px-5 py-4 flex flex-col">
              {LINKS.map(([id, key]) => (
                <button
                  key={id}
                  data-testid={`mobile-nav-link-${id}`}
                  onClick={() => go(id)}
                  className="text-left py-3 text-base font-semibold text-slate-800 border-b border-slate-100 last:border-0"
                >
                  {t.nav[key]}
                </button>
              ))}
              <Link to="/admin" className="py-3 text-sm font-semibold text-slate-400">
                {t.nav.admin}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
