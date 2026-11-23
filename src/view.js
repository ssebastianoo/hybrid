import { aggiungiGiorni, indiceLunedi } from "./dates.js";

export const BOOK_URL = "https://dime.comune.venezia.it/servizio/agenda-sale-musica";
const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const DOW = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];

const ICON_ARROW =
  '<svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"/></svg>';

const FAVICON =
  "data:image/svg+xml," +
  "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Crect width='32' height='32' rx='8' fill='%23181818'/%3E" +
  "%3Crect x='7' y='9' width='18' height='16' rx='3' fill='none' stroke='%23fff' stroke-width='2'/%3E" +
  "%3Cpath d='M7 14h18' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const plurale = (n, uno, molti) => `${n} ${n === 1 ? uno : molti}`;

function riepilogo(slot, giorni) {
  if (!slot) return "Nessuno slot libero";
  return `<strong>${plurale(slot, "slot libero", "slot liberi")}</strong> in ${plurale(giorni, "giorno", "giorni")}`;
}

const CSS = /* css */ `
:root{
  color-scheme:light dark;
  --ease:cubic-bezier(0.22,1,0.36,1);
  --bg:#ffffff; --surface:#f5f5f5; --surface-2:#ececec; --chip:#ffffff; --border:#dedede;
  --text:#111111; --muted:#6b6b6b;
  --a:#1d5fd1; --a-ink:#ffffff; --b:#b45309; --b-ink:#ffffff;
}
@media (prefers-color-scheme:dark){
  :root{
    --bg:#000000; --surface:#181818; --surface-2:#1f1f1f; --chip:#272727; --border:#313131;
    --text:#ffffff; --muted:#9b9b9b;
    --a:#7db4ff; --a-ink:#000000; --b:#ffb454; --b-ink:#000000;
  }
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{background:var(--bg);color:var(--text);font-family:"Geist",ui-sans-serif,system-ui,sans-serif;
  font-size:14px;line-height:20px;font-weight:400;-webkit-font-smoothing:antialiased}
a{color:inherit}
ol,ul{list-style:none}
h1,p{text-wrap:pretty}
h1{text-wrap:balance}
:focus-visible{outline:2px solid var(--text);outline-offset:2px}

.heading-4{font-size:30px;line-height:36px;font-weight:600}
.title-3{font-size:16px;line-height:24px;font-weight:500}
.body-5{font-size:14px;line-height:20px;font-weight:500}
.body-6{font-size:14px;line-height:20px;font-weight:400}
.button-sm{font-size:14px;line-height:20px;font-weight:600}
.caption-3{font-size:12px;line-height:16px;font-weight:600}
.caption-4{font-size:12px;line-height:16px;font-weight:500}
.caption-5{font-size:12px;line-height:16px;font-weight:400}
.muted{color:var(--muted)}

.skip{position:absolute;left:16px;top:-64px;background:var(--text);color:var(--bg);padding:8px 12px;border-radius:8px;z-index:10}
.skip:focus{top:16px}

.wrap{max-width:1120px;margin:0 auto;padding:48px 24px 64px}
header.top{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:32px}
header.top .intro{display:flex;flex-direction:column;gap:8px;max-width:680px}

.btn{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;border:1px solid var(--text);
  background:var(--text);color:var(--bg);text-decoration:none;cursor:pointer;font-family:inherit;
  transition:opacity .3s var(--ease),transform .3s var(--ease)}
.btn:hover{opacity:.85}
.btn:active{transform:scale(.98)}

.toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.filters{display:flex;gap:8px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;border:1px solid var(--border);
  background:var(--surface);color:var(--text);font-family:inherit;cursor:pointer;
  transition:background-color .3s var(--ease),color .3s var(--ease),border-color .3s var(--ease),transform .3s var(--ease)}
.pill:hover{background:var(--surface-2)}
.pill:active{transform:scale(.98)}
.pill[aria-pressed="true"]{background:var(--text);color:var(--bg);border-color:var(--text)}

.badge{display:grid;place-items:center;width:16px;height:16px;border-radius:2px;flex:none;
  background:var(--text);color:var(--bg);font-family:"Geist",sans-serif;font-size:12px;line-height:16px;font-weight:600}
[data-sala="A"] .badge,.pill[data-filter="A"] .badge{background:var(--a);color:var(--a-ink)}
[data-sala="B"] .badge,.pill[data-filter="B"] .badge{background:var(--b);color:var(--b-ink)}
.pill[aria-pressed="true"] .badge{outline:1px solid var(--bg)}

.weekdays{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin-bottom:8px;padding:0 8px;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}

.day{display:flex;flex-direction:column;gap:8px;min-height:96px;padding:8px;border-radius:12px;
  background:var(--surface);border:1px solid var(--border);
  transition:background-color .3s var(--ease);
  animation:rise .5s var(--ease) both;animation-delay:calc(var(--i) * 20ms)}
.day.has:hover{background:var(--surface-2)}
.day.is-today{border-color:var(--text)}
.day.off{background:transparent;border-color:transparent;animation:none}
.day.off .head{color:var(--muted);opacity:.5}

.head{display:flex;align-items:baseline;gap:4px}
.dow{display:none}
.mon{display:none;color:var(--muted)}
.day.show-mon .mon{display:inline}
.today{margin-left:auto;padding:0 4px;border-radius:4px;background:var(--text);color:var(--bg)}

.body{display:flex;flex-direction:column;gap:8px;min-width:0}
.slots{display:flex;flex-direction:column;gap:4px}
.slot{display:flex;align-items:center;gap:4px;padding:4px;border-radius:4px;background:var(--chip);
  color:inherit;text-decoration:none;font-family:"Geist Mono",ui-monospace,monospace;font-size:12px;line-height:16px;font-weight:500;
  transition:background-color .3s var(--ease),transform .3s var(--ease)}
.slot:hover{background:var(--border)}
.slot:active{transform:scale(.98)}
.slot[hidden]{display:none}
.none{display:none}
.day:not(.has):not(.off) .none{display:block}

.empty{margin-bottom:16px;padding:24px;border-radius:16px;background:var(--surface);border:1px solid var(--border);
  display:flex;flex-direction:column;gap:8px}

footer.foot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:32px;color:var(--muted)}
footer.foot nav{display:flex;gap:16px}
footer.foot a{text-underline-offset:4px}
footer.foot a:hover{color:var(--text)}

.card{max-width:480px;margin:96px auto;padding:24px;border-radius:16px;background:var(--surface);border:1px solid var(--border);
  display:flex;flex-direction:column;gap:12px;align-items:flex-start}

@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){
  .day{animation-name:fade}
  .btn,.pill,.slot,.day{transition-duration:.01ms}
}

@media (max-width:960px){
  .wrap{padding:24px 16px 48px}
  .weekdays{display:none}
  .grid{grid-template-columns:1fr}
  .day.off{display:none}
  .day{flex-direction:row;align-items:flex-start;gap:12px;padding:12px;min-height:0}
  .head{flex:0 0 56px;flex-direction:column;align-items:flex-start;gap:0}
  .dow,.mon{display:block}
  .today{margin:4px 0 0}
  .body{flex:1}
  .slots{flex-direction:row;flex-wrap:wrap}
}
`;

