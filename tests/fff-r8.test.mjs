// Teste funcții noi (runda 8, 14 octombrie 2026) — Playwright, Chromium headless, rețea blocată.
// Rulare: node tests/fff-r8.test.mjs   (cere /opt/node-tools cu playwright și /opt/pw-browsers/chromium; axe-core opțional prin AXE_PATH)
// [fff-portable] axe-core: FFF_AXE / AXE_PATH, apoi pachetul `axe-core` (npm i -D axe-core). Dacă lipsește: undefined (testele cu axe pică cu mesaj clar).
import {createRequire as __fffCR} from 'node:module';
const __fffAxe = () => { try { return __fffCR(import.meta.url).resolve('axe-core/axe.min.js'); } catch { return undefined; } };
import {createRequire} from 'module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const INDEX = path.join(HERE, '..', 'index.html');
const URL_APP = 'file://' + INDEX;
const AXE = process.env.AXE_PATH || __fffAxe();
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (cond, name, info) => { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + (info === undefined ? '' : ' ' + JSON.stringify(info).slice(0, 500))); } };
const FLAGS = ['--no-sandbox', '--allow-loopback-in-peer-connection', '--disable-features=WebRtcHideLocalIpsWithMdns'];
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: FLAGS});
const net = [], errs = [];
async function mk(o = {}) {
  const ctx = await browser.newContext({viewport: {width: o.w || 1280, height: o.h || 800}, acceptDownloads: true, colorScheme: o.scheme || 'dark', reducedMotion: o.reduced ? 'reduce' : 'no-preference', locale: o.locale || 'ro-RO', bypassCSP: !!o.bypassCSP});
  await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
  if (o.init) await ctx.addInitScript(o.init);
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { const t = m.text(); if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(t)) errs.push('console: ' + t); });
  if (o.goto !== false) await page.goto(o.url || URL_APP);
  return {ctx, page};
}
async function axeRun(page, sel) {
  if (!(await page.evaluate(() => !!window.axe))) await page.evaluate(fs.readFileSync(AXE, 'utf8') + '\n;0');
  return page.evaluate(async s => { const r = await window.axe.run(s ? document.querySelector(s) : document, {resultTypes: ['violations']}); return r.violations.map(v => v.id + ':' + v.nodes.map(n => n.target.join(' ')).slice(0, 3).join(' | ')); }, sel || null);
}
const noHScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
// sintetizator vocal fals: înregistrează textele „citite”
const TTS_MOCK = () => {
  window.__spoken = [];
  class U { constructor(t) { this.text = t; this.voice = null; this.lang = ''; this.rate = 1; } }
  const V = [{name: 'Test RO', lang: 'ro-RO', voiceURI: 'ro', localService: true, default: true}, {name: 'Test EN', lang: 'en-US', voiceURI: 'en', localService: true, default: false}];
  const synth = {getVoices: () => V, speaking: false, addEventListener() {}, removeEventListener() {}, pause() {}, resume() {},
    cancel() { synth.speaking = false; }, speak(u) { synth.speaking = true; setTimeout(() => { window.__spoken.push({text: u.text, lang: u.lang}); synth.speaking = false; if (u.onstart) u.onstart({}); if (u.onend) u.onend({}); }, 5); }};
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {value: U, configurable: true}); Object.defineProperty(window, 'speechSynthesis', {value: synth, configurable: true});
};
console.log('ARENA — teste funcții noi (citire cu voce, export duel Markdown, kit)');
const netOwn = () => net.filter(u => !/jsdelivr|esm\.run/.test(u));
for (const [w, h] of [[1280, 800], [360, 740]]) {
  const {ctx, page} = await mk({w, h, init: TTS_MOCK});
  await page.waitForTimeout(3800);
  ok(await page.evaluate(() => !!(window.FFF && FFF.tts && FFF.bundle && FFF.label)), `kit încărcat (${w}x${h})`);
  ok(await noHScroll(page), `fără depășire orizontală ${w}x${h}`);
  const ax = await axeRun(page); ok(ax.length === 0, `axe 0 violări (start) ${w}x${h}`, ax);
  ok(await page.locator('#r8a-d-la').isVisible(), `butonul „Ascultă A” e vizibil ${w}x${h}`);
  await ctx.close();
}
ok(errs.length === 0, 'fără pageerror/CSP la pornire', errs); ok(netOwn().length === 0, '0 cereri de rețea la pornire', netOwn());
{
  const {ctx, page} = await mk({init: TTS_MOCK});
  await page.waitForTimeout(3800);
  await page.locator('#r8a-d-la').click(); await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.__spoken.length) === 0, 'fără răspuns nu se citește nimic');
  await page.locator('#d-prompt').fill('Spune-mi o glumă despre pisici.');
  await page.locator('#d-go').click();
  await page.waitForFunction(() => !document.getElementById('v-a').disabled, null, {timeout: 40000}).catch(() => {});
  const ta = await page.locator('#d-pa').innerText(), tb = await page.locator('#d-pb').innerText();
  ok(ta.length > 5 && tb.length > 5, 'duel cu modele demo: ambele răspunsuri există', [ta.length, tb.length]);
  await page.locator('#r8a-d-la').click(); await page.waitForTimeout(400);
  const sp = await page.evaluate(() => window.__spoken);
  ok(sp.length >= 1 && sp.map(x => x.text).join(' ').replace(/\s+/g, ' ').includes(ta.replace(/\s+/g, ' ').trim().slice(0, 40)), 'răspunsul A este citit cu voce', sp.map(x => x.text.slice(0, 30)));
  await page.locator('#r8a-d-lb').click(); await page.waitForTimeout(400);
  const sp2 = await page.evaluate(() => window.__spoken.length);
  const all2 = (await page.evaluate(() => window.__spoken)).map(x => x.text).join(' ').replace(/\s+/g, ' ');
  ok(sp2 > sp.length && all2.includes(tb.replace(/\s+/g, ' ').trim().slice(0, 40)), 'răspunsul B este citit cu voce', sp2);
  // export înainte de vot: modele nedezvăluite
  let dl = page.waitForEvent('download'); await page.locator('#r8a-d-md').click();
  let d = await dl; let md = fs.readFileSync(await d.path(), 'utf8');
  ok(md.includes('Spune-mi o glumă') && md.includes(ta.replace(/\s+/g, ' ').trim().slice(0, 15)) && /nedezv/i.test(md), 'export duel înainte de vot: fără nume de modele', md.slice(0, 200));
  ok(d.suggestedFilename() === 'arena-duel.md', 'nume fișier export', d.suggestedFilename());
  await page.locator('#v-a').click(); await page.waitForTimeout(400);
  dl = page.waitForEvent('download'); await page.locator('#r8a-d-md').click();
  d = await dl; md = fs.readFileSync(await d.path(), 'utf8');
  ok(/\(Model: /.test(md) && !/nedezv/i.test(md), 'după vot exportul include numele modelelor', md.slice(0, 300));
  const ax = await axeRun(page); ok(ax.length === 0, 'axe 0 violări după duel', ax);
  // oprire
  await page.locator('#r8a-d-st').click();
  // comparație
  await page.locator('[data-tab=cmp]').click();
  await page.locator('#c-prompt').fill('Salut');
  await page.locator('#c-go').click(); await page.waitForTimeout(8000);
  dl = page.waitForEvent('download'); await page.locator('#r8a-c-md').click();
  d = await dl; md = fs.readFileSync(await d.path(), 'utf8');
  ok(md.includes('Salut') && d.suggestedFilename() === 'arena-comparatie.md', 'export comparație', d.suggestedFilename());
  // copie .fff.json
  const b = await page.evaluate(async () => JSON.stringify(await FFF.bundle.build()));
  ok(/arena-ff-v1/.test(b), 'copia .fff.json conține starea ARENA');
  await ctx.close();
}
{
  const {ctx, page} = await mk({});
  await page.waitForTimeout(3800);
  await page.locator('#d-prompt').fill('x'); await page.locator('#r8a-d-la').click();
  ok(true, 'fără sintetizator nu apare eroare de pagină');
  await ctx.close();
}
const errs2 = errs.filter(e => !/Failed to load resource/.test(e));
ok(errs2.length === 0, 'fără pageerror/CSP în tot setul', errs2); ok(netOwn().length === 0, '0 cereri de rețea în tot setul', netOwn());
console.log(`\n${pass} ok, ${fail} eșuate`); await browser.close(); process.exit(fail ? 1 : 0);
