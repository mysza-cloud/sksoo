import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(html.length > 100000);
assert.match(html, /SKSOO v2\.3/);
assert.match(html, /<\/section>\s*<div class="hero-keywords"[^>]*>/);
assert.doesNotMatch(html, /<div class="hero-side"/);
for (const theme of ['dark', 'light', 'green', 'beige', 'navy']) {
  assert(html.includes(`data-choice="${theme}"`), `Brak wyboru motywu ${theme}`);
}
assert.match(html, /localStorage\.setItem\('sksoo-theme'/);
for (const id of ['start', 'onas', 'aktualnosci', 'wydarzenia', 'galeria', 'dolacz', 'kontakt']) {
  assert(html.includes(`id="${id}"`), `Brak działu ${id}`);
}
assert(html.includes('id="relacja-turniej"'), 'Brak podsumowania turnieju');
assert(html.includes('SKSOO Orlik Oborniki zajęło 3. miejsce'), 'Brak wyniku SKSOO');
assert(!html.includes('6 drużyn'), 'Niepotrzebna liczba drużyn w treści');
assert.equal((html.match(/class="result-visual(?: result-story-visual)?"/g) || []).length, 2, 'Plansza z pucharem powinna być w aktualnościach i relacji');
assert(html.includes('<details class="archive-accordion">'), 'Brak rozwijanej zapowiedzi');
for (const className of ['result-visual-field', 'result-visual-crest', 'result-visual-trophy']) {
  assert.equal((html.match(new RegExp(`class="${className}" src="data:image/`, 'g')) || []).length, 2, `Brak osadzonego obrazu ${className} w obu planszach`);
}
assert(html.includes('class="archive-content event-layout"'), 'Rozwinięta zapowiedź utraciła pierwotny układ');
assert(!html.includes('Relację i wyniki opublikujemy po ich potwierdzeniu.'), 'Nieaktualna zapowiedź wyników');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 3);
for (const [, script] of scripts) new Function(script);

const names = ['favicon.png', 'boisko-hero.jpg', 'boisko-dolacz.jpg', 'herb-sksoo.webp', 'o-nas-dekor.webp', 'jedna-pasja.webp', 'kontakt-dekor.webp', 'gramy-dla-matiego.webp', 'tworz-z-nami.webp', 'dolacz-do-sksoo.webp', 'puchar-turniej-2026.png', 'murawa-turniej-2026.png'];
const assetHashes = new Set(names.map(name => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'assets', name))).digest('hex')));
const seen = new Set();
for (const [, base64] of html.matchAll(/data:image\/(?:png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)/g)) {
  const bytes = Buffer.from(base64, 'base64');
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  assert(assetHashes.has(hash), 'Osadzona grafika bez kopii w assets');
  seen.add(hash);
}
assert.equal(seen.size, names.length);
assert(!html.includes('__ASSET_'));
console.log('OK: index.html v2.3, 5 motywów, 7 działów, rozwijane archiwum, 3 skrypty, 12 grafik.');
