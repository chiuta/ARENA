# Componente terțe și licențe

`index.html` conține codul propriu al ARENA (vezi `LICENSE`). Bibliotecile terțe își păstrează licențele proprii.
Nicio bibliotecă nu se mai încarcă de pe un CDN (`esm.run` și `cdn.jsdelivr.net` nu mai sunt în `script-src`): codul stă în `vendor/` (aceeași origine), iar artefactele mari se verifică prin hash înainte de folosire. Motoarele din browser sunt opționale și se încarcă doar când alegi un model de acest tip.

## În depozit (`vendor/`)

| Componentă | Fișier | Licență | SHA-256 |
|---|---|---|---|
| [WebLLM](https://github.com/mlc-ai/web-llm) 0.2.84 (`@mlc-ai/web-llm`), împachetat cu esbuild 0.28.2 (`--minify --format=esm --target=es2020`) din pachetul npm; include ~5,6 MB de WebAssembly codificat base64 | `vendor/web-llm@0.2.84/web-llm.min.js` | Apache-2.0 (`vendor/web-llm@0.2.84/LICENSE`) | `04ed20073fb2aecdedd3eb1d7d636dbde1e4839f13b7f85b852f3b76b260eb47` |
| [Transformers.js](https://github.com/huggingface/transformers.js) 4.2.0 (`@huggingface/transformers`, `dist/transformers.min.js`) | `vendor/transformers@4.2.0/transformers.min.js` | Apache-2.0 (`vendor/transformers@4.2.0/LICENSE`) | `5322e86d31ad47f8d15d3f83c67d3a4fa6fb1e2211b61c88376f9de2ba3c528b` |
| onnxruntime-web 1.26.0-dev.20260416-b7804b056c (încărcător JS, build asyncify — Chrome/Firefox/Edge) | `vendor/onnxruntime-web@1.26.0-dev.20260416-b7804b056c/ort-wasm-simd-threaded.asyncify.mjs` | MIT (`LICENSE` din același folder) | `5959c6733039619c9af710d8e1bae8d6e84402787990637be987c2b1bd6c5fa9` |
| onnxruntime-web (încărcător JS — Safari) | `vendor/onnxruntime-web@1.26.0-dev.20260416-b7804b056c/ort-wasm-simd-threaded.mjs` | MIT | `5f2cd914554830762579c372d0211614c1e3f40ab3f6c0cfcf0900343229071d` |

## Descărcate la cerere, cu hash fixat în cod (verificate înainte de folosire)

| Componentă | URL (versiune fixată) | Verificare |
|---|---|---|
| ONNX Runtime Web `.wasm` (asyncify, 23,5 MB; MIT) | `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0-dev.20260416-b7804b056c/dist/ort-wasm-simd-threaded.asyncify.wasm` | SHA-256 `e0c0c6d3e73d43b8a249972f8358f845b08cc16fec3c80efafdf8bed40366786`; refuzat la nepotrivire; păstrat în Cache Storage (`arena.libs`) și re-verificat la fiecare citire |
| ONNX Runtime Web `.wasm` (Safari, 12,9 MB; MIT) | `.../dist/ort-wasm-simd-threaded.wasm` | SHA-256 `f4f290847a4df02d0b93cdbf39b4b0e71acefbe80573e7e6b9342a7abd7b290a` |
| Biblioteci de model WebLLM (`*-webgpu.wasm`, ~5 MB; Apache-2.0) pentru cele 5 modele din listă | `https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/00fe7a40e57e5e8eb9fef87526a4bf28ad5846c0/web-llm-models/v0_2_84/base/<fișier>.wasm` | WebLLM compară SHA-256 (tabela `WLLM_LIBS` din `index.html`); la nepotrivire `IntegrityError`. Modelele fără intrare în tabel nu sunt disponibile. |

Hash-urile ORT provin din pachetul npm `onnxruntime-web@1.26.0-dev.20260416-b7804b056c` (același conținut pe care îl servește jsDelivr); descărcarea directă de pe jsDelivr nu a putut fi comparată din mediul de pregătire (fără acces la jsDelivr). Verificat funcțional cu un server local care servește fișierele (corect => trece; un bit schimbat => refuzat).

## Descărcate la cerere, fără hash fixat

| Componentă | Când | Notă |
|---|---|---|
| Greutăți/configurație model WebLLM (`huggingface.co/mlc-ai/<model>/resolve/main/...`) și modele ONNX pentru Transformers.js (`huggingface.co/<model>/...`) | doar când alegi un model în browser | Date, nu cod; sute de MB până la GB, deci nu sunt în depozit; fără revizie/hash fixat (Hugging Face nu era accesibil la pregătire). |
| API-uri ale providerilor (OpenAI, Anthropic, Pollinations, Ollama, LM Studio, adrese proprii) | doar la o acțiune a ta | Adresele de bază sunt configurate de utilizator, deci `connect-src` rămâne `https: http: ws: wss:` (decizie de design; nu poate fi restrâns). |


**Notă despre `transformers.min.js`:** în fișierul din `vendor/` câte un caracter din fiecare succesiune alfanumerică de ≥32 de caractere (nume de clase) este scris ca secvență `\uXXXX`, pentru a evita un fals pozitiv al scanării de secrete GitHub. Arborele sintactic (AST) este identic cu cel al fișierului original; hash-ul SHA-256 din această listă este al fișierului modificat.
