import toolsList from './tools-list.json';
import { renderLayout } from './components/layout.js';
import { renderHomePage } from './pages/home.js';

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const SITE_NAME = 'ToolsNest';
const LAST_UPDATED = 'November 8, 2026';
const DEFAULT_CONTACT_EMAIL = 'contact@toolsnest.com'; // override with env.CONTACT_EMAIL

const TOOLS = (Array.isArray(toolsList) ? toolsList : []).filter(
  (t) => t && typeof t.id === 'string' && t.id && typeof t.name === 'string'
);
const TOOL_MAP = new Map(TOOLS.map((t) => [t.id, t]));

const CATEGORY_MAP = new Map();
for (const tool of TOOLS) {
  const slug = tool.category || 'other';
  if (!CATEGORY_MAP.has(slug)) CATEGORY_MAP.set(slug, []);
  CATEGORY_MAP.get(slug).push(tool);
}

const CATEGORY_LABELS = {
  'pdf-tools': 'PDF Tools',
  'image-tools': 'Image Tools',
  'text-tools': 'Text Tools',
  'utility-tools': 'Utility Tools',
  'financial-math-calculators': 'Calculators',
  'health-fitness-tools': 'Health & Fitness',
  'unit-converters': 'Converters',
  'developer-seo-tools': 'Developer & SEO',
  'design-tools': 'Design',
  'photo-editing-tools': 'Photo Editing',
  'video-editing-tools': 'Video Editing',
  'audio-editing-tools': 'Audio Editing',
  'media-tools': 'Media',
  'social-media-tools': 'Social Media',
  'everyday-tools': 'Everyday',
  'education-math-tools': 'Education & Math',
  'file-data-tools': 'File & Data',
  'chart-diagram-tools': 'Charts & Diagrams',
  'ai-tools': 'AI Tools',
};

/**
 * Plug-in point for finished tools.
 * When a tool is ready, add an entry keyed by its id:
 *
 *   TOOL_PAGES['word-counter'] = {
 *     toolHtml: (tool) => `<div id="tool-app">...</div><script>...</script>`,
 *     contentHtml: (tool) => `<h2>How it works</h2>...`,
 *     metaDescription: 'Count words and characters instantly.', // optional
 *   };
 *
 * Tools without an entry get a placeholder page (marked noindex).
 */
const TOOL_PAGES = Object.create(null);

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

const CACHE_PAGE = 'public, max-age=300, s-maxage=3600';
const CACHE_SHORT = 'public, max-age=60, s-maxage=300';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function categoryLabel(slug) {
  if (CATEGORY_LABELS[slug]) return CATEGORY_LABELS[slug];
  return String(slug || 'Other')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function htmlResponse(html, { status = 200, cache = CACHE_PAGE, noindex = false } = {}) {
  const headers = new Headers(SECURITY_HEADERS);
  headers.set('Content-Type', 'text/html; charset=UTF-8');
  headers.set('Cache-Control', cache);
  if (noindex) headers.set('X-Robots-Tag', 'noindex, follow');
  return new Response(html, { status, headers });
}

function textResponse(body, contentType, cache = CACHE_PAGE) {
  const headers = new Headers(SECURITY_HEADERS);
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', cache);
  return new Response(body, { status: 200, headers });
}

function redirect(location, status = 301) {
  const headers = new Headers(SECURITY_HEADERS);
  headers.set('Location', location);
  headers.set('Cache-Control', 'public, max-age=3600');
  return new Response(null, { status, headers });
}

/** Removes an empty layout container (e.g. an unused #tool-box) from rendered HTML. */
function dropEmptyBox(html, id) {
  const pattern = new RegExp(`<(section|article) id="${id}"[^>]*>\\s*</\\1>`);
  return html.replace(pattern, '');
}

function safeDecode(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Pages                                                                     */
/* -------------------------------------------------------------------------- */

function notFoundPage() {
  const toolHtml = `
<div style="text-align:center;padding:24px 8px">
  <p style="font-size:3rem;margin:0;font-weight:800">404</p>
  <h2 style="margin:8px 0">Page not found</h2>
  <p>The page you are looking for does not exist or may have been moved.</p>
  <p><a class="btn" href="/" style="color:#fff">Browse all tools</a></p>
</div>`;
  const html = dropEmptyBox(
    renderLayout({
      title: 'Page Not Found',
      metaDescription: 'The page you requested could not be found.',
      toolHtml,
      contentHtml: '',
      category: '',
      toolId: '',
    }),
    'content-box'
  );
  return htmlResponse(html, { status: 404, cache: CACHE_SHORT, noindex: true });
}

function methodNotAllowed() {
  const headers = new Headers(SECURITY_HEADERS);
  headers.set('Allow', 'GET, HEAD, OPTIONS');
  headers.set('Content-Type', 'text/plain; charset=UTF-8');
  return new Response('Method Not Allowed', { status: 405, headers });
}

/** Self-contained fallback used when rendering itself fails. Never throws. */
function serverErrorPage() {
  const html =
    '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Temporarily unavailable | ToolsNest</title></head>' +
    '<body style="font-family:system-ui,sans-serif;text-align:center;padding:12vh 16px">' +
    '<h1>We&rsquo;ll be right back</h1>' +
    '<p>ToolsNest is temporarily unavailable. Please try again in a moment.</p>' +
    '<p><a href="/">Reload the homepage</a></p></body></html>';
  return new Response(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-store',
      'Retry-After': '30',
      'X-Robots-Tag': 'noindex',
    },
  });
}

