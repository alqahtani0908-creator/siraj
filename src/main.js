// ───────────────────────── التشغيل والتوجيه ─────────────────────────
function route() { const [r, a] = (location.hash.replace(/^#\/?/, "") || "home").split("/"); return { r: ["home", "path", "cal", "file"].includes(r) ? r : "home", a }; }
function render() {
  const app = $("#app");
  if (!ME) { app.innerHTML = loginView(); return; }
  const { r, a } = route(), y = window.scrollY;
  app.innerHTML = shell(r);
  $("#view").innerHTML = `<div class="page p-${r} ${render.keep ? "" : "anim"}">${{ home: homeView, path: () => pathView(a), cal: calView, file: fileView }[r]()}</div>`;
  window.scrollTo(0, render.keep ? y : 0); render.keep = false;
}
const rerender = () => { render.keep = true; render(); };

document.addEventListener("click", async (e) => {
  const q = (s) => e.target.closest(s);
  let b;
  if ((b = q("[data-authmode]"))) { const f = $("#authf"); f.dataset.mode = f.dataset.mode === "in" ? "act" : "in"; $("[name=password]", f).autocomplete = f.dataset.mode === "in" ? "current-password" : "new-password"; return; }
  if ((b = q("[data-login]"))) { await api.signIn(b.dataset.login); location.hash = "#/home"; render(); showGreeting(); return; }
  if ((b = q("[data-act]"))) return { notifs: notifSheet, account: accountSheet }[b.dataset.act]?.();
  if (sheetEl?.contains(e.target)) return;
  if ((b = q("[data-nudge]"))) { e.stopPropagation(); await api.nudge(b.dataset.nudge); return toast("أُرسل التذكير للمستفيد", "ok"); }
  if ((b = q("[data-tafsir-today]"))) { if (!isMember()) return; const t = today(); await api.setTafsir(t, !S.tafsir[t]); if (S.tafsir[t]) toast("بارك الله فيك — سُجّل وجه اليوم", "ok"); return rerender(); }
  if ((b = q("[data-tafsir]"))) { const d = b.dataset.tafsir; await api.setTafsir(d, !S.tafsir[d]); return rerender(); }
  if ((b = q("[data-delev]"))) { await api.delEvent(b.dataset.delev); return rerender(); }
  if ((b = q("[data-addev]"))) return eventSheet();
  if ((b = q("[data-readn]"))) { await api.markRead([b.dataset.readn]); if (!b.dataset.req) return rerender(); }
  if ((b = q("[data-req]"))) return reqSheet(b.dataset.req);
  if ((b = q("[data-go]"))) return (location.hash = b.dataset.go);
  if ((b = q("[data-day]"))) { calSel = b.dataset.day; return rerender(); }
  if ((b = q("[data-cal]"))) { const [y, m] = calYM.split("-").map(Number), d = new Date(y, m - 1 + +b.dataset.cal, 1, 12); calYM = d2s(d).slice(0, 7); return rerender(); }
  if ((b = q("[data-ff]"))) { fileFilter = b.dataset.ff; return rerender(); }
});
document.addEventListener("submit", async (e) => {
  const f = e.target.closest("#authf"); if (!f) return;
  e.preventDefault();
  const d = Object.fromEntries(new FormData(f)), btn = $("button[type=submit]", f);
  if (!d.email || !d.password) return toast("أدخل البريد وكلمة المرور", "err");
  btn.disabled = true;
  try {
    if (f.dataset.mode === "act") await api.activate(d.email, d.code || "", d.password); else await api.signIn(d.email, d.password);
    location.hash = "#/home"; render(); showGreeting();
  } catch (err) { btn.disabled = false; toast(/Invalid login/i.test(err.message) ? "البريد أو كلمة المرور غير صحيحة" : err.message, "err"); }
});
window.addEventListener("unhandledrejection", (e) => { toast("تعذّر تنفيذ العملية: " + (e.reason?.message || e.reason), "err"); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); if (e.key === "Enter" && e.target.matches?.(".al[role=button]")) e.target.click(); });
window.addEventListener("hashchange", () => { closeSheet(); render(); });
// مزامنة فورية بين نافذتين في المتصفح نفسه (حساب المتابع وحساب المستفيد)
window.addEventListener("storage", (e) => {
  if (api.mode !== "local" || e.key !== KEY || !ME) return;
  const before = unreadMine().length; api.read();
  const now = unreadMine();
  if (now.length > before) toast(now[0].title + (now[0].body ? " — " + now[0].body : ""), "notif");
  if (!sheetEl) rerender();
});

(async function boot() {
  if (api.mode === "remote") await cachedFonts();
  try { await api.load(); } catch (err) { console.error(err); toast("تعذّر الاتصال بقاعدة البيانات", "err"); }
  try { await Promise.race([document.fonts.load('700 20px "Thmanyah Serif Text"'), new Promise((r) => setTimeout(r, 1500))]); } catch {}
  render();
  showGreeting();
})();
