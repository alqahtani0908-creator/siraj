// ───────────────────────── محوّل Supabase ─────────────────────────
// يُفعَّل عند وجود docs/config.js؛ يستبدل دوال api المحلية بنداءات قاعدة البيانات.
const CFG = window.SIRAJ_CONFIG;
let sb = null, chan = null;
const FONT_KEYS = { light: 300, regular: 400, medium: 500, bold: 700, black: 900 };
async function addFont(key, buf) { try { document.fonts.add(await new FontFace("Thmanyah Brand", buf, { weight: String(FONT_KEYS[key]) }).load()); } catch (e) { console.warn("font", key, e); } }
async function cachedFonts() { await Promise.all(Object.keys(FONT_KEYS).map(async (k) => { try { const b = await idbDo("readonly", (s) => s.get("font:" + k)); if (b) await addFont(k, await b.arrayBuffer()); } catch {} })); }
if (CFG && window.supabase && !DEMO) {
  sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey);
  const must = (r) => { if (r.error) throw new Error(r.error.message); return r.data; };
  Object.assign(api, {
    mode: "remote", fontsVer: null,
    async load() {
      S = blank(); ME = null; buildReqs();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return;
      this.uid = session.user.id;
      await this.refresh();
      if (!ME) { await sb.auth.signOut(); return; }
      this.subscribe(); this.loadFonts();
    },
    async refresh() {
      const [pr, st, su, ch, tf, ev, nf] = (await Promise.all([
        sb.from("profiles").select("role,name,user_id"), sb.from("settings").select("*").eq("id", 1).maybeSingle(), sb.from("submissions").select("*"),
        sb.from("checks").select("*"), sb.from("tafsir").select("*"), sb.from("events").select("*").order("date"), sb.from("notifs").select("*").order("at", { ascending: false }).limit(300),
      ])).map(must);
      const names = Object.fromEntries(pr.map((p) => [p.role, p.name]));
      const n = blank();
      n.settings = { start: st?.start || n.settings.start, meetings: st?.meetings || [], names: { ...n.settings.names, ...names }, fontFiles: st?.font_files || {} };
      su.forEach((s) => (n.subs[s.req_id] = { reqId: s.req_id, title: s.title, body: s.body, file: s.file, at: s.at, status: s.status, score: s.score, note: s.note, reviewedAt: s.reviewed_at, history: s.history || [] }));
      ch.forEach((c) => (n.checks[c.req_id] = c.at));
      tf.forEach((t) => (n.tafsir[t.day] = true));
      n.events = ev;
      n.notifs = nf.map((x) => ({ id: x.id, to: x.to_role, kind: x.kind, title: x.title, body: x.body, req: x.req, at: x.at, read: x.read }));
      S = n; buildReqs();
      const me = pr.find((p) => p.user_id === this.uid);
      ME = me ? { role: me.role, name: me.name } : null;
    },
    subscribe() {
      if (chan) return;
      let t;
      const pull = () => { clearTimeout(t); t = setTimeout(async () => {
        if (!ME) return;
        const before = unreadMine().length;
        try { await api.refresh(); } catch { return; }
        if (!ME) return render();
        const now = unreadMine();
        if (now.length > before) toast(now[0].title + (now[0].body ? " — " + now[0].body : ""), "notif");
        if (!sheetEl) rerender(); else paintBell();
        api.loadFonts();
      }, 350); };
      chan = sb.channel("siraj").on("postgres_changes", { event: "*", schema: "public" }, pull).subscribe();
      document.addEventListener("visibilitychange", () => { if (!document.hidden) pull(); });
    },
    save() { buildReqs(); },
    notify() {},
    async signIn(email, password) { must(await sb.auth.signInWithPassword({ email: email.trim(), password })); await this.load(); if (!ME) throw new Error("هذا الحساب غير مرتبط بالمنصة"); },
    async activate(email, code, password) { must(await sb.rpc("activate_account", { p_email: email, p_code: code, p_password: password })); await this.signIn(email, password); },
    async signOut() { if (chan) { sb.removeChannel(chan); chan = null; } await sb.auth.signOut(); ME = null; S = blank(); buildReqs(); },
    async markRead(ids) { if (!ids.length) return; must(await sb.from("notifs").update({ read: true }).in("id", ids)); S.notifs.forEach((n) => { if (ids.includes(n.id)) n.read = true; }); },
    async submit(reqId, { title, body, file }) {
      const prev = S.subs[reqId]; let f = prev?.file || null;
      if (file) {
        const ext = (file.name.match(/\.([A-Za-z0-9]{1,8})$/) || [, "bin"])[1].toLowerCase(), path = `${reqId}/${uid()}.${ext}`;
        must(await sb.storage.from("files").upload(path, file, { contentType: file.type || undefined }));
        f = { path, name: file.name, type: file.type, size: file.size };
      }
      must(prev ? await sb.from("submissions").update({ title, body, file: f }).eq("req_id", reqId) : await sb.from("submissions").insert({ req_id: reqId, title, body, file: f }));
      await this.refresh();
    },
    async review(reqId, { status, score, note }) { must(await sb.from("submissions").update({ status, score, note }).eq("req_id", reqId)); await this.refresh(); },
    async toggleCheck(reqId) { must(S.checks[reqId] ? await sb.from("checks").delete().eq("req_id", reqId) : await sb.from("checks").insert({ req_id: reqId })); await this.refresh(); },
    async setTafsir(day, on) { must(on ? await sb.from("tafsir").upsert({ day }, { ignoreDuplicates: true }) : await sb.from("tafsir").delete().eq("day", day)); if (on) S.tafsir[day] = true; else delete S.tafsir[day]; },
    note(kind, title, body, req) { return sb.rpc("send_note", { p_kind: kind, p_title: title, p_body: body || "", p_req: req || null }).then(must); },
    async nudge(reqId) { const r = REQ[reqId]; await this.note("nudge", "تذكير من المتابع", `${r.title} — ${ST[statusOf(r)].label}، ${dueText(r)}`, reqId); },
    async message(text) { await this.note("msg", `رسالة من ${firstName(ME.name)}`, text); },
    async addEvent(ev) { must(await sb.from("events").insert(ev)); await this.note("event", "موعد جديد في التقويم", `${ev.title} — ${fmtDay(ev.date)}`); await this.refresh(); },
    async delEvent(id) { must(await sb.from("events").delete().eq("id", id)); await this.refresh(); },
    async saveSettings(st) {
      const moved = st.meetings.map((d, i) => (d && d !== meetingDate(i + 1) ? i + 1 : 0)).filter(Boolean);
      must(await sb.from("settings").update({ start: st.start, meetings: st.meetings }).eq("id", 1));
      for (const role of ["reviewer", "member"]) if (st.names[role] !== S.settings.names[role]) must(await sb.from("profiles").update({ name: st.names[role] }).eq("role", role));
      await this.refresh();
      for (const m of moved) await this.note("event", "تغيّر موعد اللقاء", `اللقاء ${ORD[m]} — ${fmtDay(meetingDate(m))}`);
    },
    async fileUrl(f) { if (!f?.path) return null; const r = await sb.storage.from("files").createSignedUrl(f.path, 3600); return r.data?.signedUrl || null; },
    async memberInvite() { const r = await sb.rpc("member_invite"); return r.data || null; },
    async uploadFonts(files) {
      const ff = { ...(S.settings.fontFiles || {}) }; let n = 0;
      for (const file of files) {
        const key = Object.keys(FONT_KEYS).find((k) => file.name.toLowerCase().includes(k)); if (!key) continue;
        const path = `fonts/${key}.otf`;
        must(await sb.storage.from("brand").upload(path, file, { upsert: true, contentType: "font/otf" }));
        ff[key] = { path, v: Date.now() }; n++;
      }
      if (n) { must(await sb.from("settings").update({ font_files: ff }).eq("id", 1)); await this.refresh(); this.fontsVer = null; await this.loadFonts(); }
      return n;
    },
    // خطوط الهوية محفوظة في مخزن خاص (لا تُنشر علناً) وتُخزَّن في المتصفح بعد أول دخول
    async loadFonts() {
      const ff = S.settings.fontFiles || {}, ver = JSON.stringify(ff);
      if (ver === this.fontsVer) return; this.fontsVer = ver;
      for (const [k, f] of Object.entries(ff)) {
        if (!FONT_KEYS[k] || localStorage.getItem("siraj.font." + k) === String(f.v)) continue;
        const r = await sb.storage.from("brand").download(f.path); if (r.error) continue;
        try { await idbDo("readwrite", (s) => s.put(r.data, "font:" + k)); localStorage.setItem("siraj.font." + k, String(f.v)); } catch {}
        await addFont(k, await r.data.arrayBuffer());
      }
    },
  });
}
