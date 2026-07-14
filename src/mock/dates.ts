/**
 * Mock seed data is authored as a story anchored on "today" — the demo
 * assumes today's OPD queue, today's collections, etc. Hardcoding calendar
 * dates (e.g. '2026-07-13') breaks that the moment the real clock moves
 * past the day the data was written, since every "today" filter in the app
 * (OPD Queue, Nurse's Station, My Console, Dashboard KPIs) compares against
 * the actual current date. relativeDate keeps the whole seed dataset
 * anchored to whenever the app is actually loaded.
 */
export function relativeDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}
