// عامل الخدمة لمنصة سراج: يستقبل إشعارات الدفع ويعرضها ضمن إشعارات الجهاز
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "سراج", {
    body: d.body || "", icon: "icon-192.png", badge: "icon-192.png", tag: d.id || undefined, dir: "rtl", lang: "ar", data: { req: d.req || null },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const req = e.notification.data && e.notification.data.req;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const c = all.find((x) => x.url.startsWith(self.registration.scope));
    if (c) { await c.focus(); c.postMessage({ open: req }); }
    else await self.clients.openWindow(self.registration.scope + "#/home");
  })());
});