function relatedToolsHtml(tool) {
  const related = (CATEGORY_MAP.get(tool.category || 'other') || [])
    .filter((t) => t.id !== tool.id)
    .slice(0, 6);
  if (!related.length) return '';
  const items = related
    .map(
      (t) =>
        `<li><a href="/tools/${escapeHtml(encodeURIComponent(t.id))}">${escapeHtml(t.name)}</a> &ndash; ${escapeHtml(t.description || '')}</li>`
    )
    .join('');
  return `<h3>Related tools</h3><ul>${items}</ul>`;
}

function placeholderTool(tool) {
  return `
<div id="tool-app" data-tool-id="${escapeHtml(tool.id)}" data-category="${escapeHtml(tool.category || '')}">
  <div style="text-align:center;padding:24px 8px">
    <h2 style="margin:0 0 8px">${escapeHtml(tool.name)}</h2>
    <p>${escapeHtml(tool.description || '')}</p>
    <p><strong>This tool is being prepared and will be available here soon.</strong></p>
    <p><a class="btn" href="/" style="color:#fff">Browse other tools</a></p>
  </div>
</div>
<noscript><p>JavaScript is required to use this tool.</p></noscript>`;
}

function placeholderContent(tool) {
  return `
<h2>About ${escapeHtml(tool.name)}</h2>
<p>${escapeHtml(tool.description || '')} This tool is part of the ${escapeHtml(categoryLabel(tool.category))} collection on ${SITE_NAME}.</p>
<p>A complete step-by-step guide, formulas and frequently asked questions for this tool are on the way. Most ${SITE_NAME} tools run directly in your browser, so your files and text stay on your device.</p>
${relatedToolsHtml(tool)}`;
}

function toolPage(tool) {
  const custom = TOOL_PAGES[tool.id];
  let toolHtml;
  let contentHtml;
  let metaDescription;
  let ready = false;

  if (custom && typeof custom.toolHtml === 'function') {
    toolHtml = custom.toolHtml(tool);
    contentHtml =
      typeof custom.contentHtml === 'function' ? custom.contentHtml(tool) : placeholderContent(tool);
    metaDescription = custom.metaDescription;
    ready = true;
  } else {
    toolHtml = placeholderTool(tool);
    contentHtml = placeholderContent(tool);
  }

  const html = renderLayout({
    title: tool.name,
    metaDescription: metaDescription || `${tool.description || tool.name} Free online tool on ${SITE_NAME}.`,
    toolHtml,
    contentHtml,
    category: tool.category || '',
    toolId: tool.id,
  });
  return htmlResponse(html, { noindex: !ready });
}

