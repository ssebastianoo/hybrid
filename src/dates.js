/** Data odierna a Venezia come "YYYY-MM-DD". */
export function oggiVenezia() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(new Date());
}

/** Somma giorni a una data "YYYY-MM-DD" (calcolo in UTC, nessun problema di DST). */
export function aggiungiGiorni(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Indice del giorno della settimana con lunedì = 0. */
export function indiceLunedi(iso) {
  return (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;
}
