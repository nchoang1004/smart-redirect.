// Netlify Edge Function: xoay link 30 phút/lần theo thứ tự, KHÔNG lặp lại.
// Sửa START_AT thành thời điểm bạn muốn bắt đầu dùng link số 1.

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const origin = url.origin.endsWith("/") ? url.origin : url.origin + "/";

  // ================= CẤU HÌNH =================
  const SLOT_MS  = 30 * 60 * 1000;                 // 30 phút / 1 link
  const START_AT = new Date("2025-09-21T00:00:00Z").getTime();
  // ↑ ĐỔI thành thời điểm bạn "go live" (UTC). Ví dụ muốn bắt đầu ngay bây giờ:
  //   lấy giờ UTC hiện tại và dán vào đây.
  const LIST_URL = origin + "targets.json";        // danh sách 200 link (file tĩnh)
  const LOOP = false;                              // false = hết là dừng; true = quay vòng
  // ============================================

  // BYPASS: để Netlify trả file tĩnh trực tiếp (ảnh/JSON/asset...)
  if (
    path === "/thumb.jpg" ||
    path === "/thumb.png" ||
    path === "/targets.json" ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    /^\/assets\/.+\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i.test(path) ||
    /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp|xml|txt|css|js|map)$/i.test(path)
  ) {
    return await context.next();
  }

  // Đọc danh sách link từ targets.json
  let links: string[] = [];
  try {
    const r = await fetch(LIST_URL, { headers: { "cache-control": "no-cache" } });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data?.links)) links = data.links.filter(Boolean);
    }
  } catch {}
  if (!links.length) {
    return new Response("<!doctype html><body>Chưa cấu hình targets.json</body></html>", {
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }

  // Tính index theo "khung 30 phút" kể từ START_AT
  const now = Date.now();
  let idx = Math.floor((now - START_AT) / SLOT_MS);
  if (idx < 0) idx = 0; // trước giờ START_AT thì dùng phần tử đầu

  // Endpoint kiểm tra nhanh (tùy chọn): /_status
  if (path === "/_status") {
    const cur = idx >= links.length ? null : links[Math.min(idx, links.length - 1)];
    return new Response(JSON.stringify({
      now, START_AT, SLOT_MS, idx, total: links.length, target: cur
    }, null, 2), { headers: { "content-type": "application/json" } });
  }

  // Hết link -> dừng (không dùng lại link cũ)
  if (!LOOP && idx >= links.length) {
    const htmlDone = `<!doctype html><meta charset="utf-8">
    <body style="font-family:system-ui;padding:24px">
      <h1>Đã hết link trong danh sách</h1>
      <p>Đã sử dụng ${links.length} link, mỗi 30 phút một link, và không lặp lại.</p>
    </body>`;
    return new Response(htmlDone, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // Nếu cho phép quay vòng
  if (LOOP && links.length) {
    idx = idx % links.length;
  }

  const target = links[Math.min(idx, links.length - 1)];

  // Phân biệt bot MXH vs người dùng thật
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  const isBot = /facebookexternalhit|facebot|twitterbot|slackbot|telegrambot|zalo|linkedinbot|discordbot|whatsapp|pinterest|vkshare|applebot|google.*snippet|bingbot|yandexbot/.test(ua);

  // Người dùng thật -> 302 về link hiện tại
  if (!isBot) return Response.redirect(target, 302);

  // Bot -> trả HTML có OG (hiện như bài viết)
  const title = "🔥 Tin nóng hôm nay!";
  const desc  = "Ưu đãi cập nhật theo khung 30 phút – nhấn để xem chi tiết.";
  const img   = (await fetch(origin + "thumb.jpg", { method: "HEAD" })).ok ? "thumb.jpg" : "thumb.png";
  const imgURL = origin + img + "?v=5";
  const imgType = img.endsWith(".png") ? "image/png" : "image/jpeg";
  const pageURL = url.href;

  const html = `<!doctype html>
<html lang="vi"><head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="canonical" href="${pageURL}">
<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${imgURL}">
<meta property="og:image:secure_url" content="${imgURL}">
<meta property="og:image:type" content="${imgType}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${pageURL}">
<meta property="og:site_name" content="Tin Hot Hôm Nay">
<meta property="og:locale" content="vi_VN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${imgURL}">
</head><body></body></html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=600" }
  });
};


