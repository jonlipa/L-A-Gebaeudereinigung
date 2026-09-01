import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock, Wand2, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLang } from "@/i18n/LanguageContext";
import { SERVICE_KEYS } from "@/i18n/translations";
import { SITE } from "@/config/site";
import { Reveal, SectionHeader } from "@/components/Reveal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EMPTY = { name: "", phone: "", email: "", location: "", service: "", message: "" };

const InfoRow = ({ icon: Icon, label, value, href, testId }) => (
  <div data-testid={testId} className="flex items-start gap-4 py-5 border-b border-white/10 last:border-0">
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-300">
      <Icon className="h-4 w-4" />
    </span>
    <div>
      <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">{label}</p>
      {href ? (
        <a href={href} className="mt-0.5 block text-base font-semibold text-white hover:text-cyan-300 transition-colors">{value}</a>
      ) : (
        <p className="mt-0.5 text-base font-semibold text-white whitespace-pre-line">{value}</p>
      )}
    </div>
  </div>
);

export const Contact = () => {
  const { t, lang } = useLang();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const fillDemo = () => {
    setForm(SITE.demoData);
    toast.info(t.contact.demo_filled);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.location || !form.service) {
      toast.error(t.contact.required);
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, {
        ...form,
        service: t.services.items[form.service]?.title || form.service,
        language: lang,
      });
      toast.success(t.contact.success, { description: t.contact.success_desc });
      setForm(EMPTY);
    } catch {
      toast.error(t.contact.error);
    } finally {
      setLoading(false);
    }
  };

  const field = "h-12 rounded-xl border-slate-300 bg-white focus-visible:ring-azure focus-visible:ring-2 focus-visible:ring-offset-0";

  return (
    <section id="contact" data-testid="contact-section" className="relative bg-white py-24 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <SectionHeader tag={t.contact.tag} title={t.contact.title} subtitle={t.contact.subtitle} />

        <div className="mt-14 grid lg:grid-cols-12 gap-8">
          <Reveal className="lg:col-span-5">
            <div className="h-full rounded-[28px] bg-navy text-white p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-azure/30 blur-3xl" />
              <p className="relative font-display italic text-3xl leading-tight">{SITE.name}</p>
              <p className="relative mt-1 text-xs uppercase tracking-[0.25em] text-cyan-300 font-bold">Clean Service</p>
              <div className="relative mt-8">
                <InfoRow icon={Phone} label={t.contact.info_phone} value={SITE.phone} href={SITE.phoneHref} testId="contact-info-phone" />
                <InfoRow icon={Mail} label={t.contact.info_email} value={SITE.email} href={`mailto:${SITE.email}`} testId="contact-info-email" />
                <InfoRow icon={MapPin} label={t.contact.info_address} value={`${SITE.address.street}\n${SITE.address.city}, ${SITE.address.country}`} testId="contact-info-address" />
                <InfoRow icon={Clock} label={t.contact.info_hours} value={SITE.hours[lang]} testId="contact-info-hours" />
              </div>
              {SITE.isDemo && (
                <p data-testid="contact-placeholder-note" className="relative mt-8 rounded-lg border border-dashed border-white/25 px-4 py-3 text-xs text-slate-300 font-mono">
                  {t.contact.placeholder_note}
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <form data-testid="contact-form" onSubmit={submit} className="rounded-[28px] border border-slate-200 bg-paper p-8 sm:p-10">
              <div className="flex items-center justify-between gap-4 mb-8">
                <p className="font-mono text-xs uppercase tracking-widest text-slate-400">Form · {lang}</p>
                {SITE.isDemo && (
                  <button
                    type="button"
                    data-testid="fill-demo-data-button"
                    onClick={fillDemo}
                    className="btn-spring inline-flex items-center gap-2 rounded-full border border-azure/40 bg-white px-4 py-2 text-xs font-bold text-azure hover:bg-sky-soft"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    {t.contact.fill_demo}
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.contact.name} *</Label>
                  <Input id="name" data-testid="input-name" value={form.name} onChange={set("name")} placeholder="Max Mustermann" className={field} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.contact.phone} *</Label>
                  <Input id="phone" data-testid="input-phone" value={form.phone} onChange={set("phone")} placeholder="+49 30 0000000" className={field} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.contact.email} *</Label>
                  <Input id="email" type="email" data-testid="input-email" value={form.email} onChange={set("email")} placeholder="name@firma.de" className={field} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.contact.location} *</Label>
                  <Input id="location" data-testid="input-location" value={form.location} onChange={set("location")} placeholder="Berlin-Mitte" className={field} required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.contact.service} *</Label>
                  <Select value={form.service} onValueChange={(v) => setForm((f) => ({ ...f, service: v }))}>
                    <SelectTrigger data-testid="select-service" className={field}>
                      <SelectValue placeholder={t.contact.service_placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_KEYS.map((k) => (
                        <SelectItem key={k} value={k} data-testid={`select-service-option-${k}`}>{t.services.items[k].title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.contact.message}</Label>
                  <Textarea id="message" data-testid="input-message" value={form.message} onChange={set("message")} rows={4} className="rounded-xl border-slate-300 bg-white focus-visible:ring-azure focus-visible:ring-2 focus-visible:ring-offset-0" />
                </div>
              </div>

              <button
                type="submit"
                data-testid="submit-contact-button"
                disabled={loading}
                className="btn-spring shine-sweep mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-azure px-8 py-4 text-sm font-bold text-white shadow-[0_20px_40px_-15px_rgba(30,123,242,0.6)] hover:bg-navy disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? t.contact.submitting : t.contact.submit}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
