export function handleReadmePreview(): Response {
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>README Preview</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;display:flex;flex-direction:column;align-items:center;gap:40px;padding:40px 20px;background:#f6f8fa}
.card{width:100%;max-width:888px;border:1px solid #d0d7de;border-radius:6px;overflow:hidden}
.card__header{padding:12px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #d0d7de}
.card__body{padding:24px 32px}
.card--dark .card__header{background:#161b22;color:#e6edf3;border-color:#30363d}
.card--dark .card__body{background:#0d1117}
.card--dark{border-color:#30363d}
.card--light .card__header{background:#f6f8fa;color:#1f2328}
.card--light .card__body{background:#fff}
.readme img{display:block}
</style>
</head>
<body>
<div class="card card--light">
  <div class="card__header">Light mode</div>
  <div class="card__body readme" id="light"></div>
</div>
<div class="card card--dark">
  <div class="card__header">Dark mode</div>
  <div class="card__body readme" id="dark"></div>
</div>
<script>
function build(base,theme){
  const u=(s)=>base+'/readme?section='+s+'&theme='+theme;
  return '<img src="'+u('main')+'" width="100%" height="230">';
}
var base=window.location.origin;
document.getElementById('light').innerHTML=build(base,'light');
document.getElementById('dark').innerHTML=build(base,'dark');
</script>
</body>
</html>`;

	return new Response(html, {
		headers: { "content-type": "text/html;charset=utf-8" },
	});
}
