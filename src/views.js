// ───────────────────────── الصفحات ─────────────────────────
const reqRow = (r, extra = "") => { const st = statusOf(r), s = S.subs[r.id]; return `<button class="req st-${st}" data-req="${r.id}"><span class="ric c-${r.comp}">${TYPES[r.type].icon}</span><span class="rmain"><b>${esc(r.title)}</b><small>${esc(r.sub)}</small><small class="due">${st === "approved" && s?.score ? stars(s.score, "sm") : dueText(r)}</small></span>${chip(st)}${extra}</button>`; };
const ring = (v, inner) => `<div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="rt"/><circle cx="60" cy="60" r="52" class="rv" stroke-dasharray="${(v * 326.7).toFixed(1)} 326.7"/></svg><div class="rin">${inner}</div></div>`;

function trail() {
  const p = nowPos();
  return `<section class="card trail"><div class="ch"><h3>مسار المصابيح</h3><small>24 أسبوعاً · يضيء المصباح بإتمام أسبوعه</small></div>
    <div class="lamps">${[1, 2, 3, 4, 5, 6].map((m) => `<a class="lm ${p.phase === "during" && p.month === m ? "cur" : ""}" href="#/path/${m}"><div>${[0, 1, 2, 3].map((i) => { const w = (m - 1) * 4 + i + 1; return `<i class="lamp ${weekState(w)}" title="الأسبوع ${w}"></i>`; }).join("")}</div><small>الشهر ${m}</small></a>`).join("")}</div></section>`;
}
function compsCard(st) {
  return `<section class="card"><div class="ch"><h3>الجدارات الخمس</h3></div><div class="comps">${Object.entries(COMPS).map(([k, c]) => `<div class="comp"><span class="ric c-${k}">${c.icon}</span><div class="grow"><div class="row"><b>${c.name}</b><span class="grow"></span><em>${pct(st.byComp[k])}٪</em></div><div class="bar"><i class="c-${k}" style="width:${pct(st.byComp[k])}%"></i></div><small>${c.desc}</small></div></div>`).join("")}</div></section>`;
}
function nextMeeting() {
  const t = today();
  for (let m = 1; m <= 6; m++) if (meetingDate(m) >= t) return { m, date: meetingDate(m), n: diffDays(meetingDate(m), t) };
  return null;
}

