// ARENA 2.0 — seturi de prompturi, sesiuni de evaluare oarbă, Elo pe categorii, raport JSON. Modele demo locale, rețea blocată.
import {createRequire} from 'module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const URL_APP = 'file://' + path.join(HERE, '..', 'index.html');
const AXE = process.env.AXE_PATH || process.env.FFF_AXE;
let pass = 0, fail = 0;
const ok = (c, n, i) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (i === undefined ? '' : ' ' + JSON.stringify(i).slice(0, 400))); } };
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
const net = [], errs = [];
async function mk(w = 1280, h = 800, locale = 'ro-RO') {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, acceptDownloads: true, locale});
  await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(URL_APP); await page.waitForTimeout(1500);
  return {ctx, page};
}
const ck = (page, sel) => page.evaluate(s => document.querySelector(s).click(), sel);
const until = (page, fn, ms = 60000) => page.waitForFunction(fn, null, {timeout: ms});
console.log('ARENA — seturi de prompturi și evaluare');
const {ctx, page} = await mk();
ok(await page.evaluate(() => !!document.querySelector('[data-tab=eval]') && document.querySelector('[data-tab=eval]').textContent.length > 2), 'fila Evaluare există');
await ck(page, '[data-tab=eval]');
await page.fill('#ev-name', 'Set test');
await page.fill('#ev-items', 'cod | Scrie o funcție de sortare\nresumat | Rezumă un text scurt\nfără separator');
await ck(page, '#ev-save');
let st = await page.evaluate(() => S.sets);
ok(st.length === 1 && st[0].items.length === 3 && st[0].items[0].c === 'cod' && st[0].items[2].c === '' && st[0].items[2].p === 'fără separator', 'set salvat și parsat', st);
// set invalid
await ck(page, '#ev-new'); await page.fill('#ev-name', ''); await page.fill('#ev-items', 'x'); await ck(page, '#ev-save');
ok(await page.evaluate(() => S.sets.length) === 1, 'set fără nume nu se salvează');
// pornire sesiune
await page.selectOption('#ev-sel', {index: 1});
ok((await page.inputValue('#ev-items')).includes('Rezumă un text scurt'), 'selectarea încarcă setul în editor');
await ck(page, '#ev-start');
await until(page, () => !document.getElementById('v-a').disabled);
ok((await page.inputValue('#d-prompt')).includes('sortare') && /1/.test(await page.textContent('#ev-banner')) && /cod/.test(await page.textContent('#ev-banner')), 'sesiunea pornește primul prompt cu banner');
await ck(page, '#v-a');
ok(await page.evaluate(() => S.history[S.history.length - 1].c) === 'cod', 'duelul poartă categoria din set');
await ck(page, '#d-again');
await until(page, () => !document.getElementById('v-a').disabled);
ok((await page.inputValue('#d-prompt')).includes('Rezumă'), 'butonul de reluare avansează la promptul următor');
await ck(page, '#v-b');
ok(await page.evaluate(() => S.history[S.history.length - 1].c) === 'resumat', 'al doilea duel: categoria resumat');
await ck(page, '#d-again');
await until(page, () => !document.getElementById('v-a').disabled);
ok((await page.inputValue('#d-prompt')) === 'fără separator', 'al treilea prompt');
await ck(page, '#v-tie');
ok(await page.evaluate(() => S.history[S.history.length - 1].c) === '', 'prompt fără categorie: eticheta goală');
await ck(page, '#d-again');
await page.waitForTimeout(300);
ok(await page.evaluate(() => document.getElementById('ev-banner').hidden), 'sfârșitul setului închide sesiunea');
// prompt editat manual în sesiune nu primește categoria
await ck(page, '[data-tab=eval]'); await ck(page, '#ev-start');
await until(page, () => !document.getElementById('v-a').disabled);
await ck(page, '#v-a'); // sesiune activă, prompt 1
// categoria cu prompt modificat
await page.evaluate(() => { window.evCatFor = window.evCatFor; });
ok(await page.evaluate(() => evCatFor('altceva complet')) === '', 'prompt modificat nu primește categoria');
// clasament pe categorii
await ck(page, '[data-tab=board]');
const cats = await page.evaluate(() => [...document.querySelectorAll('#b-cat option')].map(o => o.value));
ok(!(await page.evaluate(() => document.getElementById('b-catrow').hidden)) && cats.includes('cod') && cats.includes('resumat'), 'selector de categorie în clasament', cats);
await page.selectOption('#b-cat', 'cod');
const rowsCod = await page.locator('#board-wrap tbody tr').count();
const exp = await page.evaluate(() => { const h = S.history.filter(x => x.c === 'cod'); return {n: new Set(h.flatMap(x => [x.a, x.b])).size, d: h.length * 2}; });
const sumDuels = await page.evaluate(() => arenaCatStats('cod').reduce((a, x) => a + x.r.m, 0));
ok(rowsCod === exp.n && sumDuels === exp.d, 'tabel pe categoria cod: modelele și duelurile din istoric', [rowsCod, sumDuels, exp]);
const cs = await page.evaluate(() => arenaCatStats('cod').map(x => x.r.elo));
ok(cs.reduce((a, b) => a + b, 0) === 1000 * cs.length && cs[0] >= cs[cs.length - 1] && cs[0] > 1000, 'Elo pe categorie: suma conservată, ordonat descrescător', cs);
await page.selectOption('#b-cat', '');
ok(await page.locator('#board-wrap tbody tr').count() >= 2, 'toate categoriile: clasamentul global');
// raport JSON
const dl = page.waitForEvent('download'); await ck(page, '#b-json');
const d = await dl; const rep = JSON.parse(fs.readFileSync(await d.path(), 'utf8'));
ok(/^arena-raport-.*\.json$/.test(d.suggestedFilename()) && rep.categories.cod && rep.categories.resumat && rep.overall.length >= 2, 'raport JSON cu categorii', Object.keys(rep));
const txt = JSON.stringify(rep);
ok(!/apiKey|sk-|Scrie o funcție/.test(txt), 'raportul nu conține chei sau texte de prompt');
// stare ostilă
const bad = await page.evaluate(() => {
  const o = sanitizeState({models: [], sets: [{id: '<img>', name: '<b>x</b>'.repeat(50), items: [{c: 'a'.repeat(100), p: '<script>'}, {p: ''}, null]}, {items: 'x'}, null], history: [{c: '<i>', a: 'x', b: 'y', s: 1}]});
  return o;
});
ok(bad.sets.length === 1 && bad.sets[0].items.length === 1 && bad.sets[0].items[0].c.length === 40 && bad.sets[0].name.length <= 60 && bad.history[0].c === '<i>', 'sanitizare seturi/categorii', bad);
// XSS la afișare
await page.evaluate(() => { S.history.push({ts: 1, a: S.models[0].id, b: S.models[1].id, s: 1, p: 'x', c: '<img src=x onerror=window.__x=1>'}); renderBoard(); });
ok(await page.evaluate(() => window.__x) === undefined && await page.locator('#b-cat option', {hasText: '<img'}).count() === 1, 'nume de categorie ostil afișat ca text');
// ștergere
await ck(page, '[data-tab=eval]'); await page.selectOption('#ev-sel', {index: 1}); await ck(page, '#ev-del');
await page.waitForTimeout(300);
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /Da|Yes|Confirm|Șterge|Delete/i.test(x.textContent) && x.closest('[role=dialog],dialog,.fff-dlg,[class*=dlg],[class*=modal]')); if (b) b.click(); });
await page.waitForTimeout(400);
ok(await page.evaluate(() => S.sets.length) === 0, 'ștergere set cu confirmare');
// persistență
await page.evaluate(() => { S.sets = [{id: 'p1', name: 'P', items: [{c: 'k', p: 'q'}]}]; saveState(); });
await page.reload(); await page.waitForTimeout(1500);
ok(await page.evaluate(() => S.sets.length === 1 && S.sets[0].items[0].c === 'k'), 'seturile persistă după reîncărcare');
// limbi
for (const l of ['ro', 'en', 'fr', 'it', 'es', 'pt', 'hu', 'de']) {
  const r = await page.evaluate(l => { LANG = l; const keys = ['tab_eval', 'ev_title', 'ev_note', 'ev_sets', 'ev_name', 'ev_items', 'ev_items_ph', 'ev_start', 'ev_save', 'ev_new', 'ev_del', 'ev_none', 'ev_need', 'ev_saved', 'ev_deleted', 'ev_confirm_del', 'ev_prog', 'ev_end', 'ev_cat', 'ev_all', 'ev_json', 'ev_json_done', 'ev_json_empty', 'ev_nocat']; return keys.filter(k => !I18N[l][k] || t(k) === k); }, l);
  ok(r.length === 0, 'chei i18n complete: ' + l, r);
}
await page.evaluate(() => { LANG = 'ro'; applyLang(); });
// a11y + îngust
await ck(page, '[data-tab=eval]');
if (AXE) {
  await page.evaluate(fs.readFileSync(AXE, 'utf8') + '\n;0');
  const ax = await page.evaluate(async () => (await axe.run(document, {resultTypes: ['violations']})).violations.map(v => v.id + ':' + v.nodes.map(n => n.target.join(' ')).slice(0, 3).join('|')));
  ok(ax.length === 0, 'axe 0 violări (Evaluare)', ax);
}
await page.setViewportSize({width: 360, height: 740});
ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), 'fără depășire orizontală 360px');
ok(errs.length === 0, 'fără pageerror', errs);
ok(net.filter(u => !/jsdelivr|esm\.run/.test(u)).length === 0, '0 cereri de rețea proprii', net);
await ctx.close(); await browser.close();
console.log(`${pass} reușite, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