const SCRIPT = /* js */ `
(() => {
  const root = document.getElementById("cal");
  const pills = document.querySelectorAll(".pill");
  const summary = document.getElementById("summary");
  const pl = (n, a, b) => n + " " + (n === 1 ? a : b);
  function apply(f) {
    let slots = 0, days = 0;
    root.querySelectorAll(".day").forEach((d) => {
      let n = 0;
      d.querySelectorAll(".slot").forEach((s) => {
        const show = f === "all" || s.dataset.sala === f;
        s.hidden = !show;
        if (show) n++;
      });
      d.classList.toggle("has", n > 0);
      slots += n;
      if (n) days++;
    });
    summary.innerHTML = slots
      ? "<strong>" + pl(slots, "slot libero", "slot liberi") + "</strong> in " + pl(days, "giorno", "giorni")
      : "Nessuno slot libero";
    pills.forEach((p) => p.setAttribute("aria-pressed", String(p.dataset.filter === f)));
  }
  pills.forEach((p) => p.addEventListener("click", () => apply(p.dataset.filter)));

})();
`;

/** Guscio HTML comune a tutte le pagine. */
export function pagina({ titolo, descrizione, corpo, script = "" }) {
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titolo)}</title>
<meta name="description" content="${esc(descrizione)}">
<meta property="og:title" content="${esc(titolo)}">
<meta property="og:description" content="${esc(descrizione)}">
<meta property="og:type" content="website">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=swap">
<style>${CSS}</style>
</head>
<body>
<a class="skip button-sm" href="#main">Vai al contenuto</a>
${corpo}
${script ? `<script>${script}</script>` : ""}
</body>
</html>`;
}

/**
 * Calendario a griglia settimanale (lun–dom) dal giorno `oggi` al giorno `fine`.
 * @param {Record<string, Record<string, string[]>>} res {giorno: {sala: [orari]}}
 */
export function renderCalendario({ res, oggi, fine, giorni }) {
  const saleSet = new Set();
  for (const sale of Object.values(res)) for (const s of Object.keys(sale)) saleSet.add(s.replace(/^sala\s+/i, ""));
  const sale = [...saleSet].sort();

  const inizioGriglia = aggiungiGiorni(oggi, -indiceLunedi(oggi));
  const fineGriglia = aggiungiGiorni(fine, 6 - indiceLunedi(fine));

  let celle = "";
  let totSlot = 0;
  let totGiorni = 0;
  for (let d = inizioGriglia, i = 0; d <= fineGriglia; d = aggiungiGiorni(d, 1), i++) {
    const [, m, dd] = d.split("-").map(Number);
    const attivo = d >= oggi && d <= fine;
    const slot = Object.entries(res[d] ?? {})
      .flatMap(([sala, orari]) => orari.map((t) => ({ sala: sala.replace(/^sala\s+/i, ""), t })))
      .sort((a, b) => a.t.localeCompare(b.t) || a.sala.localeCompare(b.sala));
    if (attivo && slot.length) {
      totSlot += slot.length;
      totGiorni++;
    }
    const classi = ["day"];
    if (!attivo) classi.push("off");
    if (attivo && slot.length) classi.push("has");
    if (d === oggi) classi.push("is-today");
    if (dd === 1 || i === 0 || d === oggi) classi.push("show-mon");
    const head =
      `<div class="head title-3"><span class="dow caption-4 muted">${DOW[i % 7]}</span>` +
      `<span class="num">${dd}</span><span class="mon caption-4">${MESI[m - 1]}</span>` +
      (d === oggi ? '<span class="today caption-3">Oggi</span>' : "") +
      "</div>";
    if (!attivo) {
      celle += `<li class="${classi.join(" ")}" aria-hidden="true" style="--i:${Math.min(i, 12)}">${head}</li>`;
      continue;
    }
    const chips = slot
      .map(
        ({ sala, t }) =>
          `<a class="slot" data-sala="${esc(sala)}" href="${BOOK_URL}" target="_blank" rel="noopener" ` +
          `aria-label="Sala ${esc(sala)}, ${esc(t.replace("-", " alle "))}">` +
          `<span class="badge">${esc(sala)}</span><time>${esc(t.replace("-", "–"))}</time></a>`,
      )
      .join("");
    celle +=
      `<li class="${classi.join(" ")}" style="--i:${Math.min(i, 12)}">${head}` +
      `<div class="body"><div class="slots">${chips}</div><p class="none caption-5 muted">Nessuno slot</p></div></li>`;
  }

  const [, mi, di] = oggi.split("-").map(Number);
  const [yf, mf, df] = fine.split("-").map(Number);
  const periodo = `dal ${di} ${MESI[mi - 1]} al ${df} ${MESI[mf - 1]} ${yf}`;
  const aggiornato = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const filtri =
    sale.length > 1
      ? `<div class="filters" role="group" aria-label="Filtra per sala">
  <button type="button" class="pill button-sm" data-filter="all" aria-pressed="true">Tutte le sale</button>
  ${sale
    .map(
      (s) =>
        `<button type="button" class="pill button-sm" data-filter="${esc(s)}" aria-pressed="false"><span class="badge">${esc(s)}</span>Sala ${esc(s)}</button>`,
    )
    .join("\n  ")}
