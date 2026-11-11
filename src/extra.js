// ───────────────────────── محتوى المشروع (وثيقة سراج كاملة) ─────────────────────────
const LINKS = { fiqh1: "https://www.youtube.com/watch?v=OQfMcVwehII&list=PLF8wQ8_AW0LxNTFYRmIZVrPxZxoGuIBT3", fiqh2: "https://www.youtube.com/playlist?list=PLF8wQ8_AW0Lx2OJqaZ6OjoQsgTx9hzfaL", article: "https://mohammedaameri.com/blog/220" };
const ext = (u, t) => `<a class="xl" href="${u}" target="_blank" rel="noopener">${I.out}${t}</a>`;
const steps = (a) => `<ol class="steps">${a.map((x, i) => `<li><i>${i + 1}</i><span>${x}</span></li>`).join("")}</ol>`;
const tbl = (head, rows, cls = "") => `<div class="tw"><table class="tb ${cls}"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`;
const GUIDE = [
  ["idea", "فكرة المشروع"], ["refs", "المراجع"], ["tafsir", "صفحات التفسير"], ["comps", "الجدارات"], ["quran", "القرآنية"], ["edu", "التربوية والقيادية"], ["sharia", "الشرعية"], ["skill", "القيادية والمهارية"],
  ["time", "المسار الزمني"], ["meet", "اللقاءات"], ["read", "القراءة"], ["week", "الإيقاع الأسبوعي"], ["monthly", "اللقاء الشهري"], ["uploads", "ما يُرفع"], ["roles", "الأطراف"], ["out", "المخرج النهائي"],
];
const REFS = [
  { id: "tafsir", comp: "quran", title: "التفسير الميسر", by: "ربع يس: من سورة يس إلى سورة الناس", part: "صفحات المصحف 440 – 604 · وجهٌ كل يوم", when: "طوال الأشهر الستة" },
  { id: "fiqh1", comp: "sharia", title: "الفقه الأكبر والمدخل", by: "سلسلة مرئية", part: "تؤسس للتأهيل الشرعي قبل أبواب العبادات", when: "الشهر الأول", url: LINKS.fiqh1, urlText: "السلسلة على يوتيوب" },
  { id: "fiqh2", comp: "sharia", title: "فقه العبادات: التأهيل الفقهي", by: "سلسلة مرئية · 39 مقطعاً", part: "قرابة مقطعين في الأسبوع", when: "من الشهر الثاني إلى السادس", url: LINKS.fiqh2, urlText: "السلسلة على يوتيوب" },
  { id: "b1", comp: "edu", title: "أصول التربية الإسلامية", by: "عبدالرحمن النحلاوي", part: "الفصل الرابع: غاية التربية الإسلامية وهدفها · ص 88 – 107 (20 صفحة)", when: "الشهر الأول · اللقاء الأول" },
  { id: "b2", comp: "skill", title: "المذهّبات", by: "فايز الزهراني", part: "تربية العقل الناقد · ص 55 – 72 (18 صفحة)", when: "الشهر الثاني · اللقاء الثاني" },
  { id: "b3", comp: "edu", title: "التربية من جديد", by: "فايز الزهراني", part: "المبحث السابع: المربون في العصر الجديد · ص 215 – 234 (20 صفحة)", when: "الشهر الثالث · اللقاء الثالث" },
  { id: "b4", comp: "edu", title: "المعايشة التربوية", by: "سالم البطاطي", part: "الكتاب كاملاً · ص 3 – 50 (48 صفحة)", when: "الشهر الرابع · اللقاء الرابع" },
  { id: "b5", comp: "edu", title: "معيار المربي", by: "فايز الزهراني", part: "قسما شخصية المربي والمهارات التربوية · ص 75 – 139 (50 صفحة)", when: "الشهر الخامس · اللقاء الخامس" },
  { id: "b6", comp: "lead", title: "مقالة «القيادة الخدمية»", by: "د. محمد العامري", part: "مفهوم القيادة · القيادة الخدمية · الأنماط والنظريات · قيادة التغيير", when: "الشهر السادس · اللقاء السادس", url: LINKS.article, urlText: "قراءة المقالة" },
];
const REF_MATCH = [["tafsir", /تفسير/], ["b1", /أصول التربية|اصول التربية|النحلاوي/], ["b2", /المذهبات|المذهّبات/], ["b3", /التربية من جديد/], ["b4", /المعايشة/], ["b5", /معيار المربي/], ["b6", /القيادة الخدمية/]];
async function bulkRefs(files) {
  let n = 0; const miss = [];
  for (const f of files) {
    if (f.size > 50 * 1024 * 1024) { miss.push(f.name + " (أكبر من 50 م.ب)"); continue; }
    const m = REF_MATCH.find(([, re]) => re.test(f.name.normalize("NFC")));
    if (!m) { miss.push(f.name); continue; }
    toast(`جارٍ رفع: ${f.name}`);
    await api.addRef(m[0], { label: REFS.find((r) => r.id === m[0]).title + " (PDF)", file: f }); n++;
  }
  rerender();
  toast(n ? `رُفع ${n} من الكتب${miss.length ? ` · لم أتعرف على: ${miss.join("، ")}` : ""}` : `لم أتعرف على الملفات: ${miss.join("، ")}`, n ? "ok" : "err");
}
function refsBlock() {
  const rev = ME && !isMember(), R = S.settings.refs || {};
  return `${rev ? `<label class="drop bulk">${I.upload}<span><b>رفع كتب المراجع دفعة واحدة</b><br><small>اختر ملفات الكتب معاً، وتُربط كل واحدة بمرجعها تلقائياً من اسم الملف</small></span><input id="bulk-refs" type="file" accept=".pdf" multiple hidden></label>` : ""}<div class="reflist">${REFS.map((r) => `<div class="ref"><span class="ric c-${r.comp}">${COMPS[r.comp].icon}</span><div class="grow"><small>${r.when}</small><b>${r.title}</b><small>${r.by}</small><small>${r.part}</small>
    <div class="ratt">${r.url ? ext(r.url, r.urlText) : ""}${(R[r.id] || []).map((x) => `<span class="xl att"><button data-refopen="${r.id}:${x.id}">${x.url ? I.out : I.file}${esc(x.label)}</button>${rev ? `<button class="rx" data-refdel="${r.id}:${x.id}" aria-label="حذف">${I.x}</button>` : ""}</span>`).join("")}${rev ? `<button class="xl add" data-refadd="${r.id}">${I.plus} إضافة رابط أو ملف</button>` : ""}</div></div></div>`).join("")}</div>
    <p class="hint">${rev ? "أرفق لكل مرجع رابطه أو ملفه (PDF) ليفتحه المستفيد من المنصة مباشرة. الملفات تُحفظ في مخزن خاص بالحسابين." : "المراجع التي أرفق المتابع روابطها أو ملفاتها تُفتح من هنا مباشرة."}</p>`;
}
function tafsirTable() {
  const p = nowPos(), t = today();
  return [1, 2, 3, 4, 5, 6].map((m) => `<details class="tfm" ${(p.phase === "during" ? p.month : 1) === m ? "open" : ""}><summary><b>الشهر ${ORD[m]}</b><span>${MONTHS[m].tafsir}</span><small>${fmtShort(weekStart(m * 4 - 3))} – ${fmtShort(weekEnd(m * 4))}</small></summary>
    <div class="tw"><table class="tb tft"><thead><tr><th>اليوم</th><th>التاريخ</th><th>الصفحة</th><th>السورة</th><th></th></tr></thead><tbody>${Array.from({ length: 28 }, (_, i) => { const di = (m - 1) * 28 + i, ds = addDays(startDate(), di), r = tafsirRange(di);
      return `${i % 7 === 0 ? `<tr class="wk"><td colspan="5">الأسبوع ${di / 7 + 1}</td></tr>` : ""}<tr class="${ds === t ? "now" : ""}"><th>${di + 1}</th><td>${fmtDay(ds)}</td><td>${r ? tafsirPage(di) : "—"}</td><td>${r ? surahsOf(r[0], r[1]) : "مراجعة جزء عمّ وختامه"}</td><td>${S.tafsir[ds] ? `<span class="rc approved">أُنجز</span>` : ds < t ? `<span class="rc late">فائت</span>` : ""}</td></tr>`; }).join("")}</tbody></table></div></details>`).join("");
}
function refSheet(refId) {
  const r = REFS.find((x) => x.id === refId);
  openSheet(`<h2>إرفاق مرجع</h2><p class="mute">${r.title} — ${r.by}</p>
    <label>الاسم الظاهر<input id="rf-l" value="${esc(r.title)}"></label>
    <label>رابط (اختياري)<input id="rf-u" dir="ltr" placeholder="https://"></label>
    <label class="drop">${I.upload}<span id="rf-n">أو أرفق ملفاً (PDF حتى 50 م.ب)</span><input id="rf-f" type="file" accept=".pdf,.doc,.docx,.epub,image/*" hidden></label>
    <button class="btn gold wide" data-ok>إضافة</button>`, (el) => {
    let file = null;
    $("#rf-f", el).onchange = (e) => { file = e.target.files[0] || null; if (file && file.size > 50 * 1024 * 1024) { file = null; return toast("الحد الأقصى 50 م.ب", "err"); } if (file) $("#rf-n", el).textContent = file.name; };
    $("[data-ok]", el).onclick = async (e) => {
      const url = $("#rf-u", el).value.trim(), label = $("#rf-l", el).value.trim() || r.title;
      if (!file && !/^https?:\/\//i.test(url)) return toast("أدخل رابطاً يبدأ بـ https أو أرفق ملفاً", "err");
      e.currentTarget.disabled = true;
      try { await api.addRef(refId, { label, url, file }); closeSheet(); rerender(); toast("أُضيف المرجع", "ok"); } catch (err) { e.currentTarget.disabled = false; toast("تعذّرت الإضافة: " + err.message, "err"); }
    };
  });
}
function guideView() {
  const sec = (id, kicker, title, lead, body) => `<section class="card gsec" id="g-${id}"><small class="kick">${kicker}</small><h2>${title}</h2>${lead ? `<p class="lead">${lead}</p>` : ""}${body}</section>`;
  const ms = [1, 2, 3, 4, 5, 6];
  return `<section class="mhead ghead"><div class="h-rays"></div>${lantern("gl")}<small>المجلس التربوي · مشروع تأهيلي ذاتي · ستة أشهر</small><h1>سراج</h1>
      <p>مشروعٌ يُعِدّ المربي في خمس جدارات: قرآنية، وتربوية، وشرعية، وقيادية، ومهارية</p>
      <div class="mgrid"><div><small>آلية التنفيذ</small><b>تعلّم ذاتي ولقاء شهري</b></div><div><small>مالك المشروع</small><b>المجلس التربوي</b></div><div><small>انطلاق المشروع</small><b>${fmtDay(startDate())}</b></div><div><small>اللقاء الختامي</small><b>نهاية الشهر السادس</b></div></div></section>
    <div class="tabs gtabs">${GUIDE.map(([id, t]) => `<button data-gsec="${id}">${t}</button>`).join("")}</div>
    ${sec("idea", "01 · فكرة المشروع", "مشروعٌ ذاتيّ يمتد ستة أشهر", "يُعِدّ المربي في خمس جدارات، ويجمعه كل شهر لقاءٌ يعمّق المعنى الكبير من كل جدارة.",
      steps(["تفسير وجهٍ كل يوم", "جلسة تدبرية أسبوعية", "ملخص فقهي أسبوعي", "لقاء شهري", "منصة تحفظ الإنجاز"]) +
      `<div class="nums"><div><b>5</b><span>جدارات</span><small>قرآنية، تربوية، شرعية، قيادية، مهارية</small></div><div><b>6</b><span>أشهر</span><small>مدة المشروع بطابع ذاتي</small></div><div><b>6</b><span>لقاءات شهرية</span><small>لكل لقاء عنوانه ومصدره القرائي</small></div><div><b>24</b><span>جلسة تدبرية</span><small>بواقع جلسة كل أسبوع</small></div></div>`)}
    ${sec("refs", "المراجع", "مراجع المشروع ومصادره", "كل ما يُقرأ ويُشاهد في المشروع، مع موضعه من الخطة.", refsBlock())}
    ${sec("tafsir", "التفسير اليومي", "صفحات التفسير لكل يوم", "وجهٌ من التفسير الميسر كل يوم بصفحات مصحف المدينة، من سورة يس (ص 440) إلى سورة الناس (ص 604).", tafsirTable() + `<p class="hint">في الشهر الخامس 30 صفحة في 28 يوماً، فيُقرأ في آخر يومين منه صفحتان. وفي الشهر السادس 23 صفحة، وتبقى خمسة أيام للمراجعة والختام.</p>`)}
    ${sec("comps", "02 · جدارات المشروع", "خمس جدارات تبني المربي", "لكل جدارة مكوّناتها ومصادرها، وموضعها في خطة الأشهر الستة.",
      `<div class="glist">${[["quran", "القرآنية", "التفسير الميسر لربع يس وجهاً كل يوم، وجلسة تدبرية أسبوعية"], ["edu", "التربوية", "الغاية التربوية، المراحل العمرية، القيادة التربوية، القرار التربوي، مهارات المربي"], ["sharia", "الشرعية", "الفقه الأكبر والمدخل، ثم فقه العبادات، مع ملخص أسبوعي"], ["lead", "القيادية", "القيادة الخادمة"], ["skill", "المهارية", "التفكير الناقد، التعلم الذاتي، تقديم البرامج والتحضير المتقن"]].map(([k, n, d]) => `<div class="gitem"><span class="ric c-${k}">${COMPS[k].icon}</span><div><b>${n}</b><small>${d}</small></div></div>`).join("")}</div>`)}
    ${sec("quran", "03 · الجدارة القرآنية", "تفسيرٌ يُقرأ، وتدبّرٌ يُعاش", "وجهٌ كل يوم من التفسير الميسر لربع يس، وجلسة تدبر كل أسبوع.",
      `<h3>توزيع التفسير على الأشهر، بواقع وجهٍ يومياً</h3><div class="chips6">${ms.map((m) => `<div><small>الشهر ${ORD[m]}</small><b>${MONTHS[m].tafsir}</b></div>`).join("")}</div>
       <h3>الجلسة التدبرية الأسبوعية</h3>${steps(["اختيار آيات من أوجه الأسبوع", "تدوين المعنى والوقفة والعمل", "رفع ورقة التدبر على المنصة", "عرض أبرز الوقفات في اللقاء الشهري"])}`)}
    ${sec("edu", "04 · الجدارتان التربوية والقيادية", "ستة مكوّنات، ولكلٍّ مصدره", "يُقرأ المصدر خلال الشهر، ثم يُعمَّق في لقائه.",
      tbl(["المكوّن", "اللقاء", "المصدر"], [["الغاية التربوية", "الأول", "أصول التربية الإسلامية، النحلاوي: الفصل الرابع، غاية التربية الإسلامية وهدفها"], ["المراحل العمرية", "الثالث", "التربية من جديد، فايز الزهراني: المربون في العصر الجديد"], ["القيادة التربوية", "الرابع", "المعايشة التربوية، سالم البطاطي: الكتاب كاملاً"], ["القرار التربوي", "الرابع", "المعايشة التربوية، سالم البطاطي: الكتاب كاملاً"], ["مهارات المربي", "الخامس", "معيار المربي، فايز الزهراني: قسما شخصية المربي والمهارات التربوية"], ["القيادة الخادمة", "السادس", "مقالة «القيادة الخدمية»، د. محمد العامري"]]))}
    ${sec("sharia", "05 · الجدارة الشرعية", "مدخلٌ يؤسس، وفقهٌ يُعبَد به", "سلسلتان مرئيتان، يُختم كل أسبوع منهما بملخص يُرفع على المنصة.",
      `<div class="glist"><div class="gitem col"><small>أولاً · الشهر الأول</small><b>الفقه الأكبر والمدخل</b><small>سلسلة مرئية تؤسس للتأهيل الشرعي قبل الدخول في أبواب العبادات</small>${ext(LINKS.fiqh1, "رابط السلسلة على يوتيوب")}</div>
       <div class="gitem col"><small>ثانياً · من الشهر الثاني إلى السادس</small><b>فقه العبادات: التأهيل الفقهي</b><small>39 مقطعاً مقسّماً، بواقع مقطعين تقريباً في الأسبوع</small>${ext(LINKS.fiqh2, "رابط السلسلة على يوتيوب")}</div></div>
       <p class="hint">الملخص الأسبوعي: صفحة واحدة تجمع مسائل مقاطع الأسبوع وأدلتها المختصرة.</p>`)}
    ${sec("skill", "06 · الجدارتان القيادية والمهارية", "قيادةٌ تخدم، ومهاراتٌ تُتقن", "ولكل مهارة أدواتها التطبيقية، تُعرض في لقاء شهرها.",
      `<h3>الجدارة القيادية · اللقاء السادس: القيادة الخادمة</h3><ul class="bul"><li>مفهوم القيادة والفرق بينها وبين الإدارة</li><li>صفات القائد الخادم ونماذج من السيرة</li><li>قيادة التغيير ومفاتيحه</li></ul>${ext(LINKS.article, "مقالة «القيادة الخدمية»، د. محمد العامري")}
       <h3>الجدارة المهارية</h3><div class="glist">${[["اللقاء الأول", "التعلم الذاتي", "أدواته التطبيقية لبناء خطة التعلم في المشروع"], ["اللقاء الثاني", "التفكير الناقد", "المذهّبات، فايز الزهراني: تربية العقل الناقد"], ["اللقاء الثالث", "تقديم البرامج والتحضير المتقن", "أدواته التطبيقية في الإعداد والتقديم"]].map(([a, b, c]) => `<div class="gitem col"><small>${a}</small><b>${b}</b><small>${c}</small></div>`).join("")}</div>`)}
    ${sec("time", "07 · المسار الزمني", "مسار ستة أشهر", "وطوال الأشهر الستة: وجهٌ من التفسير كل يوم، وجلسة تدبر وملخص فقهي كل أسبوع.",
      tbl(["الشهر", "الفترة", "التفسير الميسر", "التأهيل الشرعي", "اللقاء الشهري"], ms.map((m) => [ORD[m], `${fmtShort(weekStart(m * 4 - 3))} – ${fmtShort(weekEnd(m * 4))}`, MONTHS[m].tafsir, MONTHS[m].fiqh, MONTHS[m].meet])))}
    ${sec("meet", "08 · خطة اللقاءات", "ستة لقاءات، لكلٍّ عنوانه ومصدره", "ويتضمن كل لقاء حديثاً عن الأدوات التطبيقية لمهارة شهره.",
      tbl(["اللقاء", "العنوان", "المصدر", "الجدارة", "الموعد"], ms.map((m) => [m, MONTHS[m].meet, MONTHS[m].source, MONTHS[m].comp, fmtShort(meetingDate(m))])))}
    ${sec("read", "09 · القراءة الذاتية", "مقرر كل شهر، مقسّماً على أسابيعه", "ربع المقرر كل أسبوع، ويُرفع ملخص القراءة قبل لقاء الشهر.",
      tbl(["الشهر والمقرر", "الأسبوع الأول", "الأسبوع الثاني", "الأسبوع الثالث", "الأسبوع الرابع"], ms.map((m) => [`${m} · ${MONTHS[m].book}`, ...MONTHS[m].read])))}
    ${sec("week", "10 · الإيقاع الأسبوعي", "أسبوعك في سراج", "خمس عادات أسبوعية، ولكل منها مخرجٌ يُرفع على المنصة.",
      tbl(["النشاط", "الإيقاع", "ما يُرفع على المنصة"], [["التفسير الميسر", "وجهٌ كل يوم", "تسجيل إنجاز الأوجه"], ["الجلسة التدبرية", "جلسة كل أسبوع", "ورقة التدبر"], ["التأهيل الشرعي", "مقاطع السلسلة، قرابة مقطعين أسبوعياً", "الملخص الفقهي الأسبوعي"], ["مصدر اللقاء", "ربع المقرر كل أسبوع", "ملخص القراءة وشاهد التطبيق"], ["مراجعة الأسبوع", "نهاية كل أسبوع", "تحديث ملف الإنجاز"]]))}
    ${sec("monthly", "11 · اللقاء الشهري", "من الإنجاز إلى المعنى الكبير", "لقاءٌ كل شهر بعنوان محدد، يعمّق جدارة الشهر ويربطها بالغاية التربوية الكبرى. ستة لقاءات يديرها المجلس التربوي، ولكل لقاء مصدرٌ قرائي.",
      steps(["مراجعة إنجاز الشهر على المنصة", "مناقشة مصدر اللقاء وتعميق الجدارة", "الأدوات التطبيقية لمهارة الشهر", "المعنى الكبير ومهام الشهر القادم"]))}
    ${sec("uploads", "12 · منصة المتابعة", "كل إنجازٍ يُرفع، وكل ملخصٍ يُحفظ", "يراجع المجلس التربوي ما يُرفع قبل كل لقاء، وتبقى الملفات مرجعاً بعد المشروع.",
      `<div class="glist">${[["أسبوعياً", "ورقة التدبر", "المعنى والوقفة والعمل من جلسة الأسبوع"], ["أسبوعياً", "الملخص الفقهي", "صفحة تجمع مسائل مقاطع الأسبوع وأدلتها المختصرة"], ["شهرياً", "ملخص مصدر اللقاء", "ملخص القراءة وشاهد تطبيق الجدارة"], ["قبل كل لقاء", "التقرير الشهري", "ما أُنجز وما تأخر، وخطة الشهر القادم"]].map(([a, b, c]) => `<div class="gitem col"><small>${a}</small><b>${b}</b><small>${c}</small></div>`).join("")}</div>`)}
    ${sec("roles", "13 · أطراف المشروع", "مالكٌ يتابع، ومستفيدٌ يُنجز", "مسؤوليات واضحة لكل طرف طوال الأشهر الستة.",
      `<div class="cols2"><div class="gitem col"><small>مالك المشروع</small><b>المجلس التربوي</b><ul class="bul"><li>اعتماد خطة المشروع ومصادره</li><li>إدارة اللقاءات الشهرية الستة</li><li>مراجعة ما يُرفع على المنصة</li><li>اعتماد إتمام المشروع</li></ul></div>
       <div class="gitem col"><small>المستفيد</small><b>${esc(S.settings.names.member)}</b><ul class="bul"><li>الالتزام بالورد والجلسة والملخص الأسبوعي</li><li>قراءة مصدر كل لقاء قبل موعده</li><li>حضور اللقاءات الشهرية الستة</li><li>تطبيق كل جدارة في الميدان وتوثيقها</li></ul></div></div>`)}
    ${sec("out", "14 · المخرج النهائي", "ما يخرج به المربي بعد ستة أشهر", "ملف الإنجاز: كل ما سبق محفوظ على المنصة، ويُعرض حصاده في اللقاء الختامي.",
      `<div class="glist">${[["01", "تفسير وتدبر", "إتمام التفسير الميسر لربع يس، مع أوراق تدبر أسبوعية محفوظة"], ["02", "ملف شرعي", "ملخصات أسبوعية للفقه الأكبر والمدخل وفقه العبادات، مرجعٌ عملي للمربي"], ["03", "جدارات موثقة", "ملخصات مصادر اللقاءات الستة وشواهد تطبيقها، وبرنامج تربوي محضّر ومقدَّم"]].map(([a, b, c]) => `<div class="gitem col"><small>${a}</small><b>${b}</b><small>${c}</small></div>`).join("")}</div>`)}
    <section class="mhead gend"><div class="h-rays"></div><h1>سراج</h1><p>نورٌ يُوقَد في المربي، ليضيء به مَن حوله</p></section>`;
}

// ───────────────────────── تقرير المستفيد (للطباعة) ─────────────────────────
function reportView() {
  const st = stats(), p = nowPos(), t = today(), ms = [1, 2, 3, 4, 5, 6];
  const subs = Object.values(S.subs).filter((s) => REQ[s.reqId]).sort((a, b) => (REQ[a.reqId].due < REQ[b.reqId].due ? -1 : 1));
  const reviewable = REQS.filter((r) => r.type !== "read"), dueR = reviewable.filter((r) => r.due < t);
  const approved = subs.filter((s) => s.status === "approved").length;
  const kpi = [[pct(st.overall) + "٪", "الإنجاز الكلي", `المخطط حتى اليوم ${pct(st.expected)}٪`], [p.phase === "before" ? "—" : pct(st.committed) + "٪", "نسبة الالتزام", "مما حلّ موعده"], [st.avg ? st.avg.toFixed(1) : "—", "متوسط التقييم", st.scored ? `من 5 · ${st.scored} تقييماً` : "لا تقييمات بعد"],
    [`${st.tafsirDone}`, "أوجه التفسير", `من ${TOTAL_DAYS} وجهاً`], [`${subs.length}`, "ملفات مرفوعة", `${approved} معتمدة`], [`${st.late.length}`, "متطلبات متأخرة", st.revise.length ? `${st.revise.length} تحتاج استكمالاً` : "لا استكمالات معلّقة"]];
  const stName = { approved: "معتمد", submitted: "بانتظار التقييم", revise: "يحتاج استكمالاً", late: "متأخر", due: "مطلوب", upcoming: "قادم", done: "تمّ" };
  const cell = (r) => { const s = statusOf(r); return `<span class="rc ${s}">${s === "approved" && S.subs[r.id]?.score ? S.subs[r.id].score + "/5" : s === "upcoming" ? "·" : stName[s]}</span>`; };
  const heat = Array.from({ length: WEEKS }, (_, w) => `<div class="hw">${Array.from({ length: 7 }, (_, d) => { const ds = addDays(startDate(), w * 7 + d); return `<i class="${S.tafsir[ds] ? "on" : ds < t ? "miss" : ds === t ? "now" : ""}"></i>`; }).join("")}<small>${w + 1}</small></div>`).join("");
  const mrows = ms.map((m) => {
    const ws = [1, 2, 3, 4].map((i) => (m - 1) * 4 + i); let td = 0;
    for (let i = 0; i < 28; i++) if (S.tafsir[addDays(weekStart(ws[0]), i)]) td++;
    const c = (ty) => ws.filter((w) => isDone(REQ[`${ty}-w${w}`])).length;
    const sc = REQS.filter((r) => r.month === m && S.subs[r.id]?.score).map((r) => S.subs[r.id].score);
    return [`${ORD[m]}<small>${MONTHS[m].meet}</small>`, `${td}/28`, `${c("tadabbur")}/4`, `${c("fiqh")}/4`, `${c("read")}/4`, cell(REQ[`source-m${m}`]), cell(REQ[`report-m${m}`]), sc.length ? (sc.reduce((a, b) => a + b, 0) / sc.length).toFixed(1) : "—"];
  });
  const open = [...st.revise, ...st.late];
  return `<div class="rp-tools"><div><h2>تقرير المستفيد</h2><small>يُطبع على ورق A4 أو يُحفظ بصيغة PDF من نافذة الطباعة</small></div><button class="btn gold" data-print>${I.file} طباعة / حفظ PDF</button></div>
  <article class="report">
    <header class="rp-head"><div class="h-rays"></div>${lantern("rpl")}<div class="grow"><small>مشروع سراج · المجلس التربوي</small><h1>تقرير إنجاز المستفيد</h1><h2>${esc(S.settings.names.member)}</h2></div>
      <div class="rp-date"><small>تاريخ التقرير</small><b>${fmtDay(t)}</b><small>${fmtHijri(t)}</small><small>${p.phase === "before" ? "قبل انطلاق المشروع" : p.phase === "after" ? "بعد ختام المشروع" : `اليوم ${p.day} من ${TOTAL_DAYS} · الأسبوع ${p.week} · الشهر ${ORD[p.month]}`}</small></div></header>
    <section class="rp-kpis">${kpi.map(([v, l, s]) => `<div><b>${v}</b><span>${l}</span><small>${s}</small></div>`).join("")}</section>
    <section class="rp-row">
      <div class="rp-box rp-ring"><h3>التقدم الكلي</h3>${ring(st.overall, `<b>${pct(st.overall)}<i>٪</i></b><small>من المشروع</small>`)}
        <div class="rp-vs"><div><span>الفعلي</span><div class="bar"><i style="width:${pct(st.overall)}%;background:var(--gold)"></i></div><em>${pct(st.overall)}٪</em></div><div><span>المخطط</span><div class="bar"><i style="width:${pct(st.expected)}%;background:var(--night3)"></i></div><em>${pct(st.expected)}٪</em></div></div>
        <p class="rp-verdict ${st.overall - st.expected >= -0.01 && !st.late.length ? "good" : "slow"}">${p.phase === "before" ? "لم يبدأ المشروع بعد" : st.overall - st.expected >= -0.01 && !st.late.length ? "المستفيد على المسار المخطط" : st.late.length ? `متأخر في ${st.late.length} من المتطلبات` : `متأخر ${Math.max(1, pct(st.expected - st.overall))}٪ عن المخطط`}</p></div>
      <div class="rp-box"><h3>الجدارات الخمس</h3><div class="comps">${Object.entries(COMPS).map(([k, c]) => `<div class="comp"><span class="ric c-${k}">${c.icon}</span><div class="grow"><div class="row"><b>${c.name}</b><span class="grow"></span><em>${pct(st.byComp[k])}٪</em></div><div class="bar"><i class="c-${k}" style="width:${pct(st.byComp[k])}%"></i></div><small>${c.desc}</small></div></div>`).join("")}</div></div>
    </section>
    <section class="rp-box"><h3>خريطة الورد اليومي — التفسير الميسر <small>(${st.tafsirDone} من ${st.passed} يوماً مضت · أطول التزام حالي ${daysWord(st.streak || 0)})</small></h3>
      <div class="heat">${heat}</div><div class="legend"><span><i class="sq on"></i>مُنجز</span><span><i class="sq miss"></i>فائت</span><span><i class="sq"></i>قادم</span><span>الأعمدة: أسابيع المشروع (1–24) · الصفوف: السبت إلى الجمعة</span></div></section>
    <section class="rp-box"><h3>الإنجاز الشهري</h3>${tbl(["الشهر", "التفسير", "التدبر", "الفقه", "القراءة", "ملخص المصدر", "التقرير الشهري", "متوسط التقييم"], mrows, "rpt")}</section>
    <section class="rp-box"><h3>سجل المتطلبات المرفوعة وتقييمها <small>(${subs.length} من ${dueR.length} حلّ موعدها)</small></h3>
      ${subs.length ? tbl(["المتطلب", "تاريخ الرفع", "الحالة", "التقييم", "ملاحظة المقيّم"], subs.map((s) => [esc(REQ[s.reqId].title), fmtShort(d2s(new Date(s.at))), `<span class="rc ${s.status}">${stName[s.status]}</span>`, s.score ? stars(s.score, "sm") : "—", esc(s.note || "—")]), "rpt log") : `<p class="mute">لم تُرفع متطلبات بعد.</p>`}</section>
    ${open.length ? `<section class="rp-box"><h3>متطلبات تحتاج متابعة</h3>${tbl(["المتطلب", "الحالة", "الموعد"], open.map((r) => [esc(r.title), `<span class="rc ${statusOf(r)}">${stName[statusOf(r)]}</span>`, dueText(r)]), "rpt")}</section>` : ""}
    <section class="rp-box rp-note"><h3>ملاحظات المتابع وتوصياته</h3><div class="rp-edit" contenteditable="${isMember() ? "false" : "true"}" data-ph="${isMember() ? "" : "اكتب هنا ملاحظاتك قبل الطباعة…"}"></div>
      <div class="rp-sign"><div><small>المتابع والمقيّم</small><b>${esc(S.settings.names.reviewer)}</b><i></i></div><div><small>المستفيد</small><b>${esc(S.settings.names.member)}</b><i></i></div></div></section>
    <footer class="rp-foot">منصة سراج · نورٌ يُوقَد في المربي، ليضيء به مَن حوله · صدر التقرير ${fmtShort(t)}</footer>
  </article>`;
}
