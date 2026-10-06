// Formato de fechas usado en Argentina (dd/mm/yyyy), siempre en hora de Buenos Aires
// para que se vea igual sin importar la zona horaria del servidor o del navegador.

const TIMEZONE = "America/Argentina/Buenos_Aires";

const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  timeZone: TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatoHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** 06/10/2026 */
export function formatFecha(fecha: Date | string): string {
  return formatoFecha.format(new Date(fecha));
}

/** 14:30 */
export function formatHora(fecha: Date | string): string {
  return formatoHora.format(new Date(fecha));
}

/** 06/10/2026 14:30 */
export function formatFechaHora(fecha: Date | string): string {
  return `${formatFecha(fecha)} ${formatHora(fecha)}`;
}

/** Convierte el valor de un input date/datetime-local ("2026-10-06" o "2026-10-06T14:30") a "06/10/2026" o "06/10/2026 14:30". */
export function formatValorInput(valor: string): string {
  const [fecha, hora] = valor.split("T");
  const [anio, mes, dia] = fecha.split("-");
  if (!anio || !mes || !dia) return "";
  return hora ? `${dia}/${mes}/${anio} ${hora.slice(0, 5)}` : `${dia}/${mes}/${anio}`;
}
