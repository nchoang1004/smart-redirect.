export default async (request: Request) => {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();

  // Nhận diện bot của MXH
  const isBot = /facebookexternalhit|facebot|twitterbot|slackbot|telegrambot|zalo|linkedinbot|discordbot/.test(ua);

  const TARGET = "https://s.shopee.vn/AA7qjTz8k6";

  // Người dùng thật -> redirect
  if (!isBot) {
    return Response.redirect(TARGET, 302);
  }

  // Bot -> trả HTML có OG
  const origin = new URL(request.url).origin + "/";
  const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>🔥 Deal Shopee - Sốc tận nóc!</title>
<link rel="canonical" href="${origin}">
<meta property="og:type" content="article">
<meta property="og:title" content="🔥 Deal Shopee - Sốc tận nóc!">
<meta property="og:description" content="Săn hàng hời số lượng có hạn, click ngay để không bỏ lỡ.">
<meta property="og:image" content="${origin}thumb.jpg?v=1">
<meta property="og:url" content="${origin}">
<meta property="og:site_name" content="Hot Deals Việt Nam">
<meta property="og:locale" content="vi_VN">
</head>
<body><p>Bài viết preview cho bot. Người thật sẽ được chuyển sang Shopee.</p></body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