function categoryPage(slug) {
  const tools = CATEGORY_MAP.get(slug);
  if (!tools) return notFoundPage();
  const label = categoryLabel(slug);
  const cards = tools
    .map(
      (t) => `<li><a href="/tools/${escapeHtml(encodeURIComponent(t.id))}"><strong>${escapeHtml(t.name)}</strong><span>${escapeHtml(t.description || '')}</span></a></li>`
    )
    .join('');
  const toolHtml = `
<style>
.cat-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.cat-list a{display:flex;flex-direction:column;gap:4px;height:100%;padding:14px;border:1px solid var(--border);border-radius:var(--radius);color:var(--text)}
.cat-list a:hover{border-color:var(--primary);text-decoration:none}
.cat-list span{font-size:.88rem;color:var(--muted)}
@media(max-width:480px){.cat-list{grid-template-columns:1fr}}
</style>
<ul class="cat-list">${cards}</ul>`;
  const contentHtml = `
<h2>${escapeHtml(label)} on ${SITE_NAME}</h2>
<p>Browse ${tools.length} free ${escapeHtml(label.toLowerCase())} on ${SITE_NAME}. Every tool is free to use, needs no sign-up and is built to work smoothly on phones, tablets and desktops. Pick a tool from the list above to get started, or go back to the <a href="/">homepage</a> to search all tools.</p>`;
  return htmlResponse(
    renderLayout({
      title: label,
      metaDescription: `Free online ${label.toLowerCase()}: ${tools.length} tools that work right in your browser.`,
      toolHtml,
      contentHtml,
      category: slug,
      toolId: '',
    })
  );
}

/* ---- Policy pages -------------------------------------------------------- */

