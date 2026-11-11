// ───────────────────────── أدوات عامة ─────────────────────────
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const DAY = 864e5;
const pad = (n) => String(n).padStart(2, "0");
const d2s = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const s2d = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12); };
const addDays = (s, n) => { const d = s2d(s); d.setDate(d.getDate() + n); return d2s(d); };
const diffDays = (a, b) => Math.round((s2d(a) - s2d(b)) / DAY);
const QS = new URLSearchParams(location.search);
// ‎?today=2026-12-20 لمعاينة المنصة في تاريخ آخر
const today = () => (/^\d{4}-\d\d-\d\d$/.test(QS.get("today") || "") ? QS.get("today") : d2s(new Date()));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

const F_G = new Intl.DateTimeFormat("ar-u-ca-gregory-nu-latn", { weekday: "long", day: "numeric", month: "long" });
const F_GS = new Intl.DateTimeFormat("ar-u-ca-gregory-nu-latn", { day: "numeric", month: "short" });
const F_GM = new Intl.DateTimeFormat("ar-u-ca-gregory-nu-latn", { month: "long", year: "numeric" });
const F_H = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "long", year: "numeric" });
const F_HD = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", { day: "numeric" });
const F_HM = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", { month: "long", year: "numeric" });
const F_HS = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "long" });
const fmtHijriShort = (s) => F_HS.format(s2d(s));
const fmtDay = (s) => F_G.format(s2d(s));
const fmtShort = (s) => F_GS.format(s2d(s));
const fmtHijri = (s) => F_H.format(s2d(s)).replace(/\s*هـ/, "") + " هـ";
const daysWord = (n) => (n === 1 ? "يوم" : n === 2 ? "يومين" : n <= 10 ? `${n} أيام` : `${n} يوماً`);
function ago(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 6e4);
  if (m < 1) return "الآن";
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  return `قبل ${daysWord(Math.floor(h / 24))}`;
}
const ORD = ["", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];
const firstName = (n) => String(n || "").trim().split(/\s+/)[0] || "";

