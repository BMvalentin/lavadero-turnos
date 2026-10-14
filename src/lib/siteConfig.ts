// Textos editables de la web pública. Se guardan en la tabla `configuracion`
// (clave/valor) y, si una clave no existe todavía, se usa el valor por defecto.

export const SITE_TEXT_DEFAULTS = {
  NOMBRE_EMPRESA: "Chapa Detail",
  HERO_TITULO: "Tu vehículo merece",
  HERO_TITULO_DESTACADO: "BRILLAR",
  HERO_DESCRIPCION:
    "Reservá tu turno en segundos. Lavado profesional con atención al detalle y productos de primera calidad.",
  NOSOTROS_PARRAFO_1:
    "Somos un servicio de lavado de vehículos comprometido con la excelencia. Nuestro objetivo es brindarte una experiencia simple, rápida y de calidad superior para que tu vehículo luzca impecable.",
  NOSOTROS_PARRAFO_2:
    "Creemos que reservar un turno debe ser tan fácil como unos pocos clics. Por eso diseñamos un sistema de reservas ágil y sin complicaciones.",
  DIRECCION: "Av. Montreal 1118, Santa Clara del Mar",
  TELEFONO: "+54 2234 39-8429",
  // Opcional: enlace de Google Maps (o coordenadas) con la ubicación exacta del local.
  MAPA_URL: "",
  FOOTER_DESCRIPCION:
    "Lavadero en Santa Clara del Mar. Cuidamos tu vehículo con productos de primera calidad y un sistema de turnos simple y rápido.",
};

// Banners incluidos con la web. El admin puede elegir uno o subir el suyo.
export const BANNERS_PREDEFINIDOS = [
  { url: "/images/banners/lavado.jpg", nombre: "Lavado" },
  { url: "/images/banners/secado.jpg", nombre: "Secado" },
  { url: "/images/banners/interior.jpg", nombre: "Interior" },
  { url: "/images/banners/brillo.jpg", nombre: "Brillo" },
];

export const LOGO_PREDETERMINADO = "/images/logopng.png";

// Imágenes: se guarda la URL y, si se subió a Cloudinary, su public_id
// (clave + "_PUBLIC_ID") para poder borrarla al reemplazarla.
export const SITE_IMAGE_DEFAULTS = {
  LOGO_URL: LOGO_PREDETERMINADO,
  BANNER_URL: BANNERS_PREDEFINIDOS[0].url,
};

// Apariencia: color de la marca en hexadecimal (#rrggbb).
export const COLOR_PREDETERMINADO = "#7ebace";

export const SITE_STYLE_DEFAULTS = {
  COLOR_PRINCIPAL: COLOR_PREDETERMINADO,
};

// Datos que no se editan directamente: se calculan al guardar otros campos.
// MAPA_COORDENADAS ("lat,lng") se obtiene de MAPA_URL.
export const SITE_DERIVED_DEFAULTS = {
  MAPA_COORDENADAS: "",
};

export const SITE_CONFIG_DEFAULTS = {
  ...SITE_TEXT_DEFAULTS,
  ...SITE_STYLE_DEFAULTS,
  ...SITE_IMAGE_DEFAULTS,
  ...SITE_DERIVED_DEFAULTS,
};

// Textos que se pueden dejar vacíos.
export const SITE_TEXT_OPCIONALES: SiteTextKey[] = ["MAPA_URL"];

export type SiteTextKey = keyof typeof SITE_TEXT_DEFAULTS;
export type SiteStyleKey = keyof typeof SITE_STYLE_DEFAULTS;
export type SiteImageKey = keyof typeof SITE_IMAGE_DEFAULTS;
export type SiteDerivedKey = keyof typeof SITE_DERIVED_DEFAULTS;
export type SiteConfigKey = SiteTextKey | SiteStyleKey | SiteImageKey | SiteDerivedKey;
export type SiteConfig = Record<SiteConfigKey, string>;

// Largo máximo de cada texto editable desde Configuración.
export const SITE_TEXTO_MAX = 2000;

// Claves que se editan desde formularios (textos y apariencia).

export const SITE_FORM_KEYS = [
  ...Object.keys(SITE_TEXT_DEFAULTS),
  ...Object.keys(SITE_STYLE_DEFAULTS),
] as (SiteTextKey | SiteStyleKey)[];
export const SITE_CONFIG_KEYS = Object.keys(SITE_CONFIG_DEFAULTS) as SiteConfigKey[];

