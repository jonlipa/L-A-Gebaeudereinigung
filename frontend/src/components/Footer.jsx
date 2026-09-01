import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import { SITE } from "@/config/site";
import { scrollToId } from "@/lib/scroll";

const NAV = [
  ["about", "about"],
  ["services", "services"],
  ["how-it-works", "how_it_works"],
  ["advantages", "advantages"],
  ["faq", "faq"],
  ["contact", "contact"],
];

export const Footer = () => {
  const { t, lang, toggle } = useLang();
  return (
    <footer data-testid="footer-section" className="relative bg-navy-deep text-white overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 pt-20 pb-10">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div data-testid="footer-logo" className="inline-block rounded-2xl bg-white p-3">
              <img src={SITE.logo} alt={SITE.name} className="h-14 w-auto" />
            </div>
            <p className="mt-6 max-w-sm text-sm text-slate-400 leading-relaxed">{t.footer.desc}</p>
            <button
              data-testid="footer-language-toggle"
              onClick={toggle}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold tracking-wider hover:border-cyan-300 transition-colors"
            >
              <span className={lang === "DE" ? "text-cyan-300" : "text-slate-500"}>DE</span>
              <span className="text-slate-600">/</span>
              <span className={lang === "EN" ? "text-cyan-300" : "text-slate-500"}>EN</span>
            </button>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-[0.22em] font-bold text-slate-500">{t.footer.nav}</p>
            <ul className="mt-5 space-y-3">
              {NAV.map(([id, key]) => (
                <li key={id}>
                  <button data-testid={`footer-nav-${id}`} onClick={() => scrollToId(id)} className="text-sm text-slate-300 hover:text-white transition-colors">
                    {t.nav[key]}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs uppercase tracking-[0.22em] font-bold text-slate-500">{t.footer.contact}</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li data-testid="footer-address-placeholder">
                {SITE.address.street}
                <br />
                {SITE.address.city}, {SITE.address.country}
              </li>
              <li>
                <a data-testid="footer-phone-placeholder" href={SITE.phoneHref} className="hover:text-white transition-colors">{SITE.phone}</a>
              </li>
              <li>
                <a data-testid="footer-email-placeholder" href={`mailto:${SITE.email}`} className="hover:text-white transition-colors">{SITE.email}</a>
              </li>
              <li className="text-slate-500 text-xs pt-2">{SITE.hours[lang]}</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-[0.22em] font-bold text-slate-500">{t.footer.legal}</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li><Link data-testid="footer-impressum-link" to="/impressum" className="hover:text-white transition-colors">{t.footer.impressum}</Link></li>
              <li><Link data-testid="footer-privacy-link" to="/datenschutz" className="hover:text-white transition-colors">{t.footer.privacy}</Link></li>
              <li><Link data-testid="footer-terms-link" to="/agb" className="hover:text-white transition-colors">{t.footer.terms}</Link></li>
              <li><Link data-testid="footer-admin-link" to="/admin" className="text-slate-500 hover:text-white transition-colors">{t.nav.admin}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 select-none leading-none">
          <p className="font-display italic text-[22vw] md:text-[16vw] tracking-tight text-white/[0.04] whitespace-nowrap -mb-[0.2em]">L&amp;A</p>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {SITE.name} · {t.footer.rights}</p>
          <p className="font-mono">{t.footer.demo}</p>
        </div>
      </div>
    </footer>
  );
};
