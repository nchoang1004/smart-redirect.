export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const path = url.pathname; // giữ nguyên, KHÔNG .toLowerCase()

  // BYPASS: để Netlify phục vụ file tĩnh trực tiếp (ảnh, css, js, ...)
  if (
    path === "/thumb.jpg" ||           // nếu bạn dùng JPG
    path === "/thumb.png" ||           // hoặc PNG
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    /^\/assets\/.+\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i.test(path) || // nếu bạn để ảnh trong /assets
    /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp|xml|txt|css|js|map)$/i.test(path)
  ) {
    return await context.next();       // <<< quan trọng: nhường cho static files
  }

  // Bot-aware redirect
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  const isBot = /facebookexternalhit|facebot|twitterbot|slackbot|telegrambot|zalo|linkedinbot|discordbot|whatsapp|pinterest|vkshare|applebot|google.*snippet|bingbot|yandexbot/.test(ua);

  const TARGET = "https://s.shopee.vn/AA7qjTz8k6";
  if (!isBot) return Response.redirect(TARGET, 302);

  const origin = url.origin + "/";
  const html = `<!doctype html>
<html lang="vi"><head>
<meta charset="utf-8">
<title>🔥 Tin nóng hôm nay!</title>
<link rel="canonical" href="${origin}">
<meta property="og:type" content="article">
<meta property="og:title" content="🔥 Tin nóng hôm nay!">
<meta property="og:description" content="Săn hàng hời số lượng có hạn, click ngay để không bỏ lỡ.">
<meta property="og:image" content="${origin}thumb.jpg?v=3">         <!-- nếu dùng PNG: đổi sang thumb.png -->
<meta property="og:image:secure_url" content="${origin}thumb.jpg?v=3">
<meta property="og:image:type" content="image/jpeg">                 <!-- nếu PNG: image/png -->
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${origin}">
<meta property="og:site_name" content="Tin Hot Hôm Nay">
<meta property="og:locale" content="vi_VN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="🔥 Tin nóng hôm nay!">
<meta name="twitter:description" content="Săn hàng hời số lượng có hạn, click ngay để không bỏ lỡ.">
<meta name="twitter:image" content="${origin}thumb.jpg?v=3">
</head><body></body></html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=600" }
  });
}

