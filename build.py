#!/usr/bin/env python3
"""يجمع src/ في docs/index.html — منصة سراج."""
import pathlib
root = pathlib.Path(__file__).parent
src = root / "src"
read = lambda p: (src / p).read_text(encoding="utf-8")
js = "\n".join(read(f) for f in ["core.js", "store.js", "remote.js", "ui.js", "views.js", "main.js"])
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
<style>
{read("styles.css")}
</style>
</head>
<body>
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
