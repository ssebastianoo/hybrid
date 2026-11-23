# hybrid

Cloudflare Worker che mostra gli orari liberi delle sale prova Hybrid Music
(Mestre, Comune di Venezia) in un calendario, interrogando direttamente l'API del sito
<https://dime.comune.venezia.it/servizio/agenda-sale-musica>.

Nessun login o captcha per leggere le disponibilità. La prenotazione si fa a mano sul sito
del Comune: ogni slot del calendario porta alla sua pagina.

## Uso

```
npm install
npm run dev      # http://localhost:8787
npm run deploy   # richiede `npx wrangler login`
```

## Route

- `GET /` → calendario (da oggi ai prossimi 30 giorni, con filtro per sala)
- `GET /text` → testo leggibile
- `GET /json` → JSON `{giorno: {sala: ["15:00-17:00", ...]}}`
- `?giorni=N` → numero di giorni da mostrare (1-30), valido su tutte le route

## Struttura

- `src/index.js` → routing, chiamata all'API e raggruppamento degli slot
- `src/view.js` → HTML e CSS del calendario, pagine 404 ed errore
- `src/dates.js` → utilità sulle date (fuso `Europe/Rome`)

## API del Comune

`POST https://gwapi.sad.ve.it/agenda/1.0.0/api/agenda/disponibilitaAppuntamento`

```json
{"inizio": "2026-11-23", "fine": "2026-12-23", "idSottocategoria": 40501, "origin": "FE"}
```

- `origin: "FE"` è obbligatorio (senza risposta 400).
- Sale: `idSede` 120 = sala A, 121 = sala B. Slot da 2 ore, validi se `slotResidui > 0`.
- L'API risponde anche con intervalli di 30 giorni, anche se il sito permette di prenotare
  con al massimo 14 giorni di anticipo.
- L'invio della prenotazione sul sito è protetto da reCAPTCHA v3, per questo non è automatizzato.
