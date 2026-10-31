# Jurnal de modificări

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