// ───────────────────────── أيقونات ─────────────────────────
const svg = (p, w = 1.8) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  home: svg('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
  path: svg('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 000-8h-4a4 4 0 010-8"/>'.replace("a4 4 0 010-8", "")),
  cal: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  folder: svg('<path d="M3 7a2 2 0 012-2h4l2 3h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>'),
  bell: svg('<path d="M6 9a6 6 0 1112 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 004 0"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 2.4),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  alert: svg('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5v.1"/>'),
  upload: svg('<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/>'),
  file: svg('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>', 2),
  chevL: svg('<path d="M15 5l-7 7 7 7"/>', 2),
  chevR: svg('<path d="M9 5l7 7-7 7"/>', 2),
  book: svg('<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 21V5M8 7h7"/>'),
  quran: svg('<path d="M12 6c-2-2-5-2-8-1v13c3-1 6-1 8 1 2-2 5-2 8-1V5c-3-1-6-1-8 1z"/><path d="M12 6v13"/>'),
  scale: svg('<path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-3 6a3 3 0 006 0zM19 8l-3 6a3 3 0 006 0z"/>'),
  flag: svg('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
  spark: svg('<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>'),
  people: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 4.6a3.5 3.5 0 010 6.8M18 14.5a6.5 6.5 0 013.5 5.5"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>'),
  print: svg('<path d="M7 8V3h10v5M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2"/><rect x="7" y="14" width="10" height="7" rx="1"/>'),
  out: svg('<path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 2),
  send: svg('<path d="M20 4L3 11l7 3 3 7z"/><path d="M10 14l4-4"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),
  fire: svg('<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>'),
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z"/></svg>',
};
I.path = svg('<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3.5 3.5 0 000-7H9a3.5 3.5 0 010-7h7"/>');

function lantern(cls = "") {
  return `<svg viewBox="0 0 120 170" class="lantern ${cls}" aria-hidden="true">
  <circle cx="60" cy="88" r="62" fill="url(#lg)" class="lglow"/>
  <g class="lrays" stroke="#FFE9A8" stroke-width="1.6" stroke-linecap="round" opacity=".55"><path d="M60 14v-9M19 40l-7-6M101 40l7-6M6 88H-2M114 88h8M17 132l-7 5M103 132l7 5"/></g>
  <g class="lstars" fill="#FFE9A8"><path d="M14 62l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z"/><path d="M106 108l1.3 3.2 3.2 1.3-3.2 1.3-1.3 3.2-1.3-3.2-3.2-1.3 3.2-1.3z"/><path d="M100 54l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/></g>
  <path d="M33 124C24 92 28 44 51 33M87 124C96 92 92 44 69 33" fill="none" stroke="url(#lm)" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="60" cy="17" r="6.5" fill="none" stroke="url(#lm)" stroke-width="2.6"/>
  <rect x="53" y="23" width="14" height="8" rx="2.5" fill="url(#lm)"/>
  <path d="M44 41c0-6 7-10 16-10s16 4 16 10z" fill="url(#lm)"/>
  <rect x="42" y="40" width="36" height="5" rx="2.5" fill="#8F611A"/>
  <path d="M47 45C33 58 31 96 45 112h30C89 96 87 58 73 45z" fill="url(#lgl)" stroke="#D9A94E" stroke-width="1.6"/>
  <path d="M42 54C37 68 37 90 42 103" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".38"/>
  <path d="M36.5 68Q60 75 83.5 68M36.5 90Q60 97 83.5 90" fill="none" stroke="#D9A94E" stroke-width="1.2" opacity=".75"/>
  <g class="flame"><path d="M60 60c12 15 11 36 0 43-11-7-12-28 0-43z" fill="url(#lf)"/><path d="M60 78c5 7 5 17 0 21-5-4-5-14 0-21z" fill="#FFFBEA"/></g>
  <rect x="50" y="110" width="20" height="7" rx="2" fill="#8F611A"/>
  <path d="M29 126q0-9 10-9h42q10 0 10 9v10q0 9-10 9H39q-10 0-10-9z" fill="url(#lm)"/>
  <path d="M30 130h60" stroke="#6B4712" stroke-width="1.4" opacity=".6"/><circle cx="95" cy="122" r="3.2" fill="#E9BE6A" stroke="#6B4712" stroke-width="1"/>
  <rect x="34" y="145" width="52" height="5.5" rx="2.75" fill="#8F611A"/>
</svg>`;
}

// ───────────────────────── خطة المشروع (من وثيقة سراج) ─────────────────────────
const MONTHS = [null,
  { tafsir: "يس – الزمر", fiqh: "الفقه الأكبر والمدخل", meet: "غاية التربية الإسلامية وهدفها", source: "أصول التربية الإسلامية، عبدالرحمن النحلاوي: الفصل الرابع", comp: "الغاية التربوية · التعلم الذاتي", book: "أصول التربية الإسلامية", read: ["ص 88 – 92", "ص 93 – 97", "ص 98 – 102", "ص 103 – 107"] },
  { tafsir: "غافر – الزخرف", fiqh: "فقه العبادات", meet: "تربية العقل الناقد", source: "المذهّبات، فايز الزهراني: تربية العقل الناقد", comp: "التفكير الناقد", book: "المذهّبات", read: ["ص 55 – 59", "ص 60 – 63", "ص 64 – 68", "ص 69 – 72"] },
  { tafsir: "الدخان – الذاريات", fiqh: "فقه العبادات", meet: "المربون في العصر الجديد", source: "التربية من جديد، فايز الزهراني: المبحث السابع", comp: "المراحل العمرية · تقديم البرامج", book: "التربية من جديد", read: ["ص 215 – 219", "ص 220 – 224", "ص 225 – 229", "ص 230 – 234"] },
  { tafsir: "الطور – الممتحنة", fiqh: "فقه العبادات", meet: "المعايشة التربوية", source: "المعايشة التربوية، سالم البطاطي: الكتاب كاملاً", comp: "القيادة والقرار التربوي", book: "المعايشة التربوية", read: ["ص 3 – 14", "ص 15 – 28", "ص 29 – 38", "ص 39 – 50"] },
  { tafsir: "الصف – المرسلات", fiqh: "فقه العبادات", meet: "المربي… البناء والتكوين", source: "معيار المربي، فايز الزهراني: شخصية المربي والمهارات التربوية", comp: "مهارات المربي", book: "معيار المربي", read: ["ص 75 – 89", "ص 90 – 102", "ص 118 – 128", "ص 129 – 139"] },
  { tafsir: "جزء عمّ", fiqh: "فقه العبادات", meet: "القيادة الخادمة", source: "مقالة «القيادة الخدمية»، د. محمد العامري", comp: "القيادة الخادمة", book: "مقالة «القيادة الخدمية»", read: ["مفهوم القيادة", "القيادة الخدمية", "الأنماط والنظريات", "قيادة التغيير"] },
];
const TOTAL_DAYS = 168, WEEKS = 24;
const COMPS = {
  quran: { name: "القرآنية", desc: "التفسير اليومي وورقة التدبر", icon: I.quran },
  edu: { name: "التربوية", desc: "قراءة مصادر اللقاءات وملخصاتها", icon: I.book },
  sharia: { name: "الشرعية", desc: "الملخص الفقهي الأسبوعي", icon: I.scale },
  lead: { name: "القيادية", desc: "القيادة الخادمة", icon: I.flag },
  skill: { name: "المهارية", desc: "التقرير الشهري وشواهد التطبيق", icon: I.spark },
};
const TYPES = {
  tadabbur: { name: "ورقة التدبر", hint: "المعنى والوقفة والعمل من جلسة الأسبوع", icon: I.quran, review: true },
  fiqh: { name: "الملخص الفقهي", hint: "صفحة تجمع مسائل مقاطع الأسبوع وأدلتها المختصرة", icon: I.scale, review: true },
  read: { name: "قراءة المقرر", hint: "ربع مقرر الشهر", icon: I.book, review: false },
  source: { name: "ملخص مصدر اللقاء", hint: "ملخص القراءة وشاهد تطبيق الجدارة", icon: I.file, review: true },
  report: { name: "التقرير الشهري", hint: "ما أُنجز وما تأخر، وخطة الشهر القادم", icon: I.flag, review: true },
};
const ST = {
  approved: { label: "معتمد", icon: I.check }, done: { label: "تمّ", icon: I.check },
  submitted: { label: "بانتظار التقييم", icon: I.clock }, revise: { label: "يحتاج استكمال", icon: I.alert },
  late: { label: "متأخر", icon: I.alert }, due: { label: "مطلوب", icon: I.clock }, upcoming: { label: "قادم", icon: I.clock },
};

// ───── الجدول الزمني ─────
const startDate = () => S.settings.start;
const weekStart = (w) => addDays(startDate(), (w - 1) * 7);
const weekEnd = (w) => addDays(startDate(), w * 7 - 1);
const monthOfWeek = (w) => Math.ceil(w / 4);
const meetingDate = (m) => (S.settings.meetings || [])[m - 1] || weekEnd(m * 4);
const endDate = () => addDays(startDate(), TOTAL_DAYS - 1);
// موضع اليوم: di فهرس اليوم (0..167)، سالب قبل الانطلاق
function nowPos() {
  const di = diffDays(today(), startDate());
  const c = Math.max(0, Math.min(TOTAL_DAYS - 1, di));
  const week = Math.floor(c / 7) + 1;
  return { di, phase: di < 0 ? "before" : di >= TOTAL_DAYS ? "after" : "during", day: c + 1, week, month: monthOfWeek(week) };
}
// صفحات التفسير اليومي (مصحف المدينة): وجه كل يوم من يس (ص 440)؛ الشهر الخامس 30 صفحة في 28 يوماً، والسادس 23 صفحة ثم 5 أيام مراجعة
const SURAHS = [[440, "يس"], [446, "الصافات"], [453, "ص"], [458, "الزمر"], [467, "غافر"], [477, "فصلت"], [483, "الشورى"], [489, "الزخرف"], [496, "الدخان"], [499, "الجاثية"], [502, "الأحقاف"], [507, "محمد"], [511, "الفتح"], [515, "الحجرات"], [518, "ق"], [520, "الذاريات"], [523, "الطور"], [526, "النجم"], [528, "القمر"], [531, "الرحمن"], [534, "الواقعة"], [537, "الحديد"], [542, "المجادلة"], [545, "الحشر"], [549, "الممتحنة"], [551, "الصف"], [553, "الجمعة"], [554, "المنافقون"], [556, "التغابن"], [558, "الطلاق"], [560, "التحريم"], [562, "الملك"], [564, "القلم"], [566, "الحاقة"], [568, "المعارج"], [570, "نوح"], [572, "الجن"], [574, "المزمل"], [575, "المدثر"], [577, "القيامة"], [578, "الإنسان"], [580, "المرسلات"],
  [582, "النبأ"], [583, "النازعات"], [585, "عبس"], [586, "التكوير"], [587, "الانفطار"], [587, "المطففين"], [589, "الانشقاق"], [590, "البروج"], [591, "الطارق"], [591, "الأعلى"], [592, "الغاشية"], [593, "الفجر"], [594, "البلد"], [595, "الشمس"], [595, "الليل"], [596, "الضحى"], [596, "الشرح"], [597, "التين"], [597, "العلق"], [598, "القدر"], [598, "البينة"], [599, "الزلزلة"], [599, "العاديات"], [600, "القارعة"], [600, "التكاثر"], [601, "العصر"], [601, "الهمزة"], [601, "الفيل"], [602, "قريش"], [602, "الماعون"], [602, "الكوثر"], [603, "الكافرون"], [603, "النصر"], [603, "المسد"], [604, "الإخلاص"], [604, "الفلق"], [604, "الناس"]];
function tafsirRange(di) { // [من، إلى] أو null لأيام المراجعة
  if (di < 112) return [440 + di, 440 + di];
  if (di < 138) return [552 + (di - 112), 552 + (di - 112)];
  if (di === 138) return [578, 579];
  if (di === 139) return [580, 581];
  return di - 140 < 23 ? [582 + (di - 140), 582 + (di - 140)] : null;
}
function surahsOf(a, b) { // السور التي تبدأ في الصفحات، وإلا فالسورة المستمرة
  const st = SURAHS.filter(([p]) => p >= a && p <= b).map((x) => x[1]);
  return st.length ? st.join("، ") : [...SURAHS].reverse().find(([p]) => p < a)[1];
}
const tafsirPage = (di) => { const r = tafsirRange(di); return !r ? "مراجعة" : r[0] === r[1] ? String(r[0]) : `${r[0]}–${r[1]}`; };
const tafsirLabel = (di) => { const r = tafsirRange(di); return r ? `صفحة ${tafsirPage(di)} · ${surahsOf(r[0], r[1])}` : "مراجعة جزء عمّ وختامه"; };

let REQS = [], REQ = {};
function buildReqs() {
  REQS = [];
  for (let w = 1; w <= WEEKS; w++) {
    const m = monthOfWeek(w), wi = (w - 1) % 4, base = { week: w, month: m, open: weekStart(w), due: weekEnd(w) };
    REQS.push({ id: `tadabbur-w${w}`, type: "tadabbur", comp: "quran", title: `ورقة التدبر — الأسبوع ${w}`, sub: `آيات من ${MONTHS[m].tafsir}`, ...base });
    REQS.push({ id: `fiqh-w${w}`, type: "fiqh", comp: "sharia", title: `الملخص الفقهي — الأسبوع ${w}`, sub: MONTHS[m].fiqh, ...base });
    REQS.push({ id: `read-w${w}`, type: "read", comp: m === 6 ? "lead" : "edu", title: `قراءة: ${MONTHS[m].book}`, sub: MONTHS[m].read[wi], ...base });
  }
  for (let m = 1; m <= 6; m++) {
    const base = { month: m, week: m * 4, open: weekStart(m * 4 - 3), due: meetingDate(m), monthly: true };
    REQS.push({ id: `source-m${m}`, type: "source", comp: m === 6 ? "lead" : "edu", title: `ملخص مصدر اللقاء ${ORD[m]}`, sub: MONTHS[m].source, ...base });
    REQS.push({ id: `report-m${m}`, type: "report", comp: "skill", title: `التقرير الشهري — الشهر ${ORD[m]}`, sub: "ما أُنجز وما تأخر، وخطة الشهر القادم", ...base });
  }
  REQ = Object.fromEntries(REQS.map((r) => [r.id, r]));
}
function statusOf(r) {
  const t = today();
  if (r.type === "read") return S.checks[r.id] ? "done" : t > r.due ? "late" : t >= r.open ? "due" : "upcoming";
  const s = S.subs[r.id];
  if (s) return s.status;
  return t > r.due ? "late" : t >= r.open ? "due" : "upcoming";
}
const isDone = (r) => ["approved", "submitted", "done"].includes(statusOf(r));
function dueText(r) {
  const n = diffDays(r.due, today());
  if (n === 0) return "يُسلَّم اليوم";
  if (n === 1) return "يُسلَّم غداً";
  if (n > 1) return `بعد ${daysWord(n)} · ${fmtShort(r.due)}`;
  return `منذ ${daysWord(-n)} · ${fmtShort(r.due)}`;
}

// ───── الإحصاءات ─────
function stats() {
  const p = nowPos(), t = today();
  const tafsirDone = Object.keys(S.tafsir).filter((d) => S.tafsir[d]).length;
  const passed = p.phase === "before" ? 0 : Math.min(TOTAL_DAYS, p.di + 1);
  const doneReqs = REQS.filter(isDone);
  const totalUnits = WEEKS + REQS.length;
  const overall = (tafsirDone / 7 + doneReqs.length) / totalUnits;
  const dueSoFar = REQS.filter((r) => r.due < t);
  const expected = (passed / 7 + dueSoFar.length) / totalUnits;
  const committed = passed + dueSoFar.length ? (Math.min(tafsirDone, passed) + dueSoFar.filter(isDone).length) / (passed + dueSoFar.length) : 1;
  let streak = 0, d = S.tafsir[t] ? t : addDays(t, -1);
  while (S.tafsir[d]) { streak++; d = addDays(d, -1); }
  const scores = Object.values(S.subs).filter((s) => s.score).map((s) => s.score);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const cnt = (f) => REQS.filter(f).length, dn = (f) => REQS.filter((r) => f(r) && isDone(r)).length;
  const byComp = {
    quran: (tafsirDone / 7 + dn((r) => r.type === "tadabbur")) / (WEEKS * 2),
    sharia: dn((r) => r.type === "fiqh") / WEEKS,
    edu: dn((r) => r.comp === "edu") / cnt((r) => r.comp === "edu"),
    lead: dn((r) => r.comp === "lead") / cnt((r) => r.comp === "lead"),
    skill: dn((r) => r.comp === "skill") / cnt((r) => r.comp === "skill"),
  };
  let missed = 0;
  for (let i = 0; i < passed - 1; i++) if (!S.tafsir[addDays(startDate(), i)]) missed++;
  return { tafsirDone, passed, overall, expected, committed, streak, avg, scored: scores.length, byComp, missed,
    late: REQS.filter((r) => statusOf(r) === "late"), revise: REQS.filter((r) => statusOf(r) === "revise"), pending: REQS.filter((r) => statusOf(r) === "submitted") };
}
// حالة الأسبوع لمسار المصابيح: full | part | late | now | off
function weekState(w) {
  const p = nowPos(), rs = REQS.filter((r) => r.week === w && !r.monthly);
  let t = 0;
  for (let i = 0; i < 7; i++) if (S.tafsir[addDays(weekStart(w), i)]) t++;
  const done = rs.filter(isDone).length, frac = (t / 7 + done) / (1 + rs.length);
  if (frac >= 0.999) return "full";
  if (p.phase === "during" && w === p.week) return "now";
  if (p.phase !== "before" && (w < p.week || p.phase === "after")) return frac > 0 ? "part" : "late";
  return frac > 0 ? "part" : "off";
}

// ───── الرسائل التحفيزية ─────
const QUOTES = {
  member: ["العمرُ يحتاج سرعةً للوصول إلى الإنجاز", "وجهٌ تقرؤه اليوم خيرٌ من عشرةٍ تؤجّلها إلى الغد", "السراجُ لا يضيء إلا بزيتٍ يُصبّ فيه كل يوم", "قليلٌ دائم خيرٌ من كثيرٍ منقطع", "من سار على الدرب وصل، فلا تتوقف", "ما تبنيه اليوم في نفسك يستضيء به غداً مَن حولك",
    "الإنجازُ قرارٌ يتجدد كل صباح", "الأيامُ تمضي، فاجعل لكل يومٍ أثراً", "همّتك اليوم هي حصادك في اللقاء القادم", "ابدأ الآن، فأفضل وقتٍ للإنجاز هو هذه اللحظة", "المربي يُصنع على مهل، لكنه لا يتوقف عن السير", "كل ملخصٍ ترفعه اليوم لبنةٌ في بنائك غداً"],
  reviewer: ["متابعتُك اليوم وقودٌ لهمّة من تتابعه", "كلمةُ تقييمٍ صادقة تختصر على المتربي شهوراً", "المربي يُصنع بالمتابعة قبل التوجيه", "تقييمُك السريع يُبقي السراجَ مشتعلاً", "من تابع أتقن، ومن أهمل ضيّع", "الثناءُ في موضعه يصنع إنجازاً جديداً"],
};
function pickQuote(role) {
  const list = QUOTES[role] || QUOTES.member, k = "siraj.q." + role;
  let i = (+(localStorage.getItem(k) ?? -1) + 1) % list.length;
  localStorage.setItem(k, i);
  return list[i];
}
