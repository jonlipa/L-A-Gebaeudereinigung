import { createContext, useContext, useMemo, useState } from "react";
import { translations } from "@/i18n/translations";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("la-lang") || "DE");
  const value = useMemo(
    () => ({
      lang,
      t: translations[lang],
      toggle: () => {
        const next = lang === "DE" ? "EN" : "DE";
        localStorage.setItem("la-lang", next);
        setLang(next);
      },
    }),
    [lang],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLang = () => useContext(LanguageContext);
