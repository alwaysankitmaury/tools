const SITE_NAME = 'ToolsNest';

const NAV_CATEGORIES = [
  { slug: 'pdf-tools', label: 'PDF' },
  { slug: 'image-tools', label: 'Image' },
  { slug: 'text-tools', label: 'Text' },
  { slug: 'utility-tools', label: 'Utility' },
  { slug: 'financial-math-calculators', label: 'Calculators' },
  { slug: 'health-fitness-tools', label: 'Health' },
  { slug: 'unit-converters', label: 'Converters' },
  { slug: 'developer-seo-tools', label: 'Developer & SEO' },
];

const MORE_CATEGORIES = [
  { slug: 'design-tools', label: 'Design' },
  { slug: 'photo-editing-tools', label: 'Photo Editing' },
  { slug: 'video-editing-tools', label: 'Video Editing' },
  { slug: 'audio-editing-tools', label: 'Audio Editing' },
  { slug: 'media-tools', label: 'Media' },
  { slug: 'social-media-tools', label: 'Social Media' },
  { slug: 'everyday-tools', label: 'Everyday' },
  { slug: 'education-math-tools', label: 'Education & Math' },
  { slug: 'file-data-tools', label: 'File & Data' },
  { slug: 'chart-diagram-tools', label: 'Charts & Diagrams' },
  { slug: 'ai-tools', label: 'AI Tools' },
];

