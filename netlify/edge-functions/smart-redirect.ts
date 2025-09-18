export default async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();

  // 1) Bypass các file tĩnh (cho Netlify phục vụ trực tiếp)
  //    -> để og:image thật sự trả về ảnh (200 OK, content-type image/*)
  if (
    path === "/thumb.jpg" ||
    path === "/thumb.png" ||
    /\.(png|jpe?g|gif|webp|svg|ico|txt|xml|css|js|map)$/i.test(path)
  ) {
    return fetch(request);
  }

  // 2) Phần còn lại: logic bot-aware như cũ
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  const isBot = /facebookexternalhit|facebot|twitterbot|slackbot|telegrambot|zalo|linkedinbot|discordbot|whatsapp|pinterest|vkshare|applebot|google.*snippet|bingbot|yandexbot/.test(ua);

  const TARGET = "https://s.shopee.vn/AA7qjTz8k6";

  if (!isBot) {
    return Response.redirect(TARGET, 302);
  }

  const origin = url.origin + "/";
  const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>🔥 Tin nóng hôm nay!</title>
<link rel="canonical" href="${origin}">
<meta property="og:type" content="article">
<meta property="og:title" content="🔥 Tin nóng hôm nay!">
<meta property="og:description" content="Săn hàng hời số lượng có hạn, click ngay để không bỏ lỡ.">
<meta property="og:image" content="${origin}thumb.jpg?v=2">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${origin}">
<meta property="og:site_name" content="Hot Deals Việt Nam">
<meta property="og:locale" content="vi_VN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="🔥 Tin nóng hôm nay!">
<meta name="twitter:description" content="Săn hàng hời số lượng có hạn, click ngay để không bỏ lỡ.">
<meta name="twitter:image" content="${origin}thumb.jpg?v=2">
</head>
<body></body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=600" }
  });
}