// تنبيهات الصفحة الرئيسية: محسوبة من المتطلبات + التنبيهات غير المقروءة
function alerts(st) {
  const p = nowPos(), t = today(), mem = isMember(), a = [];
  unreadMine().slice(0, 4).forEach((n) => a.push({ k: n.kind === "revise" ? "warn" : n.kind === "approved" ? "ok" : "info", ic: N_IC[n.kind] || I.bell, title: n.title, body: n.body, n: n.id, req: n.req, at: ago(n.at) }));
  if (p.phase === "before") a.push({ k: "info", ic: I.spark, title: `ينطلق المشروع بعد ${daysWord(-p.di)}`, body: `${fmtDay(startDate())} · ${fmtHijri(startDate())}` });
  if (!mem && st.pending.length) a.push({ k: "gold", ic: I.clock, title: `${st.pending.length} من المتطلبات بانتظار تقييمك`, body: st.pending.slice(0, 3).map((r) => r.title).join("، "), req: st.pending[0].id });
  if (mem) st.revise.forEach((r) => { if (!a.some((x) => x.req === r.id)) a.push({ k: "warn", ic: I.alert, title: `يحتاج استكمالاً: ${r.title}`, body: S.subs[r.id]?.note || "", req: r.id }); });
  st.late.slice(0, 3).forEach((r) => a.push({ k: "bad", ic: I.alert, title: `متأخر: ${r.title}`, body: dueText(r), req: r.id, nudge: !mem }));
  if (st.late.length > 3) a.push({ k: "bad", ic: I.alert, title: `و${st.late.length - 3} متطلبات متأخرة أخرى`, body: "راجعها في صفحة المسار", go: "#/path" });
  if (st.missed) a.push({ k: "warn", ic: I.quran, title: mem ? `فاتك تسجيل ${st.missed} من أوجه التفسير` : `${st.missed} من أوجه التفسير لم تُسجَّل`, body: mem ? "سجّلها من التقويم أو المسار" : "", go: "#/cal" });
  if (mem) REQS.filter((r) => statusOf(r) === "due" && diffDays(r.due, t) <= 2).forEach((r) => a.push({ k: "gold", ic: I.clock, title: `${r.title}`, body: dueText(r), req: r.id }));
  const nm = nextMeeting();
  if (nm && nm.n <= 10 && p.phase !== "before") a.push({ k: "navy", ic: I.people, title: `اللقاء ${ORD[nm.m]} ${nm.n === 0 ? "اليوم" : nm.n === 1 ? "غداً" : "بعد " + daysWord(nm.n)}`, body: `«${MONTHS[nm.m].meet}» · ${fmtDay(nm.date)}`, go: "#/cal" });
  return a;
}
const alertRow = (x) => `<div class="al k-${x.k}" ${x.req ? `data-req="${x.req}"` : ""} ${x.n ? `data-readn="${x.n}"` : ""} ${x.go ? `data-go="${x.go}"` : ""} ${x.tafsir ? "data-tafsir-today" : ""} role="button" tabindex="0"><span class="aic">${x.ic}</span><span class="grow"><b>${esc(x.title)}</b>${x.body ? `<small>${esc(x.body)}</small>` : ""}</span>${x.at ? `<em>${x.at}</em>` : ""}${x.nudge ? `<button class="btn sm ghost" data-nudge="${x.req}">${I.bell} ذكّره</button>` : ""}</div>`;

function homeView() {
  const st = stats(), p = nowPos(), mem = isMember(), t = today(), al = alerts(st);
  const week = REQS.filter((r) => (r.week === p.week && !r.monthly) || (r.monthly && r.month === p.month && p.week % 4 === 0));
  const diff = st.overall - st.expected;
  const good = diff >= -0.01 && !st.late.length;
  const pace = p.phase === "before" ? "لم يبدأ بعد" : good ? "على المسار" : st.late.length ? `${st.late.length} متطلبات متأخرة` : `متأخر ${Math.max(1, pct(-diff))}٪ عن المخطط`;
  const hero = `<section class="hero"><div class="h-rays"></div>
    <div class="h-top"><div><small>${fmtDay(t)} · ${fmtHijriShort(t)}</small>
      <h1>${mem ? `أهلاً يا ${esc(firstName(ME.name))}` : `إنجاز ${esc(memberFirst())}`}</h1>
      <p>${p.phase === "before" ? `الانطلاق ${fmtDay(startDate())}` : p.phase === "after" ? "اكتملت الأشهر الستة" : `اليوم ${p.day} من ${TOTAL_DAYS} · الأسبوع ${p.week} · الشهر ${ORD[p.month]}`}</p>
      <span class="pace ${good || p.phase === "before" ? "good" : "slow"}">${pace}</span></div>
      ${ring(st.overall, `${lantern("inring")}<b>${pct(st.overall)}<i>٪</i></b>`)}</div>
    <div class="h-stats"><div><b>${p.phase === "before" ? "—" : pct(st.committed) + "<i>٪</i>"}</b><small>الالتزام</small></div><div><b>${st.streak}</b><small>${I.fire} أيام متتالية</small></div><div><b>${st.avg ? st.avg.toFixed(1) : "—"}</b><small>متوسط التقييم</small></div><div><b>${st.tafsirDone}</b><small>وجهاً مفسَّراً</small></div></div>
    <style>.hero .lglow{opacity:${(0.25 + st.overall * 0.75).toFixed(2)}}</style></section>`;
  const wird = p.phase === "during" ? `<section class="card wird ${S.tafsir[t] ? "done" : ""}"><span class="ric c-quran big">${I.quran}</span><div class="grow"><small>وِرد اليوم · التفسير الميسر</small><b>الوجه ${p.day} — صفحة ${tafsirPage(p.di)}</b><small>${MONTHS[p.month].tafsir}</small></div>
      ${mem ? `<button class="btn ${S.tafsir[t] ? "okf" : "gold"}" data-tafsir-today>${I.check} ${S.tafsir[t] ? "أُنجز" : "أتممتُه"}</button>` : `<span class="chip ${S.tafsir[t] ? "approved" : "due"}">${S.tafsir[t] ? "أُنجز اليوم" : "لم يُسجَّل"}</span>`}</section>` : "";
  return `${hero}
    ${wird}
    <section class="card alerts"><div class="ch"><h3>${I.bell} التنبيهات</h3>${al.length ? `<span class="count">${al.length}</span>` : ""}</div>${al.length ? al.map(alertRow).join("") : `<div class="empty sm">${I.check}<p>لا تنبيهات — كل شيء على ما يرام</p></div>`}</section>
    <div class="cols"><section class="card"><div class="ch"><h3>${p.phase === "before" ? "متطلبات الأسبوع الأول" : mem ? "مطلوب هذا الأسبوع" : "متطلبات هذا الأسبوع"}</h3><a href="#/path/${p.month}">كل المسار</a></div><div class="reqs">${week.map((r) => reqRow(r)).join("")}</div></section>
    ${compsCard(st)}</div>
    ${trail()}`;
}

