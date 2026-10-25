import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(project, '..', 'output', 'github-pages-v2.3');
let html = await fs.readFile(path.join(project, 'index.html'), 'utf8');

const previewStrip = '<div class="preview-strip" role="status"><span class="preview-dot"></span> PODGLĄD PROJEKTU • STRONA NIEOPUBLIKOWANA</div>';
assert(html.includes('<meta name="robots" content="noindex,nofollow">'));
assert(html.includes(previewStrip));
assert(html.includes('Wersja testowa. Grafiki boiskowe są ilustracjami, nie fotografiami turnieju.'));

html = html.replace('<meta name="robots" content="noindex,nofollow">', '<meta name="robots" content="index,follow">');
html = html.replace(previewStrip, '');
html = html.replace('Wersja testowa. Grafiki boiskowe są ilustracjami, nie fotografiami turnieju.', 'Grafiki boiskowe są ilustracjami, nie fotografiami turnieju.');

await fs.mkdir(target, { recursive: true });
await fs.writeFile(path.join(target, 'index.html'), html);
await fs.writeFile(path.join(target, '.nojekyll'), '');
console.log(`Paczka GitHub Pages przygotowana lokalnie: ${target}`);