function policyContent(key, email) {
  const mail = escapeHtml(email);
  switch (key) {
    case 'about':
      return {
        title: 'About Us',
        description: `Learn about ${SITE_NAME}, a free collection of online tools that run in your browser.`,
        html: `
<h2>About ${SITE_NAME}</h2>
<p>${SITE_NAME} is a free collection of online tools for everyday work: PDF and image tools, text utilities, calculators, converters and developer helpers. Our goal is simple: make common digital tasks quick, free and private, without sign-ups or software installs.</p>
<h3>Our approach</h3>
<ul>
  <li><strong>Free to use.</strong> Every tool is free. The site is supported by advertising.</li>
  <li><strong>Privacy first.</strong> Most tools process your files and text inside your own browser, so your content is not uploaded to our servers.</li>
  <li><strong>Fast and simple.</strong> Clean pages that load quickly and work on any device.</li>
  <li><strong>Always improving.</strong> We add new tools and fix problems based on user feedback.</li>
</ul>
<p>Have a suggestion or found a bug? Please visit our <a href="/contact">Contact</a> page.</p>`,
      };
    case 'contact':
      return {
        title: 'Contact Us',
        description: `Get in touch with the ${SITE_NAME} team for feedback, tool requests or support.`,
        html: `
<h2>Contact ${SITE_NAME}</h2>
<p>We would love to hear from you. Use the email address below for questions, bug reports, tool suggestions, advertising or privacy requests.</p>
<p><strong>Email:</strong> <a href="mailto:${mail}">${mail}</a></p>
<p>We read every message and usually reply within a few business days. When reporting a problem, please include the name of the tool, your browser and device, and a short description of what happened.</p>`,
      };
    case 'privacy-policy':
      return {
        title: 'Privacy Policy',
        description: `How ${SITE_NAME} collects, uses and protects information, including cookies and advertising.`,
        html: `
<p><em>Last updated: ${LAST_UPDATED}</em></p>
<h2>Introduction</h2>
<p>This Privacy Policy explains how ${SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles information when you use our website and online tools. By using the site you agree to this policy.</p>
<h2>Files and text you use in our tools</h2>
<p>Most ${SITE_NAME} tools run entirely in your browser. Files, images and text that you load into these tools are processed on your device and are not uploaded to or stored on our servers. Some tools, such as IP, DNS or domain lookups, need to contact an external service to work; those tools say so on their page.</p>
<h2>Information we collect</h2>
<ul>
  <li><strong>Log and usage data.</strong> Like most websites, our hosting provider may automatically record technical data such as IP address, browser type, device type, pages visited and timestamps. We use it to keep the site secure and to understand how it is used.</li>
  <li><strong>Information you send us.</strong> If you email us, we receive your email address and the content of your message.</li>
  <li>We do not require you to create an account and we do not knowingly collect personal information through the tools.</li>
</ul>
<h2>Cookies</h2>
<p>Cookies are small files stored on your device. We and our advertising partners may use cookies and similar technologies to remember preferences, measure traffic and show ads. You can control or delete cookies in your browser settings.</p>
<h2>Advertising and Google AdSense</h2>
<p>We use third-party advertising companies, including Google, to show ads on this site. Google, as a third-party vendor, uses cookies to serve ads based on your visits to this and other websites. Google&rsquo;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.</p>
<p>You may opt out of personalised advertising by visiting <a href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">Google Ads Settings</a>. You can also opt out of some third-party vendors&rsquo; use of cookies for personalised advertising at <a href="https://www.aboutads.info" rel="noopener noreferrer" target="_blank">www.aboutads.info</a>. For more details, see <a href="https://policies.google.com/technologies/ads" rel="noopener noreferrer" target="_blank">how Google uses data from sites that use its services</a>.</p>
<h2>Third-party links</h2>
<p>Our site may link to other websites. We are not responsible for the privacy practices or content of those sites, so please review their policies.</p>
<h2>Children&rsquo;s privacy</h2>
<p>${SITE_NAME} is not directed at children under 13, and we do not knowingly collect personal information from them. If you believe a child has provided us with personal information, please contact us and we will remove it.</p>
<h2>Your rights</h2>
<p>Depending on where you live, you may have rights to access, correct or delete personal data we hold about you. To make a request, email us at <a href="mailto:${mail}">${mail}</a>.</p>
<h2>Changes to this policy</h2>
<p>We may update this policy from time to time. The &ldquo;Last updated&rdquo; date above shows when it was last changed.</p>
<h2>Contact</h2>
<p>Questions about this policy? Email <a href="mailto:${mail}">${mail}</a> or visit our <a href="/contact">Contact</a> page.</p>`,
      };
    case 'terms':
      return {
        title: 'Terms of Service',
        description: `The terms and conditions for using ${SITE_NAME} and its online tools.`,
        html: `
<p><em>Last updated: ${LAST_UPDATED}</em></p>
<h2>Acceptance of terms</h2>
<p>By accessing or using ${SITE_NAME}, you agree to these Terms of Service. If you do not agree, please do not use the site.</p>
<h2>Use of the tools</h2>
<p>You may use our tools for lawful personal and commercial purposes. You agree not to misuse the site, including attempting to disrupt or overload it, scrape it at an abusive rate, or use it to process content that is illegal or that you have no right to use.</p>
<h2>Your content</h2>
<p>You are responsible for the files and text you process with our tools and for having the right to use them. Most tools run in your browser and we do not receive your content.</p>
<h2>Intellectual property</h2>
<p>The site design, text, code and branding are owned by ${SITE_NAME} or its licensors and are protected by applicable laws. You may not copy or redistribute them without permission.</p>
<h2>No warranty</h2>
<p>The tools and information are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind. We do not guarantee that the site will be uninterrupted, error-free or that results will be accurate for your purpose. See our <a href="/disclaimer">Disclaimer</a>.</p>
<h2>Limitation of liability</h2>
<p>To the fullest extent permitted by law, ${SITE_NAME} is not liable for any indirect, incidental or consequential damages, or for loss of data or profits, arising from your use of the site or tools.</p>
<h2>Third-party content and ads</h2>
<p>The site displays advertising and may link to third-party websites that we do not control. We are not responsible for their content or practices.</p>
<h2>Changes</h2>
<p>We may update these terms at any time. Continued use of the site after changes means you accept the updated terms.</p>
<h2>Contact</h2>
<p>Questions about these terms? Email <a href="mailto:${mail}">${mail}</a>.</p>`,
      };
    case 'disclaimer':
      return {
        title: 'Disclaimer',
        description: `Important information about the accuracy and intended use of ${SITE_NAME} tools and calculators.`,
        html: `
<p><em>Last updated: ${LAST_UPDATED}</em></p>
<h2>General information only</h2>
<p>The tools, calculators, converters and articles on ${SITE_NAME} are provided for general informational purposes. We work to keep them accurate, but we make no guarantee that results are complete, current or error-free.</p>
<h2>Not professional advice</h2>
<p>Financial, tax, health, fitness and pregnancy calculators give estimates only. They are not financial, tax, legal or medical advice. Please consult a qualified professional before making decisions based on these results.</p>
<h2>Verify important results</h2>
<p>For anything important, such as official documents, legal filings, loans or medical decisions, double-check results with authoritative sources.</p>
<h2>External links and advertising</h2>
<p>We are not responsible for the content of external websites or for advertisements displayed on this site, and a link or ad does not mean we endorse it.</p>
<h2>Use at your own risk</h2>
<p>You use ${SITE_NAME} at your own risk. We are not liable for any loss or damage resulting from the use of, or inability to use, the site or its tools. Questions? Visit our <a href="/contact">Contact</a> page.</p>`,
      };
    default:
      return null;
  }
}

const POLICY_KEYS = new Set(['about', 'contact', 'privacy-policy', 'terms', 'disclaimer']);
const STATIC_CACHE = new Map();