// ───── المسار ─────
const WD = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];
function pathView(arg) {
  const p = nowPos(), m = Math.min(6, Math.max(1, +arg || p.month)), M = MONTHS[m], t = today(), mem = isMember();
  const weeks = [1, 2, 3, 4].map((i) => {
    const w = (m - 1) * 4 + i, ws = weekStart(w), state = weekState(w);
    const days = WD.map((l, d) => { const ds = addDays(ws, d), on = S.tafsir[ds], fut = ds > t; return `<button class="td ${on ? "on" : fut ? "fut" : "miss"} ${ds === t ? "today" : ""}" ${mem && !fut ? `data-tafsir="${ds}"` : "disabled"} title="${fmtDay(ds)} · صفحة ${tafsirPage(diffDays(ds, startDate()))}"><i>${on ? I.check : l}</i></button>`; }).join("");
    return `<section class="card week ${state}"><div class="ch"><h3><i class="lamp ${state}"></i> الأسبوع ${w}</h3><small>${fmtShort(ws)} – ${fmtShort(weekEnd(w))}</small></div>
      <div class="tafsir"><small>${I.quran} التفسير: وجهٌ كل يوم (ص ${tafsirPage((w - 1) * 7)}–${tafsirPage(w * 7 - 1)})</small><div class="tds">${days}</div></div>
      <div class="reqs">${REQS.filter((r) => r.week === w && !r.monthly).map((r) => reqRow(r)).join("")}</div></section>`;
  }).join("");
  return `<div class="tabs">${[1, 2, 3, 4, 5, 6].map((i) => `<a href="#/path/${i}" class="${i === m ? "on" : ""} ${p.phase === "during" && p.month === i ? "cur" : ""}">الشهر ${ORD[i]}</a>`).join("")}</div>
    <section class="mhead"><div class="h-rays"></div><small>الشهر ${ORD[m]} · ${fmtShort(weekStart(m * 4 - 3))} – ${fmtShort(weekEnd(m * 4))}</small><h1>${esc(M.meet)}</h1>
      <div class="mgrid"><div><small>التفسير الميسر</small><b>${M.tafsir}</b></div><div><small>التأهيل الشرعي</small><b>${M.fiqh}</b></div><div><small>مصدر اللقاء</small><b>${esc(M.source)}</b></div><div><small>اللقاء ${ORD[m]}</small><b>${fmtDay(meetingDate(m))}</b></div></div></section>
    <div class="cols">${weeks}</div>
    <section class="card"><div class="ch"><h3>${I.people} قبل اللقاء ${ORD[m]}</h3><small>${esc(M.comp)}</small></div><div class="reqs">${REQS.filter((r) => r.monthly && r.month === m).map((r) => reqRow(r)).join("")}</div></section>`;
}

