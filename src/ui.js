// ───────────────────────── عناصر الواجهة العامة ─────────────────────────
function toast(msg, kind = "") {
  const t = document.createElement("div");
  t.className = "toast " + kind; t.textContent = msg;
  $("#toasts").appendChild(t);
  setTimeout(() => { t.classList.add("bye"); setTimeout(() => t.remove(), 300); }, 3200);
}
let sheetEl = null;
function openSheet(html, mount) {
  closeSheet();
  sheetEl = document.createElement("div");
  sheetEl.className = "scrim";
  sheetEl.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><button class="sx" data-close aria-label="إغلاق">${I.x}</button>${html}</div>`;
  sheetEl.addEventListener("click", (e) => { if (e.target === sheetEl || e.target.closest("[data-close]")) closeSheet(); });
  document.body.appendChild(sheetEl);
  document.body.classList.add("lock");
  mount && mount($(".sheet", sheetEl));
}
function closeSheet() { sheetEl?.remove(); sheetEl = null; document.body.classList.remove("lock"); }
const stars = (n, cls = "") => `<span class="stars ${cls}" aria-label="${n} من 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? "on" : ""}">${I.star}</i>`).join("")}</span>`;
const chip = (st) => `<span class="chip ${st}">${ST[st].icon}${ST[st].label}</span>`;
const pct = (v) => Math.round(v * 100);
const isMember = () => ME?.role === "member";
const memberFirst = () => firstName(S.settings.names.member);

// ───── الرسالة التحفيزية بملء الشاشة عند الدخول ─────
function showGreeting(force) {
  if (!ME || (!force && (showGreeting.done || QS.has("nogreet")))) return;
  showGreeting.done = true;
  const st = stats(), p = nowPos(), q = pickQuote(ME.role);
  let sub = "";
  if (isMember()) {
    if (p.phase === "before") sub = `ينطلق المشروع بعد ${daysWord(-p.di)}، فهيّئ نفسك`;
    else if (st.revise.length + st.late.length) sub = `بانتظارك ${st.revise.length + st.late.length} من المتطلبات، تداركها اليوم`;
    else if (p.phase === "during" && !S.tafsir[today()]) sub = "وجهُ اليوم بانتظارك";
    else sub = `أنجزت ${pct(st.overall)}٪ من الطريق`;
  } else sub = st.pending.length ? `${st.pending.length} من المتطلبات بانتظار تقييمك` : `إنجاز ${memberFirst()} حتى الآن ${pct(st.overall)}٪`;
  const g = document.createElement("div");
  g.className = "greet";
  g.innerHTML = `<div class="g-rays"></div><div class="g-in">${lantern("big")}
    <p class="g-hi">يا ${esc(firstName(ME.name))}،</p>
    <h1 class="g-msg">${q.split(" ").map((w, i) => `<span style="--i:${i}">${esc(w)}</span>`).join(" ")}</h1>
    <p class="g-sub">${esc(sub)}</p>
    <button class="btn gold g-go">لنبدأ</button></div>`;
  const bye = () => { g.classList.add("bye"); setTimeout(() => g.remove(), 500); };
  g.addEventListener("click", bye);
  document.body.appendChild(g);
}

// ───── الهيكل ─────
const NAV = [["home", "الرئيسية", I.home], ["path", "المسار", I.path], ["cal", "التقويم", I.cal], ["file", "ملف الإنجاز", I.folder], ["guide", "المحتوى", I.book]];
const unreadMine = () => S.notifs.filter((n) => n.to === ME.role && !n.read);
function shell(route) {
  const un = unreadMine().length;
  const links = (cls) => NAV.map(([r, t, ic]) => `<a href="#/${r}" class="${cls} ${route === r ? "on" : ""}">${ic}<span>${t}</span></a>`).join("");
  return `<div class="app">
  <aside class="side"><div class="logo">${lantern("mini")}<div><b>سراج</b><small>منصة المتابعة</small></div></div>
    <nav>${links("sl")}<a href="#/report" class="sl ${route === "report" ? "on" : ""}">${I.print}<span>تقرير المستفيد</span></a></nav>
    <button class="who" data-act="account"><span class="av">${esc(firstName(ME.name)[0] || "")}</span><span><b>${esc(ME.name)}</b><small>${isMember() ? "المستفيد" : "المتابع والمقيّم"}</small></span></button></aside>
  <div class="main">
    <header class="top"><div class="logo sm">${lantern("mini")}<b>سراج</b></div>
      <span class="grow"></span>
      <button class="ib" data-act="notifs" aria-label="التنبيهات">${I.bell}${un ? `<i class="dot">${un}</i>` : ""}</button>
      <button class="ib avb" data-act="account" aria-label="الحساب"><span class="av">${esc(firstName(ME.name)[0] || "")}</span></button></header>
    <main id="view"></main>
  </div>
  <nav class="bnav">${links("bl")}</nav></div>`;
}

// ───── شاشة الدخول ─────
function loginView() {
  if (api.mode === "remote" || QS.get("login") === "form") return `<div class="login"><div class="g-rays"></div><div class="l-in">${lantern("big")}
    <h1>سراج</h1><p class="l-tag">نورٌ يُوقَد في المربي، ليضيء به مَن حوله</p>
    <form class="l-form" id="authf" data-mode="in" novalidate>
      <label>البريد الإلكتروني<input name="email" type="email" autocomplete="email" dir="ltr" required></label>
      <label class="only-act">رمز التفعيل<input name="code" autocomplete="off" dir="ltr" autocapitalize="characters"></label>
      <label><span class="only-in">كلمة المرور</span><span class="only-act">اختر كلمة مرور (8 أحرف على الأقل)</span><input name="password" type="password" autocomplete="current-password" dir="ltr" required></label>
      <button class="btn gold wide" type="submit"><span class="only-in">دخول</span><span class="only-act">تفعيل الحساب والدخول</span></button>
      <button class="l-switch" type="button" data-authmode><span class="only-in">أول مرة؟ فعّل حسابك برمز التفعيل</span><span class="only-act">لديّ حساب مفعّل — تسجيل الدخول</span></button>
    </form></div></div>`;
  return `<div class="login"><div class="g-rays"></div><div class="l-in">${lantern("big")}
    <h1>سراج</h1><p class="l-tag">نورٌ يُوقَد في المربي، ليضيء به مَن حوله</p>
    <div class="l-cards">
      <button class="l-card" data-login="member"><span class="av">${esc(memberFirst()[0])}</span><span><b>${esc(S.settings.names.member)}</b><small>المستفيد · يرفع الإنجاز والملخصات</small></span>${I.chevL}</button>
      <button class="l-card" data-login="reviewer"><span class="av">${esc(firstName(S.settings.names.reviewer)[0])}</span><span><b>${esc(S.settings.names.reviewer)}</b><small>المتابع والمقيّم · يراجع ويقيّم</small></span>${I.chevL}</button>
    </div>
    <p class="l-note">نسخة معاينة محلية — البيانات تُحفظ في هذا المتصفح فقط</p></div></div>`;
}

// ───── التنبيهات ─────
const N_IC = { submit: I.upload, approved: I.check, revise: I.alert, nudge: I.bell, msg: I.send, event: I.cal };
function notifSheet() {
  const list = S.notifs.filter((n) => n.to === ME.role).slice(0, 60);
  openSheet(`<h2>التنبيهات</h2>
    <div class="nlist">${list.length ? list.map((n) => `<button class="nitem ${n.read ? "" : "unread"} k-${n.kind}" data-n="${n.id}"><span class="nic">${N_IC[n.kind] || I.bell}</span><span><b>${esc(n.title)}</b><small>${esc(n.body)}</small><em>${ago(n.at)}</em></span></button>`).join("") : `<div class="empty">${I.bell}<p>لا توجد تنبيهات بعد</p></div>`}</div>
    <div class="row gap"><button class="btn ghost" data-msg>${I.send} رسالة إلى ${esc(firstName(S.settings.names[isMember() ? "reviewer" : "member"]))}</button></div>`, (el) => {
    el.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-n]");
      if (b) { const n = S.notifs.find((x) => x.id === b.dataset.n); await api.markRead([n.id]); closeSheet(); render(); if (n.req) reqSheet(n.req); return; }
      if (e.target.closest("[data-msg]")) messageSheet();
    });
  });
  const ids = list.filter((n) => !n.read && !n.req).map((n) => n.id);
  if (ids.length) api.markRead(ids).then(() => paintBell());
}
function paintBell() { const b = $('[data-act="notifs"]'); if (!b) return; const n = unreadMine().length; $(".dot", b)?.remove(); if (n) b.insertAdjacentHTML("beforeend", `<i class="dot">${n}</i>`); }
function messageSheet() {
  openSheet(`<h2>رسالة قصيرة</h2><p class="mute">تصل تنبيهاً في الصفحة الرئيسية للطرف الآخر.</p>
    <textarea id="mtext" rows="4" placeholder="اكتب رسالتك…"></textarea>
    <button class="btn gold wide" data-send>${I.send} إرسال</button>`, (el) => {
    $("[data-send]", el).onclick = async () => { const v = $("#mtext", el).value.trim(); if (!v) return; await api.message(v); closeSheet(); toast("أُرسلت الرسالة", "ok"); };
  });
}

