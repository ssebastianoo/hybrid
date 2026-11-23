// Orari disponibili per le sale prova Hybrid Music (Comune di Venezia).
// Usa l'API che il sito https://dime.comune.venezia.it/servizio/agenda-sale-musica
// chiama dietro le quinte (nessun login, nessun captcha).
//
//   GET /            -> calendario (prossimi 30 giorni)
//   GET /text        -> testo leggibile
//   GET /json        -> JSON
//   ?giorni=7        -> numero di giorni (1-30), valido su tutte le route

import { aggiungiGiorni, oggiVenezia } from "./dates.js";
import { renderCalendario, renderErrore } from "./view.js";

const API = "https://gwapi.sad.ve.it/agenda/1.0.0/api/agenda/disponibilitaAppuntamento";
const ID_SOTTOCATEGORIA = 40501; // "Musica - Sale Prova"
const GIORNI = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
const MAX_GIORNI = 30;

async function fetchDisponibilita(inizio, fine) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({
      inizio,
      fine,
      idSottocategoria: ID_SOTTOCATEGORIA,
      origin: "FE", // obbligatorio, altrimenti 400
    }),
  });
  if (!res.ok) throw new Error(`API ha risposto ${res.status}`);
  const data = await res.json();
  if (!data.esito?.success) throw new Error(data.esito?.message ?? "Errore API");
  return data.dati ?? [];
}

/** {giorno: {sala: ["15:00-17:00", ...]}} */
function raggruppa(dati) {
  const out = {};
  for (const d of dati) {
    const sala = d.descrizioneSede.split(" - ").at(-1); // "sala A"
    for (const o of d.orari) {
      if (o.slotResidui > 0) {
        ((out[d.giorno] ??= {})[sala] ??= []).push(
          `${o.orarioInizio.slice(0, 5)}-${o.orarioFine.slice(0, 5)}`,
        );
      }
    }
  }
  for (const sale of Object.values(out)) for (const s of Object.keys(sale)) sale[s].sort();
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

function formatta(res) {
  const giorni = Object.keys(res);
  if (!giorni.length) return "Nessuna disponibilità.\n";
  let txt = "";
  for (const giorno of giorni) {
    const [y, m, d] = giorno.split("-");
    const wd = new Date(`${giorno}T12:00:00Z`).getUTCDay();
    txt += `${GIORNI[wd]} ${d}/${m}/${y}\n`;
    for (const sala of Object.keys(res[giorno]).sort()) {
      txt += `   ${sala}: ${res[giorno][sala].join(", ")}\n`;
    }
  }
  return txt;
}

const HTML = { "Content-Type": "text/html; charset=utf-8" };

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const route = url.pathname.replace(/\/+$/, "") || "/";
    if (!["/", "/text", "/json"].includes(route)) {
      return new Response(
        renderErrore({
          titolo: "Pagina non trovata",
          messaggio: "L'indirizzo non esiste. Torna al calendario per vedere gli orari liberi.",
          azione: "Vai al calendario",
        }),
        { status: 404, headers: HTML },
      );
    }

    const n = Math.min(
      Math.max(parseInt(url.searchParams.get("giorni") ?? MAX_GIORNI, 10) || MAX_GIORNI, 1),
      MAX_GIORNI,
    );

    try {
      const oggi = oggiVenezia();
      const fine = aggiungiGiorni(oggi, n);
      const res = raggruppa(await fetchDisponibilita(oggi, fine));
      const cache = { "Cache-Control": "public, max-age=60" };
      if (route === "/json") return Response.json(res, { headers: cache });
      if (route === "/text") {
        return new Response(formatta(res), {
          headers: { ...cache, "Content-Type": "text/plain; charset=utf-8" },
        });
      }
      return new Response(renderCalendario({ res, oggi, fine, giorni: n }), {
        headers: { ...cache, ...HTML },
      });
    } catch (e) {
      console.error(e);
      return new Response(
        renderErrore({
          titolo: "Orari non disponibili",
          messaggio: "Il sito del Comune non ha risposto. Riprova tra qualche minuto.",
        }),
        { status: 502, headers: HTML },
      );
    }
  },
};
