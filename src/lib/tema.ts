// Tema de colores de la web. Se configuran tres colores (Configuración > Apariencia)
// y de ellos se derivan las variables CSS que usan los componentes:
// - primario: botones, títulos destacados, íconos y detalles (--primary, --celeste...).
// - secundario: franjas de las secciones del inicio (--secundario).
// - fondo: fondo de la página (--background).
// El secundario y el fondo tienen que ser claros: el texto de la web es oscuro.

export type ColoresTema = {
  primario: string;
  secundario: string;
  fondo: string;
};

// Paleta original del lavadero (coincide con los valores de globals.css).
export const COLORES_TEMA_PREDETERMINADOS: ColoresTema = {
  primario: "#7ebace",
  secundario: "#e4f0fa",
  fondo: "#eff6ff",
};

// Luminancia mínima para considerar claro un color de fondo.
const LUMINANCIA_MINIMA_CLARO = 0.6;

export function esColorHex(valor: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(valor);
}

function mismoColor(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function mismosColores(a: ColoresTema, b: ColoresTema): boolean {
  return mismoColor(a.primario, b.primario) && mismoColor(a.secundario, b.secundario) && mismoColor(a.fondo, b.fondo);
}

// Luminancia relativa WCAG (0 = negro, 1 = blanco).
function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const canal = parseInt(hex.slice(i, i + 2), 16) / 255;
    return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function esColorClaro(hex: string): boolean {
  return esColorHex(hex) && luminancia(hex) >= LUMINANCIA_MINIMA_CLARO;
}

// Mezcla lineal de `color` hacia `destino` en `proporcion` (0..1).
export function mezclarColores(color: string, destino: string, proporcion: number): string {
  let resultado = "#";
  for (let i = 1; i < 7; i += 2) {
    const origen = parseInt(color.slice(i, i + 2), 16);
    const final = parseInt(destino.slice(i, i + 2), 16);
    resultado += Math.round(origen + (final - origen) * proporcion).toString(16).padStart(2, "0");
  }
  return resultado;
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

// Las variables de globals.css guardan "h s% l%" (se usan como hsl(var(--x))).
function hsl(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  return `${h} ${s}% ${l}%`;
}

// Valores de globals.css para el primario predeterminado.
const VARIABLES_PRIMARIO_PREDETERMINADO: Record<string, string> = {
  "--primary": "195 45% 65%",
  "--primary-foreground": "210 30% 20%",
  "--accent": "195 50% 55%",
  "--ring": "195 45% 65%",
  "--celeste": "195 45% 65%",
  "--celeste-light": "195 50% 80%",
  "--celeste-dark": "195 50% 45%",
  "--gradient-primary": "linear-gradient(135deg,hsl(195 45% 65%),hsl(195 50% 75%))",
};

function variablesPrimario(hex: string): Record<string, string> {
  if (mismoColor(hex, COLORES_TEMA_PREDETERMINADOS.primario)) return VARIABLES_PRIMARIO_PREDETERMINADO;
  const [h, s, l] = hexToHsl(hex);
  const base = `${h} ${s}% ${l}%`;
  const claro = `${h} ${s}% ${Math.min(l + 15, 92)}%`;
  const oscuro = `${h} ${s}% ${Math.max(l - 20, 18)}%`;
  // Texto sobre el color: oscuro si el color es claro, blanco si es oscuro.
  const texto = l > 55 ? `${h} 30% 15%` : "0 0% 100%";
  return {
    "--primary": base,
    "--primary-foreground": texto,
    "--accent": base,
    "--ring": base,
    "--celeste": base,
    "--celeste-light": claro,
    "--celeste-dark": oscuro,
    "--gradient-primary": `linear-gradient(135deg,hsl(${base}),hsl(${claro}))`,
  };
}

// Variables CSS de un tema completo (sirve también para vistas previas).
export function variablesTema(colores: ColoresTema): Record<string, string> {
  return {
    ...variablesPrimario(colores.primario),
    "--secundario": hsl(colores.secundario),
    "--background": hsl(colores.fondo),
  };
}

// CSS para el layout. Devuelve null con la paleta predeterminada
// (se usan los valores de globals.css) o si algún color es inválido.
export function temaColorCss(colores: ColoresTema): string | null {
  if (mismosColores(colores, COLORES_TEMA_PREDETERMINADOS)) return null;
  if (![colores.primario, colores.secundario, colores.fondo].every(esColorHex)) return null;
  const declaraciones = Object.entries(variablesTema(colores))
    .map(([nombre, valor]) => `${nombre}:${valor};`)
    .join("");
  return `:root{${declaraciones}}`;
}