// ───── الحساب والإعدادات ─────
function accountSheet() {
  const rev = !isMember(), st = S.settings;
  openSheet(`<div class="acc"><span class="av xl">${esc(firstName(ME.name)[0] || "")}</span><div><h2>${esc(ME.name)}</h2><p class="mute">${rev ? "المتابع والمقيّم" : "المستفيد"}</p></div></div>
    ${rev ? `<h3>إعدادات المشروع</h3>
    <label>اسم المتابع<input id="s-rn" value="${esc(st.names.reviewer)}"></label>
    <label>اسم المستفيد<input id="s-mn" value="${esc(st.names.member)}"></label>
    <label>تاريخ انطلاق المشروع<input id="s-start" type="date" value="${st.start}"><small>${fmtHijri(st.start)}</small></label>
    <h3>مواعيد اللقاءات الشهرية</h3>
    <div class="grid2">${[1, 2, 3, 4, 5, 6].map((m) => `<label>اللقاء ${ORD[m]}<input type="date" data-meet="${m}" value="${meetingDate(m)}"></label>`).join("")}</div>
    <button class="btn gold wide" data-save>حفظ الإعدادات</button>
    ${api.mode === "remote" ? `<div id="invite"></div><h3>خط المنصة (ثمانية)</h3><label class="drop">${I.upload}<span id="fn-name">${Object.keys(st.fontFiles || {}).length ? `مرفوع: ${Object.keys(st.fontFiles).length} أوزان — اضغط للاستبدال` : "ارفع ملفات الخط الخمسة (otf) مرة واحدة"}</span><input id="fn-file" type="file" accept=".otf,.ttf" multiple hidden></label>` : ""}` : ""}
    <div class="row gap"><a class="btn ghost" href="#/report">${I.print} تقرير المستفيد</a><a class="btn ghost" href="guide/" target="_blank">${I.book} شرح المنصة</a></div>
    <div class="row gap"><button class="btn ghost" data-greet>${I.spark} رسالة اليوم</button><button class="btn ghost danger" data-out>${I.out} تسجيل الخروج</button></div>`, (el) => {
    $("[data-out]", el).onclick = async () => { await api.signOut(); closeSheet(); render(); };
    $("[data-greet]", el).onclick = () => { closeSheet(); showGreeting(true); };
    if (rev && api.mode === "remote") {
      api.memberInvite().then((c) => { const b = $("#invite", el); if (c && b) b.innerHTML = `<h3>تفعيل حساب المستفيد</h3><div class="codebox"><span><small>رمز التفعيل — أرسله له مع رابط المنصة</small><br><b>${esc(c)}</b></span></div>`; });
      $("#fn-file", el).onchange = async (e) => { const fs = [...e.target.files]; if (!fs.length) return; $("#fn-name", el).textContent = "جارٍ الرفع…"; try { const n = await api.uploadFonts(fs); $("#fn-name", el).textContent = n ? `رُفع ${n} من الأوزان` : "لم أتعرف على أسماء الملفات (Light / Regular / Medium / Bold / Black)"; if (n) toast("فُعّل خط ثمانية", "ok"); } catch (err) { $("#fn-name", el).textContent = "تعذّر الرفع"; toast(err.message, "err"); } };
    }
    const sv = $("[data-save]", el);
    if (sv) sv.onclick = async () => {
      const start = $("#s-start", el).value || st.start, changed = start !== st.start;
      const meetings = changed ? [] : $$("[data-meet]", el).map((i) => i.value || "");
      await api.saveSettings({ start, meetings, names: { reviewer: $("#s-rn", el).value.trim() || st.names.reviewer, member: $("#s-mn", el).value.trim() || st.names.member } });
      closeSheet(); render(); toast(changed ? "حُفظت الإعدادات وأُعيد ضبط مواعيد اللقاءات" : "حُفظت الإعدادات", "ok");
    };
  });
}

