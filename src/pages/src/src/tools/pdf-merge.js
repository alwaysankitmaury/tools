/**
 * src/tools/pdf-merge.js
 * Client-side PDF merge tool. Returns a complete, self-contained HTML document string.
 * All processing happens in the user's browser (pdf-lib from CDN); no file is uploaded.
 */
export function getToolHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Merge PDFs</title>
<style>
  :root {
    --bg: #f2f5f8;
    --surface: #ffffff;
    --ink: #14213d;
    --muted: #5b6577;
    --line: #d5dce6;
    --accent: #0b5cad;
    --accent-ink: #ffffff;
    --accent-soft: #e4effa;
    --danger: #b3261e;
    --ok: #1b7a43;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f1624;
      --surface: #182236;
      --ink: #e8edf5;
      --muted: #9aa6bb;
      --line: #2b3a55;
      --accent: #5aa6f0;
      --accent-ink: #08213d;
      --accent-soft: #1d3250;
      --danger: #ff8a80;
      --ok: #6fd69a;
    }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    background: var(--bg);
    color: var(--ink);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Devanagari", sans-serif;
    line-height: 1.5;
    padding: 24px 16px 48px;
  }
  .pm-wrap { max-width: 680px; margin: 0 auto; }
  h1 { font-size: 1.6rem; margin: 0 0 4px; letter-spacing: -0.01em; }
  .pm-sub { margin: 0 0 20px; color: var(--muted); font-size: 0.95rem; }

  .pm-drop {
    display: block;
    border: 2px dashed var(--line);
    background: var(--surface);
    border-radius: 12px;
    padding: 36px 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color .15s, background .15s;
  }
  .pm-drop:hover, .pm-drop.is-over, .pm-drop:focus-within {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .pm-drop strong { display: block; font-size: 1.05rem; margin-bottom: 4px; }
  .pm-drop span { color: var(--muted); font-size: 0.9rem; }
  .pm-drop input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

  .pm-list { list-style: none; margin: 16px 0 0; padding: 0; }
  .pm-item {
    display: flex; align-items: center; gap: 10px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 8px;
  }
  .pm-pos {
    flex: none; width: 26px; height: 26px; border-radius: 50%;
    background: var(--accent-soft); color: var(--accent);
    font-size: 0.8rem; font-weight: 600;
    display: grid; place-items: center;
  }
  .pm-meta { flex: 1; min-width: 0; }
  .pm-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pm-size { color: var(--muted); font-size: 0.82rem; }
  .pm-actions { display: flex; gap: 4px; flex: none; }
  .pm-icon {
    width: 32px; height: 32px;
    border: 1px solid var(--line); background: transparent; color: var(--ink);
    border-radius: 8px; cursor: pointer; font-size: 0.95rem; line-height: 1;
  }
  .pm-icon:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .pm-icon:disabled { opacity: .35; cursor: not-allowed; }
  .pm-icon:focus-visible, .pm-btn:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }

  .pm-summary { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; color: var(--muted); font-size: 0.9rem; }
  .pm-link { background: none; border: 0; color: var(--accent); cursor: pointer; font: inherit; text-decoration: underline; padding: 0; }

  .pm-btn {
    display: inline-block; width: 100%;
    margin-top: 14px; padding: 13px 18px;
    border: 0; border-radius: 10px;
    background: var(--accent); color: var(--accent-ink);
    font: inherit; font-weight: 600; font-size: 1rem;
    cursor: pointer; text-align: center; text-decoration: none;
  }
  .pm-btn:hover:not(:disabled) { filter: brightness(1.08); }
  .pm-btn:disabled { opacity: .45; cursor: not-allowed; }
  .pm-btn.secondary { background: var(--ok); color: #fff; }
  @media (prefers-color-scheme: dark) { .pm-btn.secondary { color: #06210f; } }

  .pm-progress { margin-top: 16px; }
  .pm-bar { height: 10px; background: var(--line); border-radius: 999px; overflow: hidden; }
  .pm-fill { height: 100%; width: 0; background: var(--accent); transition: width .2s ease; }
  .pm-status { margin-top: 6px; font-size: 0.88rem; color: var(--muted); }

  .pm-msg { margin-top: 14px; padding: 10px 12px; border-radius: 8px; font-size: 0.92rem; }
  .pm-msg.error { background: color-mix(in srgb, var(--danger) 14%, transparent); color: var(--danger); }
  .pm-msg.ok { background: color-mix(in srgb, var(--ok) 14%, transparent); color: var(--ok); }

  [hidden] { display: none !important; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
</head>
<body>
<main class="pm-wrap">
  <h1>Merge PDFs</h1>
  <p class="pm-sub">Combine two or more PDF files into one. Files stay in your browser and are never uploaded.</p>

  <label class="pm-drop" id="pm-drop">
    <input type="file" id="pm-input" accept="application/pdf,.pdf" multiple>
    <strong>Drop PDF files here or click to choose</strong>
    <span>You can select multiple files at once</span>
  </label>

  <ul class="pm-list" id="pm-list" aria-label="Selected PDF files"></ul>

  <div class="pm-summary" id="pm-summary" hidden>
    <span id="pm-count"></span>
    <button type="button" class="pm-link" id="pm-clear">Clear all</button>
  </div>

  <div class="pm-msg error" id="pm-error" role="alert" hidden></div>

  <button type="button" class="pm-btn" id="pm-merge" disabled>Merge PDFs</button>

  <div class="pm-progress" id="pm-progress" hidden>
    <div class="pm-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="pm-bar">
      <div class="pm-fill" id="pm-fill"></div>
    </div>
    <div class="pm-status" id="pm-status" aria-live="polite"></div>
  </div>

  <div class="pm-msg ok" id="pm-done" hidden></div>
  <a class="pm-btn secondary" id="pm-download" download="merged.pdf" hidden>Download Merged PDF</a>
</main>

<script src="https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js"><\/script>
<script>
(function () {
  'use strict';

  var items = [];      // { id, file }
  var nextId = 1;
  var busy = false;
  var downloadUrl = null;

  var $ = function (id) { return document.getElementById(id); };
  var drop = $('pm-drop'), input = $('pm-input'), list = $('pm-list');
  var summary = $('pm-summary'), count = $('pm-count'), clearBtn = $('pm-clear');
  var errorBox = $('pm-error'), mergeBtn = $('pm-merge');
  var progress = $('pm-progress'), bar = $('pm-bar'), fill = $('pm-fill'), status = $('pm-status');
  var done = $('pm-done'), download = $('pm-download');

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function isPdf(file) {
    return file.type === 'application/pdf' || /\\.pdf$/i.test(file.name);
  }

  function showError(text) {
    errorBox.textContent = text;
    errorBox.hidden = !text;
  }

  function resetResult() {
    if (downloadUrl) { URL.revokeObjectURL(downloadUrl); downloadUrl = null; }
    download.hidden = true;
    download.removeAttribute('href');
    done.hidden = true;
    progress.hidden = true;
    setProgress(0, '');
  }

  function setProgress(pct, text) {
    fill.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', String(Math.round(pct)));
    status.textContent = text;
  }

  function addFiles(fileList) {
    var rejected = 0;
    Array.prototype.forEach.call(fileList, function (file) {
      if (isPdf(file)) { items.push({ id: nextId++, file: file }); }
      else { rejected++; }
    });
    showError(rejected ? rejected + ' file(s) skipped because they are not PDFs.' : '');
    resetResult();
    render();
  }

  function move(index, delta) {
    var target = index + delta;
    if (target < 0 || target >= items.length) return;
    var tmp = items[index];
    items[index] = items[target];
    items[target] = tmp;
    resetResult();
    render();
  }

  function removeAt(index) {
    items.splice(index, 1);
    resetResult();
    render();
  }

  function iconButton(label, text, disabled, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'pm-icon';
    b.setAttribute('aria-label', label);
    b.title = label;
    b.textContent = text;
    b.disabled = disabled || busy;
    b.addEventListener('click', onClick);
    return b;
  }

  function render() {
    list.textContent = '';
    items.forEach(function (item, i) {
      var li = document.createElement('li');
      li.className = 'pm-item';

      var pos = document.createElement('div');
      pos.className = 'pm-pos';
      pos.textContent = String(i + 1);

      var meta = document.createElement('div');
      meta.className = 'pm-meta';
      var name = document.createElement('div');
      name.className = 'pm-name';
      name.textContent = item.file.name;
      name.title = item.file.name;
      var size = document.createElement('div');
      size.className = 'pm-size';
      size.textContent = formatSize(item.file.size);
      meta.appendChild(name);
      meta.appendChild(size);

      var actions = document.createElement('div');
      actions.className = 'pm-actions';
      actions.appendChild(iconButton('Move up', '\\u2191', i === 0, function () { move(i, -1); }));
      actions.appendChild(iconButton('Move down', '\\u2193', i === items.length - 1, function () { move(i, 1); }));
      actions.appendChild(iconButton('Remove ' + item.file.name, '\\u2715', false, function () { removeAt(i); }));

      li.appendChild(pos);
      li.appendChild(meta);
      li.appendChild(actions);
      list.appendChild(li);
    });

    var total = items.reduce(function (sum, it) { return sum + it.file.size; }, 0);
    summary.hidden = items.length === 0;
    count.textContent = items.length + (items.length === 1 ? ' file' : ' files') + ' \\u2022 ' + formatSize(total);
    mergeBtn.disabled = busy || items.length < 2;
    clearBtn.disabled = busy;
  }

  async function merge() {
    if (busy || items.length < 2) return;
    busy = true;
    showError('');
    resetResult();
    progress.hidden = false;
    mergeBtn.textContent = 'Merging\\u2026';
    render();

    try {
      var PDFDocument = PDFLib.PDFDocument;
      var merged = await PDFDocument.create();
      var total = items.length;

      for (var i = 0; i < total; i++) {
        var file = items[i].file;
        setProgress((i / total) * 90, 'Reading ' + file.name + ' (' + (i + 1) + ' of ' + total + ')');
        var bytes = await file.arrayBuffer();
        var src;
        try {
          src = await PDFDocument.load(bytes);
        } catch (e) {
          throw new Error('Could not read "' + file.name + '". It may be password-protected or damaged.');
        }
        var pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach(function (p) { merged.addPage(p); });
        // let the browser repaint the progress bar
        await new Promise(function (r) { setTimeout(r, 0); });
      }

      setProgress(95, 'Saving merged file\\u2026');
      var out = await merged.save();
      var blob = new Blob([out], { type: 'application/pdf' });
      downloadUrl = URL.createObjectURL(blob);

      download.href = downloadUrl;
      download.hidden = false;
      setProgress(100, 'Done');
      done.textContent = 'Merged ' + total + ' files into ' + merged.getPageCount() + ' pages (' + formatSize(blob.size) + ').';
      done.hidden = false;
    } catch (err) {
      progress.hidden = true;
      showError(err && err.message ? err.message : 'Something went wrong while merging.');
    } finally {
      busy = false;
      mergeBtn.textContent = 'Merge PDFs';
      render();
    }
  }

  // Events
  input.addEventListener('change', function () {
    addFiles(input.files);
    input.value = '';
  });

  ['dragenter', 'dragover'].forEach(function (evt) {
    drop.addEventListener(evt, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    drop.addEventListener(evt, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
  });
  drop.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  });

  clearBtn.addEventListener('click', function () {
    items = [];
    showError('');
    resetResult();
    render();
  });
  mergeBtn.addEventListener('click', merge);

  render();
})();
<\/script>
</body>
</html>`;
}
