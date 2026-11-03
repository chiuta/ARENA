# Jurnal de modificări

## 2.2.4 — 2026-11-03

Seif comun de chei API (plic keys/vault): cheile se pot importa din VaultCrypt prin fișier, clipboard, cod QR sau altă filă (nu prin link); parola se cere la import, cheile nu se scriu în clar în localStorage. Cod comun din hub: tools/fff-envelope.js și tools/fff-seif.js (injectat).

## 2.2.3 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

## 2.2.3 — 2026-11-02

### Surse actualizate (runda 2, verificat la 2026-11-02)
- Numărătoarea din text: „181 AI-uri / 68 provideri” -> 176 modele / 65 provideri (numărate din catalogul din cod), în cele 8 limbi și în README-uri.
- Nota Cerebras: „Free tier, ~1M tokeni/zi” nu mai este confirmată; cerebras.ai/pricing menționează un credit promoțional unic de 5 $ (metodă de plată necesară, expiră în 30 de zile).

## 2.2.2 — 2026-11-02

### Surse actualizate (catalogul de provideri, verificat parțial la 2026-11-02)
- **GitHub Models eliminat din catalog:** serviciul a fost retras pe 30 iulie 2026 (docs.github.com, „costs for GitHub Models”). Intrările deja salvate de utilizatori nu se șterg.
- **Anthropic:** adăugate `claude-fable-5-1`, `claude-opus-5-5`, `claude-haiku-5-5` (platform.claude.com, „Models overview”); modelele 4.x rămân (încă active).
- **OpenAI:** adăugate `gpt-6-astra`, `gpt-6.1-sol`, `gpt-6.1-terra`, `gpt-6-luna`; scoase `gpt-5-mini` și `gpt-5-nano` (închidere 2026-12-11, developers.openai.com/api/docs/deprecations); `gpt-5.1` rămâne (până la 2027-04-01).
- **Groq:** scoase `llama-3.3-70b-versatile` și `llama-3.1-8b-instant` (închise 2026-08-16), `groq/compound` și `groq/compound-mini` (închise 2026-09-21); `qwen/qwen3.6-27b` înlocuit cu `qwen/qwen3.8-27b` (console.groq.com/docs/deprecations).
- **Cerebras:** scoase `zai-glm-4.7` (retras 2026-08-26) și `gemma-4-31b` (scos din Shared Inference 2026-09-03); adăugat `qwen-3.8-27b`.
- **Google AI Studio:** adăugat `gemini-3.8-flash` (nivel gratuit, ai.google.dev/pricing).
- Verificat fără modificare: limitele OpenRouter (20 cereri/min, 50/zi, 1000/zi după 10$) și limita Cohere trial (20/min, 1000/lună).
- Neverificat (rămâne neschimbat): restul providerilor și limitele lor gratuite; numărătoarea „181 AI-uri / 68 provideri la 29 iulie 2026” din text nu a fost recalculată.

## 2.2.1 — 2026-10-31

### Securitate
- **CSP strâns:** `connect-src` nu mai permite `ws:`/`wss:` și `img-src` nu mai permite `https:`. Aplicația nu folosește WebSocket, EventSource sau imagini la distanță, deci funcționalitatea nu se schimbă; scade suprafața de exfiltrare dacă o pagină ar fi compromisă.
- Rămâne `connect-src https: http:` intenționat: endpoint-urile proprii și serverele din rețeaua locală (adrese care nu pot fi listate în CSP) trebuie să funcționeze. Compromisul e documentat; o listă albă strictă ar rupe această funcție.
- `app.json`/`fff-info`/`sw.js` regenerate cu fff-kit (`release`), `check` strict trece, testele `keyvault-core` și `eval-sets` trec.

### Interfață
- Selectorul de limbă (8 butoane de 44 px pe ecrane tactile) trece pe mai multe rânduri sub 640 px; înainte pagina avea 10 px de scroll orizontal la 360 px.

## 2.2.0 — 2026-10-27

### Adăugat
- **Traduceri pentru componenta de protecție cu parolă** (cardul și dialogurile de creare/deblocare/confirmare, inclusiv avertismentul „neauditat”) în **fr, it, es, pt, de, hu** — traduceri automate, neverificate de vorbitori nativi. Până acum aceste limbi cădeau pe engleză. Doar textele din `KeyVault UI`; **logica criptografică nu s-a modificat** (nucleul `KeyVault 1.0.0` este identic octet cu octet).
- Test nou: `tests/keyvault-i18n.test.mjs` (fără chei netraduse, avertismentul numește AES-256-GCM și iterațiile, textul diferă de engleză, 0 cereri de rețea).
- `sizeBytes`/`sha256` din `app.json` și `fff-info` regenerate cu uneltele fff-kit (`fixcsp`, `info`, `check --lax`).

### Neimplementat
- README-urile în fr/it/es/pt/de/hu au doar versiunea actualizată.
- Fără audit extern al componentei: rămâne marcată „neauditată”.

## 2.1.0 — 2026-10-27

Recenzie 2026-10-27.

### Adăugat
- Criptare opțională cu parolă a cheilor API (WebCrypto AES-256-GCM + PBKDF2-SHA256, 600 000 de iterații, sare aleatoare), în Setări → Datele tale. Implicit oprită; migrare opțională în ambele sensuri, fără pierderea cheilor existente. Componentă neauditată de un terț (avertisment în aplicație și în README). „Șterge toate datele” șterge și seiful.
- Trei seturi demonstrative de câte 10 prompturi în română (`demo-ro-1..3`, v1) pentru comparații repetabile, adăugabile din fila Evaluare; etichetate ca demonstrative, nu benchmark validat.
- Teste noi: `tests/keyvault-core.test.mjs`, `tests/keyvault-ui.test.mjs` (include și seturile demonstrative).
- Linii „Stare” și „Offline” în README și metadate (`app-status`, `app-offline`).

### Modificat
- Hash-urile CSP ale scripturilor inline au fost recalculate. Textele noi ale butonului/notei de seturi sunt în toate cele 8 limbi (traducerile automate nu sunt verificate nativ).

### Neschimbat
- Nimic șters; fără dependențe noi, fără gazde noi în CSP. Elo local și dueluri oarbe, neatinse.

Istoricul anterior (până la 2.0.0, 2026-10-26) este în secțiunea „Istoric / Changelog” din README.md.