// ───── نافذة المتطلب: رفع / تقييم ─────
function reqSheet(id) {
  const r = REQ[id]; if (!r) return;
  const T = TYPES[r.type], st = statusOf(r), s = S.subs[id], mem = isMember();
  const head = `<div class="rs-head"><span class="ric big c-${r.comp}">${T.icon}</span><div><small>${r.monthly ? `الشهر ${ORD[r.month]}` : `الأسبوع ${r.week} · الشهر ${ORD[r.month]}`} · الجدارة ${COMPS[r.comp].name}</small><h2>${esc(r.title)}</h2></div></div>
    <div class="rs-meta">${chip(st)}<span class="mute">${I.cal} ${fmtDay(r.due)} · ${dueText(r)}</span></div>
    <p class="hint">${esc(r.sub)}${T.review ? ` — ${esc(T.hint)}` : ""}</p>`;
  if (r.type === "rasd") {
    const x = S.rasd[r.week];
    const view = x ? `<div class="subm"><div class="sm-h"><b>${ATT[x.attendance]}</b><em>سُجّل ${fmtShort(d2s(new Date(x.at)))}</em></div><div class="mgrid2"><div><small>التسميع من</small><b>${esc(x.from || "—")}</b></div><div><small>إلى</small><b>${esc(x.to || "—")}</b></div></div>${x.note ? `<p class="body">${esc(x.note)}</p>` : ""}</div>` : "";
    if (!mem) return openSheet(head + (view || `<p class="mute center">لم يُرفع رصد هذا الأسبوع بعد.</p>${st !== "upcoming" ? `<button class="btn ghost wide" data-nudge>${I.bell} أرسل تذكيراً للمستفيد</button>` : ""}`), (el) => { $("[data-nudge]", el)?.addEventListener("click", async () => { await api.nudge(id); closeSheet(); toast("أُرسل التذكير", "ok"); }); });
    return openSheet(head + `<h3>حضور الحلقة هذا الأسبوع</h3><div class="seg" id="att">${Object.entries(ATT).map(([k, v]) => `<button type="button" data-att="${k}" class="${(x?.attendance || "present") === k ? "on" : ""}">${v}</button>`).join("")}</div>
      <h3>التسميع</h3><div class="grid2"><label>من<input id="rs-from" value="${esc(x?.from || "")}" placeholder="مثال: يس آية 1"></label><label>إلى<input id="rs-to" value="${esc(x?.to || "")}" placeholder="مثال: يس آية 40"></label></div>
      <label>ملاحظات (اختياري)<textarea id="rs-note" rows="2" placeholder="مثل: سبب الغياب، أو مستوى الحفظ">${esc(x?.note || "")}</textarea></label>
      <button class="btn gold wide" data-save>${I.check} ${x ? "حفظ التعديل" : "رفع الرصد"}</button>`, (el) => {
      let att = x?.attendance || "present";
      $("#att", el).onclick = (e) => { const b = e.target.closest("[data-att]"); if (!b) return; att = b.dataset.att; $$("[data-att]", el).forEach((q) => q.classList.toggle("on", q === b)); };
      $("[data-save]", el).onclick = async (e) => {
        const from = $("#rs-from", el).value.trim(), to = $("#rs-to", el).value.trim();
        if (att === "present" && (!from || !to)) return toast("اكتب التسميع من وإلى", "err");
        e.currentTarget.disabled = true;
        try { await api.saveRasd(r.week, { attendance: att, from, to, note: $("#rs-note", el).value.trim() }); closeSheet(); render.keep = true; render(); toast("حُفظ الرصد، وأُرسل تنبيه للمتابع", "ok"); } catch (err) { e.currentTarget.disabled = false; toast("تعذّر الحفظ: " + err.message, "err"); }
      };
    });
  }
  if (r.type === "read") {
    return openSheet(head + (mem ? `<button class="btn ${S.checks[id] ? "ghost" : "gold"} wide" data-chk>${I.check} ${S.checks[id] ? "إلغاء علامة الإتمام" : "أتممتُ قراءة هذا المقرر"}</button>` : `<p class="mute">${S.checks[id] ? "أتمّ المستفيد القراءة." : "لم تُسجَّل القراءة بعد."}</p>${!S.checks[id] && st !== "upcoming" ? `<button class="btn ghost wide" data-nudge>${I.bell} أرسل تذكيراً</button>` : ""}`), (el) => {
      $("[data-chk]", el)?.addEventListener("click", async () => { await api.toggleCheck(id); closeSheet(); render(); });
      $("[data-nudge]", el)?.addEventListener("click", async () => { await api.nudge(id); closeSheet(); toast("أُرسل التذكير", "ok"); });
    });
  }
  const subBlock = s ? `<div class="subm"><div class="sm-h"><b>${esc(s.title || r.title)}</b><em>رُفع ${fmtShort(d2s(new Date(s.at)))}</em></div>
      ${s.body ? `<p class="body">${esc(s.body)}</p>` : ""}
      ${s.file ? `<button class="fileb" data-file>${I.file}<span>${esc(s.file.name)}</span><em>${(s.file.size / 1024 / 1024).toFixed(1)} م.ب</em></button>` : ""}</div>` : "";
  const evalBlock = s?.reviewedAt ? `<div class="eval ${s.status}"><div class="sm-h"><b>${s.status === "approved" ? "تقييم المتابع: معتمد" : "تقييم المتابع: يحتاج استكمالاً"}</b>${s.score ? stars(s.score) : ""}</div>${s.note ? `<p>${esc(s.note)}</p>` : ""}</div>` : "";
  let form = "";
  if (mem && (!s || s.status === "revise")) form = `<h3>${s ? "إعادة الرفع بعد الاستكمال" : "رفع المتطلب"}</h3>
      <label>العنوان<input id="f-title" value="${esc(s?.title || r.title)}"></label>
      <label>الملخص<textarea id="f-body" rows="6" placeholder="${r.type === "tadabbur" ? "المعنى:\nالوقفة:\nالعمل:" : "اكتب الملخص هنا، أو أرفق ملفاً"}">${esc(s?.body || "")}</textarea></label>
      <label class="drop">${I.upload}<span id="f-name">${s?.file ? esc(s.file.name) : "إرفاق ملف (PDF أو صورة أو Word)"}</span><input id="f-file" type="file" accept=".pdf,.doc,.docx,image/*" hidden></label>
      <button class="btn gold wide" data-submit>${I.upload} ${s ? "إعادة الرفع" : "رفع"}</button>`;
  else if (mem && s?.status === "submitted") form = `<p class="mute center">رُفع المتطلب وهو بانتظار تقييم المتابع.</p>`;
  else if (!mem && s) form = `<h3>${s.reviewedAt ? "تعديل التقييم" : "التقييم"}</h3>
      <div class="rate" id="rate">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-star="${i}" class="${i <= (s.score || 0) ? "on" : ""}" aria-label="${i}">${I.star}</button>`).join("")}</div>
      <label>ملاحظات المقيّم<textarea id="r-note" rows="3" placeholder="ملاحظة أو توجيه للمستفيد…">${esc(s.note || "")}</textarea></label>
      <div class="row gap"><button class="btn ok grow" data-rev="approved">${I.check} اعتماد</button><button class="btn warn grow" data-rev="revise">${I.alert} يحتاج استكمالاً</button></div>`;
  else if (!mem) form = `<p class="mute center">لم يُرفع هذا المتطلب بعد.</p>${st !== "upcoming" ? `<button class="btn ghost wide" data-nudge>${I.bell} أرسل تذكيراً للمستفيد</button>` : ""}`;
  openSheet(head + subBlock + evalBlock + form, (el) => {
    let score = s?.score || 0, file = null;
    $("[data-file]", el)?.addEventListener("click", async () => { const w = window.open("", "_blank"), u = await api.fileUrl(s.file); if (u && w) w.location = u; else { w?.close(); toast("تعذّر فتح الملف", "err"); } });
    $("#f-file", el)?.addEventListener("change", (e) => { file = e.target.files[0] || null; if (file && file.size > 20 * 1024 * 1024) { file = null; e.target.value = ""; return toast("الحد الأقصى للملف 20 م.ب", "err"); } if (file) $("#f-name", el).textContent = file.name; });
    $("[data-submit]", el)?.addEventListener("click", async (e) => {
      const body = $("#f-body", el).value.trim();
      if (!body && !file && !s?.file) return toast("اكتب الملخص أو أرفق ملفاً", "err");
      e.currentTarget.disabled = true;
      try { await api.submit(id, { title: $("#f-title", el).value.trim() || r.title, body, file }); closeSheet(); render(); toast("رُفع المتطلب، وأُرسل تنبيه للمتابع", "ok"); }
      catch (err) { e.currentTarget.disabled = false; toast("تعذّر الرفع: " + (err?.message || err), "err"); }
    });
    $("#rate", el)?.addEventListener("click", (e) => { const b = e.target.closest("[data-star]"); if (!b) return; score = +b.dataset.star; $$("[data-star]", el).forEach((x) => x.classList.toggle("on", +x.dataset.star <= score)); });
    $$("[data-rev]", el).forEach((b) => b.addEventListener("click", async () => {
      const note = $("#r-note", el).value.trim();
      if (b.dataset.rev === "revise" && !note) return toast("اكتب ما يحتاج استكماله", "err");
      if (b.dataset.rev === "approved" && !score) return toast("اختر التقييم بالنجوم", "err");
      await api.review(id, { status: b.dataset.rev, score: score || null, note }); closeSheet(); render(); toast("حُفظ التقييم، وأُرسل تنبيه للمستفيد", "ok");
    }));
    $("[data-nudge]", el)?.addEventListener("click", async () => { await api.nudge(id); closeSheet(); toast("أُرسل التذكير", "ok"); });
  });
}