</div>`
      : "<div></div>";

  const vuoto = totSlot
    ? ""
    : `<div class="empty"><p class="title-3">Nessuno slot libero ${periodo}</p>
<p class="body-6 muted">Gli slot tornano disponibili quando qualcuno disdice. Riprova tra qualche ora.</p></div>`;

  const corpo = `<div class="wrap">
<header class="top">
  <div class="intro">
    <h1 class="heading-4">Sale prova Hybrid Music</h1>
    <p class="body-6 muted">Orari liberi ${periodo}, a Mestre. Gli slot durano due ore.</p>
  </div>
  <a class="btn button-sm" href="${BOOK_URL}" target="_blank" rel="noopener">Prenota sul sito del Comune ${ICON_ARROW}</a>
</header>
<main id="main">
  <div class="toolbar">
    ${filtri}
    <p id="summary" class="body-5 muted" aria-live="polite">${riepilogo(totSlot, totGiorni)}</p>
  </div>
  ${vuoto}
  <div class="weekdays caption-3" aria-hidden="true">${DOW.map((x) => `<span>${x}</span>`).join("")}</div>
  <ol class="grid" id="cal" aria-label="Calendario degli slot liberi, ${giorni} giorni">${celle}</ol>
</main>
<footer class="foot caption-5">
  <p>Dati dall'agenda del Comune di Venezia, aggiornati alle ${aggiornato}.</p>
  <nav aria-label="Altri formati"><a href="/text">Testo</a><a href="/json">JSON</a></nav>
</footer>
</div>`;

  return pagina({
    titolo: "Hybrid Music · Orari sale prova",
    descrizione: `Orari liberi delle sale prova Hybrid Music a Mestre ${periodo}, dall'agenda del Comune di Venezia.`,
    corpo,
    script: SCRIPT,
  });
}

export function renderErrore({ titolo, messaggio, azione = "Riprova", href = "/" }) {
  return pagina({
    titolo: `${titolo} · Hybrid Music`,
    descrizione: messaggio,
    corpo: `<main id="main" class="wrap"><div class="card">
<h1 class="heading-4">${esc(titolo)}</h1>
<p class="body-6 muted">${esc(messaggio)}</p>
<a class="btn button-sm" href="${href}">${esc(azione)}</a>
</div></main>`,
  });
}