// ───── التقويم ─────
let calYM = null, calSel = null;
function dayInfo(ds) {
  const di = diffDays(ds, startDate());
  return { inProj: di >= 0 && di < TOTAL_DAYS, di, due: REQS.filter((r) => r.due === ds), meet: [1, 2, 3, 4, 5, 6].find((m) => meetingDate(m) === ds), events: S.events.filter((e) => e.date === ds), start: ds === startDate() };
}
function calView() {
  const t = today(), mem = isMember();
  if (!calYM) { const b = t < startDate() ? startDate() : t; calYM = b.slice(0, 7); }
  if (!calSel) calSel = t;
  const [y, mo] = calYM.split("-").map(Number), first = new Date(y, mo - 1, 1, 12), lead = (first.getDay() + 1) % 7, n = new Date(y, mo, 0).getDate();
  let cells = "";
  for (let i = 0; i < lead; i++) cells += `<span class="dc blank"></span>`;
  for (let d = 1; d <= n; d++) {
    const ds = `${y}-${pad(mo)}-${pad(d)}`, inf = dayInfo(ds);
    const late = inf.due.some((r) => statusOf(r) === "late") || (inf.inProj && ds < t && !S.tafsir[ds]);
    const dots = [inf.meet || inf.start ? `<i class="d navy"></i>` : "", inf.due.length ? `<i class="d ${inf.due.every(isDone) ? "ok" : late ? "bad" : "gold"}"></i>` : "", inf.events.length ? `<i class="d ev"></i>` : ""].join("");
    cells += `<button class="dc ${ds === t ? "today" : ""} ${ds === calSel ? "sel" : ""} ${inf.inProj ? "in" : "out"} ${S.tafsir[ds] ? "tf" : inf.inProj && ds < t ? "tm" : ""}" data-day="${ds}"><b>${d}</b><small>${F_HD.format(s2d(ds))}</small><span class="dots">${dots}</span></button>`;
  }
  const inf = dayInfo(calSel), items = [];
  if (inf.start) items.push(`<div class="al k-navy"><span class="aic">${I.spark}</span><span class="grow"><b>انطلاق مشروع سراج</b></span></div>`);
  if (inf.meet) items.push(`<div class="al k-navy"><span class="aic">${I.people}</span><span class="grow"><b>اللقاء ${ORD[inf.meet]}: ${esc(MONTHS[inf.meet].meet)}</b><small>${esc(MONTHS[inf.meet].source)}</small></span></div>`);
  inf.events.forEach((e) => items.push(`<div class="al k-info"><span class="aic">${I.cal}</span><span class="grow"><b>${esc(e.title)}</b>${e.note ? `<small>${esc(e.note)}</small>` : ""}</span>${mem ? "" : `<button class="btn sm ghost" data-delev="${e.id}">حذف</button>`}</div>`));
  if (inf.inProj) { const on = S.tafsir[calSel], fut = calSel > t; items.push(`<div class="al k-${on ? "ok" : fut ? "info" : "warn"}"><span class="aic">${I.quran}</span><span class="grow"><b>التفسير: الوجه ${inf.di + 1} — صفحة ${tafsirPage(inf.di)}</b><small>${on ? "أُنجز" : fut ? "قادم" : "لم يُسجَّل"}</small></span>${mem && !fut ? `<button class="btn sm ${on ? "ghost" : "gold"}" data-tafsir="${calSel}">${on ? "إلغاء" : "أتممتُه"}</button>` : ""}</div>`); }
  return `<section class="card cal"><div class="calh"><button class="ib" data-cal="-1" aria-label="الشهر السابق">${I.chevR}</button><div><h2>${F_GM.format(first)}</h2><small>${F_HM.format(first)} – ${F_HM.format(new Date(y, mo - 1, n, 12))}</small></div><button class="ib" data-cal="1" aria-label="الشهر التالي">${I.chevL}</button></div>
    <div class="wd">${["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map((d) => `<span>${d}</span>`).join("")}</div>
    <div class="grid7">${cells}</div>
    <div class="legend"><span><i class="d navy"></i>لقاء</span><span><i class="d gold"></i>متطلب</span><span><i class="d ok"></i>مُنجز</span><span><i class="d bad"></i>متأخر</span><span><i class="sq tf"></i>وجه مُسجَّل</span></div></section>
    <section class="card"><div class="ch"><h3>${fmtDay(calSel)}</h3><small>${fmtHijri(calSel)}</small></div>
      ${items.join("")}${inf.due.length ? `<div class="reqs">${inf.due.map((r) => reqRow(r)).join("")}</div>` : ""}
      ${!items.length && !inf.due.length ? `<div class="empty sm">${I.cal}<p>لا شيء في هذا اليوم</p></div>` : ""}
      ${mem ? "" : `<button class="btn ghost wide" data-addev>${I.plus} إضافة موعد في هذا اليوم</button>`}</section>`;
}
function eventSheet() {
  openSheet(`<h2>موعد جديد</h2><p class="mute">${fmtDay(calSel)} — يصل تنبيه للمستفيد.</p><label>العنوان<input id="e-t" placeholder="مثال: جلسة مراجعة قصيرة"></label><label>ملاحظة<input id="e-n"></label><button class="btn gold wide" data-ok>إضافة</button>`, (el) => {
    $("[data-ok]", el).onclick = async () => { const title = $("#e-t", el).value.trim(); if (!title) return toast("اكتب عنوان الموعد", "err"); await api.addEvent({ date: calSel, title, note: $("#e-n", el).value.trim() }); closeSheet(); render(); };
  });
}

