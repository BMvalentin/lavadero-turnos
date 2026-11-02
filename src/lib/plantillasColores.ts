// Plantillas de colores para Configuración > Apariencia.
// Para agregar una plantilla nueva solo hace falta sumar un objeto al array.
// El secundario y el fondo tienen que ser claros (ver esColorClaro).
import { COLORES_TEMA_PREDETERMINADOS, esColorClaro, esColorHex, type ColoresTema } from "@/lib/tema";

export interface PlantillaColor extends ColoresTema {
  id: string;
  nombre: string;
  descripcion: string;
}

export const PLANTILLAS_COLORES: PlantillaColor[] = [
  {
    id: "lavadero",
    nombre: "Lavadero",
    descripcion: "Celeste fresco, la paleta original de la web.",
    ...COLORES_TEMA_PREDETERMINADOS,
  },

  // Colores sugeridos que ya ofrecía el lavadero, con secundario y fondo del mismo tono.
  { id: "azul", nombre: "Azul", descripcion: "Confiable y profesional.", primario: "#2563eb", secundario: "#e5ecfd", fondo: "#f4f7fe" },
  { id: "turquesa", nombre: "Turquesa", descripcion: "Fresca y moderna.", primario: "#0d9488", secundario: "#e2f2f1", fondo: "#f3faf9" },
  { id: "verde", nombre: "Verde", descripcion: "Natural y ecológica.", primario: "#16a34a", secundario: "#e3f4e9", fondo: "#f3faf6" },
  { id: "ambar", nombre: "Ámbar", descripcion: "Cálida y llamativa.", primario: "#d97706", secundario: "#faefe1", fondo: "#fdf8f3" },
  { id: "rojo", nombre: "Rojo", descripcion: "Enérgica y deportiva.", primario: "#dc2626", secundario: "#fbe5e5", fondo: "#fdf4f4" },
  { id: "rosa", nombre: "Rosa", descripcion: "Alegre y diferente.", primario: "#db2777", secundario: "#fbe5ef", fondo: "#fdf4f8" },
  { id: "violeta", nombre: "Violeta", descripcion: "Creativa y sofisticada.", primario: "#7c3aed", secundario: "#efe7fd", fondo: "#f8f5fe" },
  { id: "grafito", nombre: "Grafito", descripcion: "Sobria y elegante.", primario: "#27272a", secundario: "#e5e5e5", fondo: "#f4f4f4" },

  // Plantillas claras de barber-turnos.
  { id: "arena", nombre: "Arena", descripcion: "Neutra, cálida y relajada.", primario: "#a16207", secundario: "#fef3c7", fondo: "#fffbeb" },
  { id: "cream", nombre: "Cream", descripcion: "Suave, luminosa y acogedora.", primario: "#92400e", secundario: "#fef3c7", fondo: "#fffcf5" },
  { id: "sage", nombre: "Sage", descripcion: "Verde suave y equilibrado.", primario: "#4d7c62", secundario: "#ecfdf5", fondo: "#f7faf8" },
  { id: "ice", nombre: "Ice", descripcion: "Clara, fresca y minimalista.", primario: "#0284c7", secundario: "#e0f2fe", fondo: "#f8fcff" },
  { id: "bubblegum", nombre: "Bubblegum", descripcion: "Suave, divertida y juvenil.", primario: "#db2777", secundario: "#fbcfe8", fondo: "#fff7fb" },
  { id: "peach", nombre: "Peach", descripcion: "Cálida, suave y cercana.", primario: "#ea580c", secundario: "#ffedd5", fondo: "#fff8f3" },
];

for (const plantilla of PLANTILLAS_COLORES) {
  if (!esColorHex(plantilla.primario) || !esColorClaro(plantilla.secundario) || !esColorClaro(plantilla.fondo)) {
    throw new Error(`La plantilla "${plantilla.nombre}" define un color inválido.`);
  }
}
