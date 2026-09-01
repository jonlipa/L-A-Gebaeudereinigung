import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";

const SmoothScroll = ({ children }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    return () => {
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);
  return children;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <LanguageProvider>
          <SmoothScroll>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </SmoothScroll>
          <Toaster position="top-right" richColors closeButton />
        </LanguageProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
