import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Download, RefreshCw, Search, Trash2, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLang } from "@/i18n/LanguageContext";
import { SITE } from "@/config/site";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STATUS_STYLE = {
  new: "bg-sky-soft text-navy border-azure/30",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function Admin() {
  const { t, lang, toggle } = useLang();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [svc, setSvc] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/contact`);
      setRows(data);
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const services = useMemo(() => [...new Set(rows.map((r) => r.service))], [rows]);
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return rows.filter(
      (r) =>
        (svc === "all" || r.service === svc) &&
        (!s || [r.name, r.email, r.location].some((v) => v.toLowerCase().includes(s))),
    );
  }, [rows, q, svc]);

  const counts = useMemo(
    () => rows.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {}),
    [rows],
  );

  const setStatus = async (id, status) => {
    const { data } = await axios.patch(`${API}/contact/${id}/status`, { status });
    setRows((rs) => rs.map((r) => (r.id === id ? data : r)));
    toast.success(t.admin.updated);
  };

  const remove = async (id) => {
    if (!window.confirm(t.admin.delete_confirm)) return;
    await axios.delete(`${API}/contact/${id}`);
    setRows((rs) => rs.filter((r) => r.id !== id));
    toast.success(t.admin.deleted);
  };

  const exportCsv = () => {
    const head = ["created_at", "name", "phone", "email", "location", "service", "message", "status"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [head.join(","), ...filtered.map((r) => head.map((h) => esc(r[h])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "la-submissions.csv";
    a.click();
  };

  const fmt = (iso) => new Date(iso).toLocaleString(lang === "DE" ? "de-DE" : "en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div data-testid="admin-page-container" className="min-h-screen bg-paper">
      <header className="glass-nav border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={SITE.logo} alt={SITE.name} className="h-9 w-auto" />
            <span className="hidden sm:inline font-mono text-xs uppercase tracking-widest text-slate-400">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button data-testid="admin-language-toggle" onClick={toggle} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-navy">
              {lang === "DE" ? "EN" : "DE"}
            </button>
            <Link data-testid="admin-back-link" to="/" className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-azure transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.admin.back}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-12">
        <p className="overline">{t.nav.admin}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{t.admin.title}</h1>
        <p className="mt-2 text-slate-600">{t.admin.subtitle}</p>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["total", rows.length, "bg-white"],
            ["new", counts.new || 0, "bg-sky-soft"],
            ["contacted", counts.contacted || 0, "bg-amber-50"],
            ["closed", counts.closed || 0, "bg-emerald-50"],
          ].map(([k, v, bg]) => (
            <div key={k} data-testid={`admin-stat-${k}`} className={`rounded-2xl border border-slate-200 ${bg} p-5`}>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-500">{t.admin[k]}</p>
              <p className="mt-2 text-3xl font-extrabold text-navy tabular-nums">{v}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input data-testid="admin-search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.admin.search} className="h-11 pl-10 rounded-xl bg-white" />
          </div>
          <Select value={svc} onValueChange={setSvc}>
            <SelectTrigger data-testid="admin-filter-service" className="h-11 rounded-xl bg-white md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.admin.all_services}</SelectItem>
              {services.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button data-testid="admin-refresh-button" onClick={load} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-navy">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t.admin.refresh}
          </button>
          <button data-testid="admin-export-csv-button" onClick={exportCsv} className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white hover:bg-azure transition-colors">
            <Download className="h-4 w-4" />
            {t.admin.export}
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table data-testid="admin-submissions-table" className="w-full text-sm">
              <thead className="bg-paper text-left text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  {Object.values(t.admin.cols).map((c) => (
                    <th key={c} className="px-5 py-4 font-bold">{c}</th>
                  ))}
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-14 text-center text-slate-400">{t.admin.loading}</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} data-testid="admin-empty-state" className="px-5 py-16 text-center text-slate-400">
                      <Inbox className="mx-auto h-8 w-8 mb-3 text-slate-300" />
                      {t.admin.empty}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} data-testid="admin-submission-row" className="hover:bg-paper/80 transition-colors align-top">
                      <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-slate-500">{fmt(r.created_at)}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{r.name}</p>
                        <p className="text-xs text-slate-500">{r.email}</p>
                        <p className="text-xs text-slate-500">{r.phone}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{r.location}</td>
                      <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{r.service}</span></td>
                      <td className="px-5 py-4 text-slate-600 max-w-xs"><p className="line-clamp-2">{r.message || "—"}</p></td>
                      <td className="px-5 py-4">
                        <Select value={r.status} onValueChange={(v) => setStatus(r.id, v)}>
                          <SelectTrigger data-testid="admin-status-badge" className={`h-8 w-36 rounded-full border text-xs font-bold ${STATUS_STYLE[r.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["new", "contacted", "closed"].map((s) => (
                              <SelectItem key={s} value={s}>{t.admin[s]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button data-testid="admin-delete-submission-button" onClick={() => remove(r.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