function policyPage(key, env) {
  const email = (env && typeof env.CONTACT_EMAIL === 'string' && env.CONTACT_EMAIL) || DEFAULT_CONTACT_EMAIL;
  const cacheKey = `${key}|${email}`;
  let html = STATIC_CACHE.get(cacheKey);
  if (!html) {
    const page = policyContent(key, email);
    if (!page) return notFoundPage();
    html = dropEmptyBox(
      renderLayout({
        title: page.title,
        metaDescription: page.description,
        toolHtml: '',
        contentHtml: page.html,
        category: '',
        toolId: '',
      }),
      'tool-box'
    );
    STATIC_CACHE.set(cacheKey, html);
  }
  return htmlResponse(html);
}

function homePage() {
  let html = STATIC_CACHE.get('home');
  if (!html) {
    html = renderHomePage(TOOLS);
    STATIC_CACHE.set('home', html);
  }
  return htmlResponse(html);
}

/* ---- robots / sitemap ---------------------------------------------------- */

function robotsTxt(origin) {
  return textResponse(
    `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
    'text/plain; charset=UTF-8'
  );
}

function sitemapXml(origin) {
  const paths = ['/', '/about', '/contact', '/privacy-policy', '/terms', '/disclaimer'];
  for (const slug of CATEGORY_MAP.keys()) paths.push(`/category/${slug}`);
  // Only finished tools are listed; placeholders are noindex.
  for (const id of Object.keys(TOOL_PAGES)) if (TOOL_MAP.has(id)) paths.push(`/tools/${id}`);
  const urls = paths
    .map((p) => `  <url><loc>${escapeHtml(origin + (p === '/' ? '/' : p))}</loc></url>`)
    .join('\n');
  return textResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    'application/xml; charset=UTF-8'
  );
}

/* -------------------------------------------------------------------------- */
/*  Router                                                                    */
/* -------------------------------------------------------------------------- */

const ALIASES = {
  '/terms-of-service': '/terms',
  '/privacy': '/privacy-policy',
  '/about-us': '/about',
  '/contact-us': '/contact',
};

async function route(url, env) {
  let path = url.pathname.replace(/\/{2,}/g, '/');
  if (path.length > 1) path = path.replace(/\/+$/, '') || '/';
  if (ALIASES[path]) path = ALIASES[path];

  // One-hop redirect to the clean canonical path (no trailing slash, aliases resolved).
  if (path !== url.pathname) return redirect(`${url.origin}${path}${url.search}`);

  if (path === '/') return homePage();
  if (path === '/favicon.ico') {
    const headers = new Headers(SECURITY_HEADERS);
    headers.set('Cache-Control', 'public, max-age=86400');
    return new Response(null, { status: 204, headers });
  }
  if (path === '/robots.txt') return robotsTxt(url.origin);
  if (path === '/sitemap.xml') return sitemapXml(url.origin);

  const key = path.slice(1);
  if (POLICY_KEYS.has(key)) return policyPage(key, env);

  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'tools' && segments.length === 2) {
    const decoded = safeDecode(segments[1]);
    if (decoded === null || !/^[A-Za-z0-9-]{1,80}$/.test(decoded)) return notFoundPage();
    const id = decoded.toLowerCase();
    if (id !== segments[1]) return redirect(`${url.origin}/tools/${id}${url.search}`);
    const tool = TOOL_MAP.get(id);
    return tool ? toolPage(tool) : notFoundPage();
  }

  if (segments[0] === 'category' && segments.length === 2) {
    const slug = safeDecode(segments[1]);
    if (slug === null || !/^[a-z0-9-]{1,80}$/.test(slug)) return notFoundPage();
    return categoryPage(slug);
  }

  return notFoundPage();
}

export default {
  async fetch(request, env, ctx) {
    try {
      const method = request.method.toUpperCase();

      if (method === 'OPTIONS') {
        const headers = new Headers(SECURITY_HEADERS);
        headers.set('Allow', 'GET, HEAD, OPTIONS');
        return new Response(null, { status: 204, headers });
      }
      if (method !== 'GET' && method !== 'HEAD') return methodNotAllowed();

      const url = new URL(request.url);
      const response = await route(url, env);

      return method === 'HEAD'
        ? new Response(null, { status: response.status, headers: response.headers })
        : response;
    } catch (error) {
      console.error('Unhandled error:', error && error.stack ? error.stack : error);
      return serverErrorPage();
    }
  },
};
