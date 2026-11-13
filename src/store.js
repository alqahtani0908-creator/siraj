// ───────────────────────── طبقة البيانات ─────────────────────────
// الوضع المحلي: الحالة في localStorage والملفات في IndexedDB (للمعاينة قبل ربط قاعدة البيانات).
// كل الواجهة تمر عبر api.* حتى يُستبدل هذا الملف بمحوّل Supabase دون تغيير الواجهات.
const DEMO = QS.has("demo");
const KEY = DEMO ? "siraj.demo" : "siraj.v1";
const blank = () => ({ settings: { start: "2026-11-21", meetings: [], names: { reviewer: "المتابع", member: "المستفيد" } }, subs: {}, checks: {}, rasd: {}, tafsir: {}, events: [], notifs: [] });
let S = blank();
let ME = null; // {role:'reviewer'|'member', name}

const idb = () => new Promise((res, rej) => { const r = indexedDB.open("siraj-files", 1); r.onupgradeneeded = () => r.result.createObjectStore("f"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const idbDo = async (mode, fn) => { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction("f", mode), q = fn(t.objectStore("f")); t.oncomplete = () => res(q.result); t.onerror = () => rej(t.error); }); };

const api = {
  mode: "local",
  read() {
    try { const j = JSON.parse(localStorage.getItem(KEY) || "null"); S = j ? { ...blank(), ...j, settings: { ...blank().settings, ...j.settings } } : blank(); } catch { S = blank(); }
    buildReqs();
  },
  async load() {
    this.read();
    if (DEMO && !localStorage.getItem(KEY)) seedDemo();
    if (DEMO && QS.get("as")) localStorage.setItem("siraj.me", QS.get("as"));
    const r = localStorage.getItem("siraj.me");
    ME = r === "reviewer" || r === "member" ? { role: r, name: S.settings.names[r] } : null;
  },
  save() { localStorage.setItem(KEY, JSON.stringify(S)); buildReqs(); if (ME) ME.name = S.settings.names[ME.role]; },
  async signIn(role) { localStorage.setItem("siraj.me", role); ME = { role, name: S.settings.names[role] }; },
  async signOut() { localStorage.removeItem("siraj.me"); ME = null; },

  notify(to, kind, title, body, req) { S.notifs.unshift({ id: uid(), to, kind, title, body: body || "", req: req || null, at: new Date().toISOString(), read: false }); S.notifs = S.notifs.slice(0, 300); },
  async markRead(ids) { S.notifs.forEach((n) => { if (ids.includes(n.id)) n.read = true; }); this.save(); },

  async submit(reqId, { title, body, file }) {
    const r = REQ[reqId], prev = S.subs[reqId];
    let f = prev?.file || null;
    if (file) { f = { id: uid(), name: file.name, type: file.type, size: file.size }; await idbDo("readwrite", (s) => s.put(file, f.id)); }
    const history = prev?.reviewedAt ? [...(prev.history || []), { status: prev.status, score: prev.score, note: prev.note, at: prev.reviewedAt }] : prev?.history || [];
    S.subs[reqId] = { reqId, title, body, file: f, at: new Date().toISOString(), status: "submitted", score: null, note: "", reviewedAt: null, history };
    this.notify("reviewer", "submit", prev ? "أُعيد رفع متطلب" : "رُفع متطلب جديد", `${r.title} — بانتظار تقييمك`, reqId);
    this.save();
  },
  async review(reqId, { status, score, note }) {
    const s = S.subs[reqId]; if (!s) return;
    Object.assign(s, { status, score, note, reviewedAt: new Date().toISOString() });
    const r = REQ[reqId];
    this.notify("member", status === "approved" ? "approved" : "revise", status === "approved" ? "اعتُمد متطلبك" : "متطلب يحتاج استكمالاً", `${r.title}${score ? ` · التقييم ${score}/5` : ""}${note ? ` — ${note}` : ""}`, reqId);
    this.save();
  },
  async saveRasd(week, d) {
    const was = S.rasd[week]; S.rasd[week] = { week, ...d, at: new Date().toISOString() };
    this.notify("reviewer", "submit", was ? "عُدّل الرصد الأسبوعي" : "رُفع الرصد الأسبوعي", `${weekName(week)} — ${rasdText(S.rasd[week])}`, `rasd-w${week}`); this.save();
  },
  async toggleCheck(reqId) { if (S.checks[reqId]) delete S.checks[reqId]; else S.checks[reqId] = new Date().toISOString(); this.save(); },
  async setTafsir(date, on) { if (on) S.tafsir[date] = true; else delete S.tafsir[date]; this.save(); },
  async nudge(reqId) { const r = REQ[reqId]; this.notify("member", "nudge", "تذكير من المتابع", `${r.title} — ${ST[statusOf(r)].label}، ${dueText(r)}`, reqId); this.save(); },
  async message(text) { this.notify(ME.role === "reviewer" ? "member" : "reviewer", "msg", `رسالة من ${firstName(ME.name)}`, text); this.save(); },
  async addEvent(ev) { S.events.push({ id: uid(), ...ev }); this.notify("member", "event", "موعد جديد في التقويم", `${ev.title} — ${fmtDay(ev.date)}`); this.save(); },
  async delEvent(id) { S.events = S.events.filter((e) => e.id !== id); this.save(); },
  async saveSettings(st) {
    const moved = st.meetings.map((d, i) => d && d !== meetingDate(i + 1) ? i + 1 : 0).filter(Boolean);
    S.settings = { ...S.settings, ...st };
    buildReqs();
    moved.forEach((m) => this.notify("member", "event", "تغيّر موعد اللقاء", `اللقاء ${ORD[m]} — ${fmtDay(meetingDate(m))}`));
    this.save();
  },
  async addRef(refId, { label, url, file }) {
    const it = { id: uid(), label };
    if (file) { await idbDo("readwrite", (s) => s.put(file, "ref:" + it.id)); it.name = file.name; it.local = true; } else it.url = url;
    const refs = { ...(S.settings.refs || {}) }; refs[refId] = [...(refs[refId] || []), it]; S.settings.refs = refs; this.save();
  },
  async delRef(refId, id) { const refs = { ...(S.settings.refs || {}) }; refs[refId] = (refs[refId] || []).filter((x) => x.id !== id); S.settings.refs = refs; this.save(); },
  async refUrl(it) { if (it.url) return it.url; const b = await idbDo("readonly", (s) => s.get("ref:" + it.id)); return b ? URL.createObjectURL(b) : null; },
  async fileUrl(f) { const b = await idbDo("readonly", (s) => s.get(f.id)); return b ? URL.createObjectURL(b) : null; },
};

// بيانات معاينة فقط (‎?demo) — تُحفظ في مفتاح منفصل ولا تمس البيانات الحقيقية
function seedDemo() {
  S.settings.names = { reviewer: "عبدالله", member: "أحمد السالم" };
  const p = nowPos(); if (p.phase === "before") return api.save();
  let x = 11; const rnd = () => (x = (x * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i <= p.di && i < TOTAL_DAYS; i++) if (i === p.di ? false : rnd() > 0.12 || i > p.di - 4) S.tafsir[addDays(startDate(), i)] = true;
  const notes = ["ملخص متقن ووقفات عميقة، بارك الله فيك", "جيد، ويحسن ربط الوقفة بتطبيق عملي في الحلقة", "أحسنت، استمر على هذا المستوى", "اختصار مفيد، أضف الأدلة في المرة القادمة"];
  REQS.filter((r) => r.open <= today()).forEach((r) => {
    const past = r.due < today(), last = r.week === p.week - 1;
    if (r.type === "rasd") { if (past && rnd() > 0.1) { const a = 440 + (r.week - 1) * 7; S.rasd[r.week] = { week: r.week, attendance: rnd() > 0.15 ? "present" : "excused", from: `${surahsOf(a, a)} ص ${a}`, to: `${surahsOf(a + 6, a + 6)} ص ${a + 6}`, note: "", at: new Date(s2d(r.due)).toISOString() }; } return; }
    if (r.type === "read") { if (past ? rnd() > 0.1 : rnd() > 0.6) S.checks[r.id] = new Date().toISOString(); return; }
    if (!past || (r.monthly && r.due >= today())) return;
    if (rnd() < 0.1) return;
    const st = last ? (r.type === "fiqh" ? "revise" : "submitted") : "approved";
    S.subs[r.id] = { reqId: r.id, title: r.title, body: r.type === "tadabbur" ? "المعنى: تأمل في دلائل القدرة وإحياء الأرض الميتة.\nالوقفة: كل آية كونية رسالة لمن يعتبر.\nالعمل: تخصيص عشر دقائق بعد الفجر للتدبر مع الطلاب." : "خلاصة مسائل الأسبوع مع أدلتها المختصرة، مرتبة بحسب المقاطع.", file: null, at: new Date(s2d(r.due) - DAY).toISOString(), status: st,
      score: st === "approved" ? 4 + Math.round(rnd()) : st === "revise" ? 3 : null, note: st === "approved" ? notes[Math.floor(rnd() * notes.length)] : st === "revise" ? "ينقصه ذكر الأدلة لمسائل المقطع الثاني" : "", reviewedAt: st === "submitted" ? null : new Date(s2d(r.due)).toISOString(), history: [] };
  });
  const w = Math.max(1, p.week - 1);
  api.notify("member", "approved", "اعتُمد متطلبك", `ورقة التدبر — الأسبوع ${Math.max(1, w - 1)} · التقييم 5/5 — أحسنت، استمر على هذا المستوى`, `tadabbur-w${Math.max(1, w - 1)}`);
  api.notify("member", "revise", "متطلب يحتاج استكمالاً", `الملخص الفقهي — الأسبوع ${w} — ينقصه ذكر الأدلة لمسائل المقطع الثاني`, `fiqh-w${w}`);
  api.notify("reviewer", "submit", "رُفع متطلب جديد", `ورقة التدبر — الأسبوع ${w} — بانتظار تقييمك`, `tadabbur-w${w}`);
  api.save();
}
