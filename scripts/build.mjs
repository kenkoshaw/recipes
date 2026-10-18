// Builds the recipe web app into _site/: parses every recipe .md into recipes.json,
// copies the app shell and images, and stamps a content hash into the service worker.
import { readdir, readFile, writeFile, mkdir, cp, rm, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { marked } from 'marked';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, '_site');
const CATEGORIES = ['breakfast', 'dinner', 'dessert', 'bread'];

const fixImagePaths = (s) => s.replace(/\.\.\/images\//g, 'images/');
const md = (s) => marked.parse(fixImagePaths(s.trim()));
const mdInline = (s) => marked.parseInline(s.trim());

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return [{}, text];
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map((t) => t.trim()).filter(Boolean);
    meta[kv[1]] = v;
  }
  return [meta, text.slice(m[0].length)];
}

function splitSections(body) {
  const sections = {};
  const parts = body.split(/^## +/m);
  sections._head = parts.shift();
  for (const p of parts) {
    const nl = p.indexOf('\n');
    sections[p.slice(0, nl).trim().toLowerCase()] = p.slice(nl + 1);
  }
  return sections;
}

function parseHead(head) {
  const lines = head.replace(/^# .*$/m, '').trim();
  const glance = {};
  const glanceMatch = lines.match(/^\*\*Makes\*\*.*$/m);
  if (glanceMatch) {
    for (const part of glanceMatch[0].split('·')) {
      const g = part.match(/\*\*(\w+)\*\*\s*(.+)/);
      if (g) glance[g[1].toLowerCase()] = g[2].trim();
    }
  }
  const intro = glanceMatch ? lines.replace(glanceMatch[0], '') : lines;
  return { glance, intro };
}

function parseIngredients(text) {
  const rows = [];
  for (const line of text.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 2 || /^-+$/.test(cells[0].replace(/:/g, '')) || cells[0].toLowerCase() === 'ingredient') continue;
    rows.push({ name: mdInline(cells[0]), grams: cells[1] });
  }
  return rows;
}

function parseMethod(text) {
  const items = text.split(/^\d+\.\s+/m).slice(1);
  return items.map((item) => {
    const [first, ...rest] = item.split('\n');
    const t = first.match(/^\*\*(.+?)\*\*\s*(?:·\s*(.+))?$/);
    const body = rest.map((l) => l.replace(/^ {3}/, '')).join('\n');
    return {
      title: t ? t[1] : mdInline(first),
      time: t && t[2] ? t[2].trim() : '',
      html: md(t ? body : item),
    };
  });
}

function firstImage(text) {
  const m = text.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return m ? fixImagePaths(m[1]) : null;
}

async function loadRecipe(category, file) {
  const raw = await readFile(path.join(ROOT, category, file), 'utf8');
  const [meta, body] = parseFrontmatter(raw.replace(/\r\n/g, '\n'));
  const s = splitSections(body);
  const { glance, intro } = parseHead(s._head);
  const known = new Set(['_head', 'ingredients', 'method', 'tips', 'adjustment log']);
  const image = meta.thumbnail ? fixImagePaths(meta.thumbnail) : firstImage(raw);
  const introText = intro.replace(/^!\[[^\]]*\]\(([^)]+)\)\s*$/m, (line, src) => (fixImagePaths(src) === image ? '' : line));
  return {
    slug: file.replace(/\.md$/, ''),
    category: meta.category || category,
    title: meta.title || file,
    source: meta.source || '',
    servings: meta.servings || '',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    lastMade: meta.last_made || '',
    makes: glance.makes || '',
    total: glance.total || '',
    active: glance.active || '',
    intro: introText.trim() ? md(introText) : '',
    image,
    ingredients: parseIngredients(s.ingredients || ''),
    steps: parseMethod(s.method || ''),
    tips: s.tips ? md(s.tips) : '',
    log: s['adjustment log'] ? md(s['adjustment log']) : '',
    extra: Object.entries(s).filter(([k]) => !known.has(k)).map(([k, v]) => ({ title: k, html: md(v) })),
  };
}

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function listFiles(dir, base = dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listFiles(full, base)));
    else if (!e.name.startsWith('.')) out.push(path.relative(base, full));
  }
  return out;
}

// Short descriptors from the README index, e.g. "- [Gazpacho](dinner/gazpacho.md) — cold soup"
const blurbs = {};
if (await exists(path.join(ROOT, 'README.md'))) {
  for (const m of (await readFile(path.join(ROOT, 'README.md'), 'utf8')).matchAll(/^- \[[^\]]+\]\(([^)]+)\.md\)\s*—\s*(.+)$/gm)) {
    blurbs[path.basename(m[1])] = m[2].trim();
  }
}

const recipes = [];
for (const category of CATEGORIES) {
  const dir = path.join(ROOT, category);
  if (!(await exists(dir))) continue;
  for (const file of (await readdir(dir)).filter((f) => f.endsWith('.md')).sort()) {
    const r = await loadRecipe(category, file);
    r.blurb = blurbs[r.slug] || r.tags.slice(0, 3).join(', ');
    recipes.push(r);
  }
}

// The site is public: refuse to publish photos that still carry EXIF (GPS location, camera, dates).
const EXIF = Buffer.from('Exif\0\0');
if (await exists(path.join(ROOT, 'images'))) {
  const dirty = [];
  for (const f of await listFiles(path.join(ROOT, 'images'))) {
    if ((await readFile(path.join(ROOT, 'images', f))).subarray(0, 65536).includes(EXIF)) dirty.push(f);
  }
  if (dirty.length) {
    console.error(`Photos with EXIF metadata (run scripts/clean-images.sh):\n  ${dirty.join('\n  ')}`);
    process.exit(1);
  }
}
for (const r of recipes) {
  if (r.image && !(await exists(path.join(ROOT, r.image)))) {
    console.error(`${r.slug}: image not found: ${r.image}`);
    process.exit(1);
  }
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp(path.join(ROOT, 'app'), OUT, { recursive: true });
if (await exists(path.join(ROOT, 'images'))) await cp(path.join(ROOT, 'images'), path.join(OUT, 'images'), { recursive: true });

const data = JSON.stringify({ categories: CATEGORIES, recipes });
await writeFile(path.join(OUT, 'recipes.json'), data);

const files = (await listFiles(OUT)).filter((f) => f !== 'sw.js').sort();
const hash = createHash('sha256');
for (const f of files) hash.update(f).update(await readFile(path.join(OUT, f)));
const version = hash.digest('hex').slice(0, 12);

const precache = ['./', ...files.filter((f) => f !== 'index.html').map((f) => f.split(path.sep).join('/'))];
const sw = (await readFile(path.join(OUT, 'sw.js'), 'utf8'))
  .replace('__VERSION__', version)
  .replace('__PRECACHE__', JSON.stringify(precache));
await writeFile(path.join(OUT, 'sw.js'), sw);

console.log(`Built ${recipes.length} recipes, ${precache.length} precached files, version ${version}`);
