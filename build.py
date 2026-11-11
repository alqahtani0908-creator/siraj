#!/usr/bin/env python3
"""يجمع src/ في docs/index.html — منصة سراج."""
import pathlib
root = pathlib.Path(__file__).parent
src = root / "src"
read = lambda p: (src / p).read_text(encoding="utf-8")
js = "\n".join(read(f) for f in ["core.js", "store.js", "remote.js", "ui.js", "views.js", "extra.js", "main.js"])
html = f"""<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>سراج — منصة المتابعة</title>
<meta name="description" content="منصة متابعة مشروع سراج التأهيلي">
<meta name="theme-color" content="#11131D">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="سراج">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="manifest" href="manifest.webmanifest">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>
{read("styles.css")}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="lg"><stop offset="0" stop-color="#FFF6D0"/><stop offset=".3" stop-color="#F9C866" stop-opacity=".8"/><stop offset=".65" stop-color="#F0B354" stop-opacity=".28"/><stop offset="1" stop-color="#F0B354" stop-opacity="0"/></radialGradient><linearGradient id="lm" x1="0" x2="1"><stop offset="0" stop-color="#7A5216"/><stop offset=".35" stop-color="#E9BE6A"/><stop offset=".6" stop-color="#C8963E"/><stop offset="1" stop-color="#6B4712"/></linearGradient><linearGradient id="lgl" x1="0" x2="1"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".1"/><stop offset=".5" stop-color="#FFE9A8" stop-opacity=".34"/><stop offset="1" stop-color="#FFE9A8" stop-opacity=".1"/></linearGradient><linearGradient id="lf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F29A2E"/><stop offset=".45" stop-color="#FFD66B"/><stop offset="1" stop-color="#FFF8DC"/></linearGradient></defs></svg>
<div id="app"></div>
<div id="toasts" aria-live="polite"></div>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
<script src="config.js"></script>
<script>
{js}
</script>
</body>
</html>
"""
(root / "docs").mkdir(exist_ok=True)
(root / "docs" / "index.html").write_text(html, encoding="utf-8")
print("built", len(html) // 1024, "KB")
