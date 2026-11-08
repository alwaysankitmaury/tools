import { renderLayout } from '../components/layout.js';

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

const POPULAR_TOOL_IDS = [
  'pdf-merge',
  'compress-pdf',
  'image-compressor',
  'word-counter',
  'qr-code-generator',
  'emi-calculator',
  'password-generator',
  'json-formatter-validator',
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function categoryLabel(slug) {
  if (CATEGORY_LABELS[slug]) return CATEGORY_LABELS[slug];
  return String(slug || 'Other')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const HOME_STYLES = `
.page-title { text-align: center; margin-top: 28px; font-size: clamp(1.8rem, 6vw, 2.8rem); }
.page-intro { text-align: center; max-width: 720px; margin: 0 auto 20px; font-size: 1.05rem; }
#tool-box.home-box { background: transparent; border: 0; box-shadow: none; padding: 0; overflow: visible; }
[hidden] { display: none !important; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

.hero {
  background: linear-gradient(135deg, var(--primary-soft), var(--surface));
  border: 1px solid var(--border); border-radius: 18px;
  padding: 28px 20px; text-align: center;
}
.search-wrap { position: relative; max-width: 720px; margin: 0 auto; }
#tool-box .search-input {
  width: 100%; padding: 16px 48px 16px 18px; font: inherit; font-size: 1.15rem;
  color: var(--text); background: var(--surface);
  border: 2px solid var(--border); border-radius: 14px;
  -webkit-appearance: none; appearance: none;
}
#tool-box .search-input:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 4px var(--primary-soft); }
#tool-box .search-clear {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  width: 34px; height: 34px; padding: 0; border-radius: 50%;
  font-size: 1.3rem; line-height: 1; color: var(--muted); background: transparent;
}
#tool-box .search-clear:hover { background: var(--primary-soft); color: var(--primary); }
.hero-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 18px; margin: 14px 0 0; padding: 0; list-style: none; color: var(--muted); font-size: 0.9rem; font-weight: 600; }
.popular { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; margin-top: 14px; font-size: 0.88rem; color: var(--muted); }
.popular a { padding: 4px 12px; border: 1px solid var(--border); border-radius: 999px; background: var(--surface); color: var(--text); }
.popular a:hover { background: var(--primary-soft); color: var(--primary); text-decoration: none; }

.filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin: 22px 0 10px; }
#tool-box .cat-pill {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;
  font: inherit; font-size: 0.9rem; font-weight: 600; white-space: nowrap;
  color: var(--text); background: var(--surface);
  border: 1px solid var(--border); border-radius: 999px; cursor: pointer;
}
#tool-box .cat-pill:hover { background: var(--primary-soft); color: var(--primary); }
#tool-box .cat-pill[aria-pressed="true"] { background: var(--primary); border-color: var(--primary); color: #fff; }
#tool-box .cat-pill[aria-pressed="true"]:hover { background: var(--primary-dark); color: #fff; }
.cat-pill .count { font-size: 0.75rem; opacity: 0.75; }
@media (max-width: 600px) {
  .filter-bar { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 6px; -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
  .hero { padding: 20px 14px; }
  #tool-box .search-input { font-size: 1rem; padding: 14px 44px 14px 14px; }
}

.result-count { margin: 4px 2px 12px; color: var(--muted); font-size: 0.9rem; }
.tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
.tool-card {
  display: flex; align-items: flex-start; gap: 12px; padding: 14px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text); box-shadow: var(--shadow);
  content-visibility: auto; contain-intrinsic-size: auto 110px;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.tool-card:hover { transform: translateY(-2px); border-color: var(--primary); text-decoration: none; }
.tool-badge {
  flex: 0 0 auto; width: 40px; height: 40px; border-radius: 10px;
  display: grid; place-items: center; font-weight: 800; font-size: 1.05rem; color: #fff;
  background: hsl(var(--hue, 245) 62% 46%);
}
.tool-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.tool-name { font-weight: 700; line-height: 1.3; }
.tool-desc { font-size: 0.88rem; color: var(--muted); line-height: 1.45; }
.tool-cat { margin-top: 4px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--primary); }
.no-results { text-align: center; padding: 36px 16px; color: var(--muted); }
@media (max-width: 480px) { .tools-grid { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .tool-card { transition: none; } .tool-card:hover { transform: none; } }
`;

const HOME_SCRIPT = `
(function () {
  var input = document.getElementById('toolSearch');
  var grid = document.getElementById('toolsGrid');
  if (!input || !grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.tool-card'));
  var pills = Array.prototype.slice.call(document.querySelectorAll('.cat-pill'));
  var clearBtn = document.getElementById('clearSearch');
  var status = document.getElementById('resultCount');
  var empty = document.getElementById('noResults');
  var total = cards.length;
  var activeCat = 'all';

  function norm(s) {
    return String(s || '').toLowerCase().replace(/[-_\\/]+/g, ' ').replace(/\\s+/g, ' ').trim();
  }

  function apply() {
    var terms = norm(input.value).split(' ').filter(Boolean);
    var shown = 0;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var okCat = activeCat === 'all' || card.getAttribute('data-category') === activeCat;
      var hay = card.getAttribute('data-search') || '';
      var okText = true;
      for (var t = 0; t < terms.length; t++) {
        if (hay.indexOf(terms[t]) === -1) { okText = false; break; }
      }
      var show = okCat && okText;
      card.hidden = !show;
      if (show) shown++;
    }
    status.textContent = (shown === total ? 'Showing all ' : 'Showing ') + shown + (shown === 1 ? ' tool' : ' tools') + (shown === total ? '' : ' of ' + total);
    empty.hidden = shown !== 0;
    clearBtn.hidden = input.value.length === 0;
  }

  function setCategory(cat) {
    activeCat = cat;
    pills.forEach(function (p) {
      p.setAttribute('aria-pressed', p.getAttribute('data-cat') === cat ? 'true' : 'false');
    });
    apply();
  }

  input.addEventListener('input', apply);
  clearBtn.addEventListener('click', function () { input.value = ''; apply(); input.focus(); });
  pills.forEach(function (p) {
    p.addEventListener('click', function () { setCategory(p.getAttribute('data-cat')); });
  });

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT' && !e.target.isContentEditable) {
      e.preventDefault();
      input.focus();
    }
    if (e.key === 'Escape' && document.activeElement === input && input.value) {
      input.value = '';
      apply();
    }
  });

  try {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) input.value = q;
    var hash = (window.location.hash || '').replace('#', '');
    if (hash && pills.some(function (p) { return p.getAttribute('data-cat') === hash; })) activeCat = hash;
  } catch (err) { /* ignore */ }

  setCategory(activeCat);
})();
`;

export function renderHomePage(toolsList) {
  const tools = (Array.isArray(toolsList) ? toolsList : []).filter((t) => t && t.id && t.name);
  const total = tools.length;

  // Unique categories in order of first appearance, with counts.
  const counts = new Map();
  for (const t of tools) {
    const c = t.category || 'other';
    counts.set(c, (counts.get(c) || 0) + 1);
  }
  const categories = [...counts.keys()];
  const hueStep = categories.length ? Math.floor(360 / categories.length) : 0;
  const hueOf = (c) => (categories.indexOf(c) * hueStep + 245) % 360;

  const pills = [
    `<button type="button" class="cat-pill" data-cat="all" aria-pressed="true">All <span class="count">${total}</span></button>`,
    ...categories.map(
      (c) =>
        `<button type="button" class="cat-pill" data-cat="${escapeHtml(c)}" aria-pressed="false">${escapeHtml(categoryLabel(c))} <span class="count">${counts.get(c)}</span></button>`
    ),
  ].join('');

  const cards = tools
    .map((t) => {
      const cat = t.category || 'other';
      const label = categoryLabel(cat);
      const haystack = normalize(`${t.name} ${t.description || ''} ${label} ${t.id}`);
      const initial = escapeHtml(String(t.name).trim().charAt(0).toUpperCase() || '#');
      return `<a class="tool-card" href="/tools/${escapeHtml(encodeURIComponent(t.id))}" data-category="${escapeHtml(cat)}" data-search="${escapeHtml(haystack)}" style="--hue:${hueOf(cat)}">
        <span class="tool-badge" aria-hidden="true">${initial}</span>
        <span class="tool-body">
          <span class="tool-name">${escapeHtml(t.name)}</span>
          <span class="tool-desc">${escapeHtml(t.description || '')}</span>
          <span class="tool-cat">${escapeHtml(label)}</span>
        </span>
      </a>`;
    })
    .join('\n');

  const idSet = new Set(tools.map((t) => t.id));
  const nameById = new Map(tools.map((t) => [t.id, t.name]));
  const popularLinks = POPULAR_TOOL_IDS.filter((id) => idSet.has(id))
    .map((id) => `<a href="/tools/${escapeHtml(encodeURIComponent(id))}">${escapeHtml(nameById.get(id))}</a>`)
    .join('');

  const toolHtml = `
<style>${HOME_STYLES}</style>
<section class="hero" aria-label="Search tools">
  <div class="search-wrap">
    <label class="sr-only" for="toolSearch">Search tools</label>
    <input type="search" id="toolSearch" class="search-input" placeholder="Search ${total}+ tools, e.g. PDF merge, EMI, QR code..." autocomplete="off" spellcheck="false" aria-controls="toolsGrid" autofocus>
    <button type="button" id="clearSearch" class="search-clear" aria-label="Clear search" hidden>&times;</button>
  </div>
  <ul class="hero-stats">
    <li>${total}+ free tools</li>
    <li>${categories.length} categories</li>
    <li>No sign-up needed</li>
    <li>Runs in your browser</li>
  </ul>
  ${popularLinks ? `<div class="popular"><span>Popular:</span>${popularLinks}</div>` : ''}
</section>

<div class="filter-bar" role="group" aria-label="Filter tools by category">${pills}</div>
<p class="result-count" id="resultCount" role="status" aria-live="polite"></p>

<div class="tools-grid" id="toolsGrid">
${cards}
</div>
<div class="no-results" id="noResults" hidden>
  <p><strong>No tools found.</strong></p>
  <p>Try a different keyword or select the &ldquo;All&rdquo; category.</p>
</div>
<script>${HOME_SCRIPT}</script>`;

  const contentHtml = `
<h2>About ToolsNest: Free Online Tools That Run in Your Browser</h2>
<p>ToolsNest is a free collection of ${total}+ online tools built to save you time on everyday digital tasks. Whether you need to merge a PDF, compress a photo, count the words in an essay, work out a loan EMI or format a block of JSON, you will find a simple, focused tool here that does the job in seconds. There is no sign-up, no software to install and no watermark added to your results.</p>

<h3>What You Can Do on ToolsNest</h3>
<p>Our tools are organised into clear categories so you can find what you need quickly: PDF tools, image and photo editing, text and writing helpers, finance and math calculators, health and fitness calculators, unit converters, developer and SEO utilities, design makers, and video and audio tools. Type a few letters into the search box to find a tool by name, or use the category buttons to browse everything in one area.</p>

<h3>Your Data Stays Private</h3>
<p>Privacy is a core part of how we build. Most ToolsNest tools run entirely inside your own web browser using JavaScript, which means the files, images and text you work with are processed on your device and are not uploaded to our servers. We do not ask you to create an account or share personal details. The few tools that must contact an external service, such as IP or DNS lookups, say so clearly on their own page. You can read more in our <a href="/privacy-policy/">Privacy Policy</a>.</p>

<h3>Built for Students, Professionals and Developers</h3>
<p>Students use our calculators, converters and grade tools for homework and exam preparation. Freelancers and small business owners create invoices, compress images and sign documents. Developers and marketers rely on formatters, generators and SEO utilities every day. Every tool is mobile-friendly, loads quickly, and comes with a short guide, formula or FAQ so you understand the result instead of just copying it.</p>

<h3>Free and Always Improving</h3>
<p>ToolsNest is supported by advertising, which lets us keep every tool free to use. We test our tools regularly, fix issues quickly and add new tools based on what people ask for. If you have an idea or find a problem, please tell us through the <a href="/contact/">Contact</a> page. Calculator results are estimates provided for general information only; see our <a href="/disclaimer/">Disclaimer</a> for details.</p>`;

  return renderLayout({
    title: 'Free Online Tools for Everyone',
    metaDescription:
      'Free online PDF, image, text, calculator, converter and developer tools. Fast, private and works right in your browser, with no sign-up needed.',
    toolHtml,
    contentHtml,
    category: '',
    toolId: '',
  });
}