// ───── ملف الإنجاز ─────
let fileFilter = "all";
function fileView() {
  const st = stats(), subs = Object.values(S.subs).sort((a, b) => (a.at < b.at ? 1 : -1));
  const list = subs.filter((s) => fileFilter === "all" || REQ[s.reqId]?.type === fileFilter);
  const cnt = (ty) => subs.filter((s) => REQ[s.reqId]?.type === ty).length;
  return `<section class="mhead"><div class="h-rays"></div><small>ملف الإنجاز</small><h1>كل إنجازٍ يُرفع، وكل ملخصٍ يُحفظ</h1>
      <div class="mgrid"><div><small>ملفات مرفوعة</small><b>${subs.length}</b></div><div><small>معتمدة</small><b>${subs.filter((s) => s.status === "approved").length}</b></div><div><small>متوسط التقييم</small><b>${st.avg ? st.avg.toFixed(1) + " / 5" : "—"}</b></div><div><small>أوجه التفسير</small><b>${st.tafsirDone} / ${TOTAL_DAYS}</b></div></div></section>
    <div class="tabs">${[["all", "الكل", subs.length], ...["tadabbur", "fiqh", "source", "report"].map((k) => [k, TYPES[k].name, cnt(k)])].map(([k, n, c]) => `<button data-ff="${k}" class="${fileFilter === k ? "on" : ""}">${n} <i>${c}</i></button>`).join("")}</div>
    <section class="card"><div class="reqs">${list.length ? list.map((s) => reqRow(REQ[s.reqId])).join("") : `<div class="empty">${I.folder}<p>${isMember() ? "لم تُرفع ملفات بعد — ابدأ من صفحة المسار" : "لم يرفع المستفيد شيئاً بعد"}</p></div>`}</div></section>`;
}