const FOOTER_LINKS = [
  { href: '/about/', label: 'About Us' },
  { href: '/contact/', label: 'Contact' },
  { href: '/privacy-policy/', label: 'Privacy Policy' },
  { href: '/terms-of-service/', label: 'Terms of Service' },
  { href: '/disclaimer/', label: 'Disclaimer' },
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function navLink({ slug, label }, activeCategory) {
  const active = slug === activeCategory;
  return `<a href="/category/${slug}/"${active ? ' class="active" aria-current="page"' : ''}>${escapeHtml(label)}</a>`;
}

const STYLES = `
:root {
  --bg: #f6f8fb;
  --surface: #ffffff;
  --text: #1c2430;
  --muted: #5d6b7c;
  --border: #e2e8f0;
  --primary: #4f46e5;
  --primary-dark: #3f38c4;
  --primary-soft: #eef0ff;
  --radius: 12px;
  --shadow: 0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04);
  --max-width: 1100px;
  --font: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Devanagari", Arial, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f141b;
    --surface: #18202b;
    --text: #e8edf4;
    --muted: #9aa8b9;
    --border: #2a3545;
    --primary: #8b86ff;
    --primary-dark: #a7a3ff;
    --primary-soft: #232a45;
    --shadow: none;
  }
}
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font);
  font-size: 16px;
  line-height: 1.65;
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
img, svg, video, canvas { max-width: 100%; height: auto; }
a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }
a:focus-visible, button:focus-visible, summary:focus-visible, input:focus-visible,
select:focus-visible, textarea:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
  border-radius: 6px;
}
.container { width: 100%; max-width: var(--max-width); margin: 0 auto; padding: 0 16px; }
.skip-link {
  position: absolute; left: -9999px; top: 8px;
  background: var(--primary); color: #fff; padding: 8px 14px; border-radius: 8px; z-index: 100;
}
.skip-link:focus { left: 8px; text-decoration: none; }

/* Header */
.site-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 50;
}
.header-inner { display: flex; align-items: center; gap: 16px; padding: 10px 16px; }
.logo {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 1.35rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text);
  white-space: nowrap;
}
.logo:hover { text-decoration: none; }
.logo-mark {
  display: inline-grid; place-items: center; width: 32px; height: 32px;
  border-radius: 9px; background: var(--primary); color: #fff; font-size: 1rem; font-weight: 800;
}
.logo span.accent { color: var(--primary); }
.home-link {
  margin-left: auto; font-size: 0.9rem; font-weight: 600; padding: 7px 12px;
  border: 1px solid var(--border); border-radius: 999px; color: var(--text); white-space: nowrap;
}
.home-link:hover { background: var(--primary-soft); text-decoration: none; }
.main-nav { border-top: 1px solid var(--border); }
.nav-scroll {
  display: flex; align-items: center; gap: 4px; padding: 6px 16px;
  overflow-x: auto; scrollbar-width: thin; -webkit-overflow-scrolling: touch;
}
.nav-scroll a, .nav-scroll summary {
  display: inline-block; padding: 6px 12px; border-radius: 999px;
  font-size: 0.9rem; font-weight: 600; color: var(--muted); white-space: nowrap; cursor: pointer;
  list-style: none;
}
.nav-scroll summary::-webkit-details-marker { display: none; }
.nav-scroll a:hover, .nav-scroll summary:hover { background: var(--primary-soft); color: var(--primary); text-decoration: none; }
.nav-scroll a.active { background: var(--primary); color: #fff; }
.more-menu { position: relative; }
.more-list {
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 60;
  min-width: 210px; max-height: 70vh; overflow-y: auto;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); padding: 6px;
  display: flex; flex-direction: column;
}
.more-list a { display: block; border-radius: 8px; }
@media (max-width: 720px) {
  .more-menu { position: static; }
  .more-list { position: fixed; left: 12px; right: 12px; top: auto; bottom: 12px; max-height: 60vh; }
}

/* Ads */
.ad-wrap { margin: 16px auto; }
.ad-slot {
  display: flex; align-items: center; justify-content: center; flex-direction: column;
  width: 100%; min-height: 110px; overflow: hidden; text-align: center;
  background: transparent; border: 1px dashed var(--border); border-radius: var(--radius);
  color: var(--muted); font-size: 0.75rem;
}
.ad-slot::before { content: "Advertisement"; font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase; opacity: 0.7; }
.ad-slot.has-ad { border: 0; }
.ad-slot.has-ad::before { display: none; }
@media (min-width: 768px) { .ad-slot { min-height: 100px; } }

/* Main */
main { flex: 1; width: 100%; }
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); box-shadow: var(--shadow);
}
.page-title { margin: 20px 0 6px; font-size: clamp(1.5rem, 4.5vw, 2.1rem); line-height: 1.25; letter-spacing: -0.02em; }
.page-intro { margin: 0 0 16px; color: var(--muted); }
#tool-box { padding: 20px; margin-bottom: 8px; overflow-x: auto; }
#content-box { padding: 20px; margin-top: 24px; margin-bottom: 32px; }
#content-box h2 { font-size: 1.4rem; margin: 1.6em 0 0.5em; line-height: 1.3; }
#content-box h2:first-child, #content-box h3:first-child { margin-top: 0; }
#content-box h3 { font-size: 1.15rem; margin: 1.3em 0 0.4em; }
#content-box p, #content-box li { color: var(--text); }
#content-box ul, #content-box ol { padding-left: 1.3em; }
#content-box code, #content-box pre {
  background: var(--primary-soft); border-radius: 6px; font-size: 0.92em;
}
#content-box code { padding: 2px 6px; }
#content-box pre { padding: 12px; overflow-x: auto; }
#content-box table { width: 100%; border-collapse: collapse; display: block; overflow-x: auto; }
#content-box th, #content-box td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; }
#content-box details { border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; margin: 8px 0; }
#content-box summary { cursor: pointer; font-weight: 600; }

/* Tool form basics (available to every tool) */
#tool-box label { display: block; font-weight: 600; margin: 12px 0 6px; }
#tool-box input[type="text"], #tool-box input[type="number"], #tool-box input[type="email"],
#tool-box input[type="url"], #tool-box input[type="password"], #tool-box input[type="date"],
#tool-box input[type="time"], #tool-box select, #tool-box textarea {
  width: 100%; padding: 10px 12px; font: inherit; color: var(--text);
  background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
}
#tool-box textarea { min-height: 160px; resize: vertical; }
#tool-box button, .btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 18px; font: inherit; font-weight: 700; cursor: pointer;
  color: #fff; background: var(--primary); border: 0; border-radius: 10px;
}
#tool-box button:hover, .btn:hover { background: var(--primary-dark); }
#tool-box button[disabled] { opacity: 0.55; cursor: not-allowed; }
#tool-box button.secondary { background: var(--primary-soft); color: var(--primary); }

/* Footer */
.site-footer { background: var(--surface); border-top: 1px solid var(--border); margin-top: auto; }
.footer-inner { padding: 24px 16px; text-align: center; }
.footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 20px; margin: 0 0 12px; padding: 0; list-style: none; }
.footer-links a { color: var(--muted); font-size: 0.92rem; }
.footer-links a:hover { color: var(--primary); }
.footer-note { margin: 0; color: var(--muted); font-size: 0.85rem; }

@media (max-width: 600px) {
  body { font-size: 15.5px; }
  #tool-box, #content-box { padding: 14px; }
  .header-inner { padding: 8px 12px; }
  .container { padding: 0 12px; }
}
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } * { transition: none !important; } }
@media print {
  .site-header, .ad-wrap, .site-footer { display: none !important; }
  body { background: #fff; color: #000; }
}
`;

export function renderLayout({
  title = '',
  metaDescription = '',
  toolHtml = '',
  contentHtml = '',
  category = '',
  toolId = '',
} = {}) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Free Online Tools`;
  const safeTitle = escapeHtml(pageTitle);
  const safeDescription = escapeHtml(
    metaDescription || 'ToolsNest offers free online PDF, image, text, calculator and developer tools that work right in your browser.'
  );
  const safeCategory = escapeHtml(category);
  const safeToolId = escapeHtml(toolId);
  const year = new Date().getFullYear();

  const primaryNav = NAV_CATEGORIES.map((c) => navLink(c, category)).join('');
  const moreNav = MORE_CATEGORIES.map((c) => navLink(c, category)).join('');
  const footerLinks = FOOTER_LINKS.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta name="theme-color" content="#4f46e5">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="/favicon.ico">
  <style>${STYLES}</style>
  <!-- AdSense: paste your site-level script here when approved.
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
  -->
</head>
<body data-category="${safeCategory}" data-tool-id="${safeToolId}">
  <a class="skip-link" href="#tool-box">Skip to tool</a>

  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="/" aria-label="${SITE_NAME} home">
        <span class="logo-mark" aria-hidden="true">T</span>
        <span>Tools<span class="accent">Nest</span></span>
      </a>
      <a class="home-link" href="/">&larr; Home</a>
    </div>
    <nav class="main-nav" aria-label="Tool categories">
      <div class="container nav-scroll">
        ${primaryNav}
        <details class="more-menu">
          <summary>More &#9662;</summary>
          <div class="more-list">${moreNav}</div>
        </details>
      </div>
    </nav>
  </header>

  <div class="container ad-wrap">
    <!-- AD SLOT 1: below header. Paste the AdSense <ins> block inside this div. -->
    <div class="ad-slot" id="ad-slot-top" role="complementary" aria-label="Advertisement"></div>
  </div>

  <main class="container" id="main">
    <h1 class="page-title">${escapeHtml(title)}</h1>
    ${metaDescription ? `<p class="page-intro">${escapeHtml(metaDescription)}</p>` : ''}

    <section id="tool-box" class="card" aria-label="Tool" data-tool-id="${safeToolId}">
      ${toolHtml}
    </section>

    <div class="ad-wrap">
      <!-- AD SLOT 2: after the tool. Paste the AdSense <ins> block inside this div. -->
      <div class="ad-slot" id="ad-slot-after-tool" role="complementary" aria-label="Advertisement"></div>
    </div>

    <article id="content-box" class="card">
      ${contentHtml}
    </article>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <ul class="footer-links">${footerLinks}</ul>
      <p class="footer-note">&copy; ${year} ${SITE_NAME}. All rights reserved. Free online tools for everyone.</p>
    </div>
  </footer>
</body>
</html>`;
}