// Separa el nombre para resaltar la última palabra (ej: "Chapa" + "Detail").
export function splitNombreEmpresa(nombre: string): [string, string] {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length < 2) return ["", nombre.trim()];
  const ultima = partes.pop() as string;
  return [partes.join(" "), ultima];
}

// Convierte el teléfono de contacto al formato que usa WhatsApp (wa.me):
// sólo dígitos, con código de país. Para celulares de Argentina agrega el 9
// después del 54 si falta (ej: "+54 223 439-8429" -> "5492234398429").
export function numeroWhatsApp(telefono: string): string {
  const digitos = telefono.replace(/\D/g, "");
  if (digitos.startsWith("54") && !digitos.startsWith("549")) return `549${digitos.slice(2)}`;
  return digitos;
}

// ---------- Mapa ----------

const COORD = String.raw`(-?\d{1,3}(?:\.\d+)?)`;

// Busca coordenadas en un enlace de Google Maps o en un texto "lat, lng".
// Devuelve "lat,lng" o null si no encuentra.
export function extraerCoordenadas(texto: string): string | null {
  let t = texto.trim();
  try {
    t = decodeURIComponent(t);
  } catch {}
  const patrones = [
    new RegExp(String.raw`^${COORD}\s*,\s*${COORD}$`), // "-37.83, -57.50"
    new RegExp(`!3d${COORD}!4d${COORD}`), // pin del lugar en /maps/place/...
    new RegExp(String.raw`[?&](?:q|query|ll|destination)=${COORD},\s*${COORD}`),
    new RegExp(`@${COORD},${COORD}`), // centro del mapa
  ];
  for (const patron of patrones) {
    const m = t.match(patron);
    if (!m) continue;
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return `${lat},${lng}`;
  }
  return null;
}

// Hosts de Google Maps aceptados en el enlace del mapa.
export function esEnlaceGoogleMaps(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return (
    host === "maps.app.goo.gl" ||
    (host === "goo.gl" && url.pathname.startsWith("/maps")) ||
    /^maps\.google\.[a-z.]+$/.test(host) ||
    (/^(www\.)?google\.[a-z.]+$/.test(host) && url.pathname.startsWith("/maps"))
  );
}

// Embed de Google Maps (no requiere API key). Usa las coordenadas si hay,
// para mostrar el punto exacto; si no, busca por la dirección.
export function mapaEmbedUrl(direccion: string, coordenadas?: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(coordenadas || direccion)}&output=embed`;
}

// Enlace para abrir la ubicación en Google Maps ("Cómo llegar").
export function mapaLinkUrl(config: Pick<SiteConfig, "DIRECCION" | "MAPA_URL" | "MAPA_COORDENADAS">): string {
  if (/^https?:\/\//i.test(config.MAPA_URL)) return config.MAPA_URL;
  const destino = config.MAPA_COORDENADAS || config.DIRECCION;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destino)}`;
}

// Datos del desarrollador que aparecen en el footer ("Creado por").
// No son editables desde el panel de administración.
export const DESARROLLADOR = {
  nombre: "LOGABYTE",
  url: "https://logabyte.com.ar/",
};

export function esColorHex(valor: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(valor);
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

// Declaraciones CSS de las variables de marca a partir del color principal.
export function variablesTemaColor(hex: string): string | null {
  if (!esColorHex(hex)) return null;
  const [h, s, l] = hexToHsl(hex);
  const base = `${h} ${s}% ${l}%`;
  const claro = `${h} ${s}% ${Math.min(l + 15, 92)}%`;
  const oscuro = `${h} ${s}% ${Math.max(l - 20, 18)}%`;
  // Texto sobre el color: oscuro si el color es claro, blanco si es oscuro.
  const texto = l > 55 ? `${h} 30% 15%` : "0 0% 100%";
  return `--primary:${base};--primary-foreground:${texto};--accent:${base};--ring:${base};--celeste:${base};--celeste-light:${claro};--celeste-dark:${oscuro};--gradient-primary:linear-gradient(135deg,hsl(${base}),hsl(${claro}));`;
}

// CSS para el layout. Devuelve null con el color predeterminado
// (se usan los valores de globals.css).
export function temaColorCss(hex: string): string | null {
  if (hex.toLowerCase() === COLOR_PREDETERMINADO) return null;
  const variables = variablesTemaColor(hex);
  return variables ? `:root{${variables}}` : null;
}
