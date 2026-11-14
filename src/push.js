// ───────────────────────── إشعارات الجوال (Web Push) ─────────────────────────
const PUSH_OK = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const IS_STANDALONE = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
let swReg = null;
const b64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0));
// on | off | denied | ios-install | unsupported | none (الوضع المحلي)
function pushState() {
  if (api.mode !== "remote" || !CFG?.vapidPublicKey) return "none";
  if (!PUSH_OK) return IS_IOS && !IS_STANDALONE ? "ios-install" : "unsupported";
  if (Notification.permission === "denied") return "denied";
  return Notification.permission === "granted" && localStorage.getItem("siraj.push") === "1" ? "on" : "off";
}
async function initPush() {
  if (api.mode !== "remote" || !("serviceWorker" in navigator)) return;
  try {
    swReg = await navigator.serviceWorker.register("sw.js");
    navigator.serviceWorker.addEventListener("message", (e) => { if (ME && e.data?.open && REQ[e.data.open]) reqSheet(e.data.open); });
    if (ME && pushState() === "on") await subscribePush(true); // يجدّد الاشتراك إن تغيّر
  } catch (e) { console.warn("sw", e); }
}
async function subscribePush(silent) {
  if (!PUSH_OK) throw new Error(IS_IOS && !IS_STANDALONE ? "أضف المنصة إلى الشاشة الرئيسية وافتحها من أيقونتها أولاً" : "هذا المتصفح لا يدعم الإشعارات");
  if (!silent && (await Notification.requestPermission()) !== "granted") throw new Error("لم يُسمح بالإشعارات — فعّلها من إعدادات المتصفح لهذا الموقع");
  const reg = swReg || (await navigator.serviceWorker.ready);
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(CFG.vapidPublicKey) });
  const j = sub.toJSON();
  await api.savePush(j.endpoint, j.keys.p256dh, j.keys.auth);
  localStorage.setItem("siraj.push", "1");
}
async function unsubscribePush() {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) { await api.dropPush(sub.endpoint); await sub.unsubscribe(); }
  } catch (e) { console.warn("unsub", e); }
  localStorage.removeItem("siraj.push");
}
const PUSH_TXT = {
  on: ["إشعارات الجوال مفعّلة على هذا الجهاز", "إيقاف"],
  off: ["فعّل إشعارات الجوال لتصلك التنبيهات والمنصة مغلقة", "تفعيل الإشعارات"],
  denied: ["الإشعارات محظورة لهذا الموقع — اسمح بها من إعدادات المتصفح ثم أعد المحاولة", ""],
  "ios-install": ["على الآيفون: أضف المنصة إلى الشاشة الرئيسية وافتحها من أيقونتها، ثم فعّل الإشعارات من هنا", ""],
  unsupported: ["هذا المتصفح لا يدعم إشعارات الجوال", ""],
};
async function togglePush() {
  const st = pushState();
  try {
    if (st === "on") { await unsubscribePush(); toast("أُوقفت الإشعارات على هذا الجهاز"); }
    else { await subscribePush(false); toast("فُعّلت إشعارات الجوال", "ok"); }
  } catch (e) { toast(e.message || String(e), "err"); }
  if (sheetEl) { closeSheet(); accountSheet(); } else rerender();
}
