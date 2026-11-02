import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Car,
  Clock,
  Image as ImageIcon,
  Link2,
  MapPin,
  Palette,
  Settings,
  Sparkles,
} from "lucide-react";

export interface ItemNavegacion {
  titulo: string;
  href: string;
  icono: LucideIcon;
}

export interface GrupoDesplegable {
  titulo: string;
  icono: LucideIcon;
  items: ItemNavegacion[];
}

export type EntradaNavegacion = ItemNavegacion | GrupoDesplegable;

export interface GrupoNavegacion {
  titulo: string;
  items: EntradaNavegacion[];
}

export const GRUPOS_NAVEGACION: GrupoNavegacion[] = [
  {
    titulo: "Operación",
    items: [
      { titulo: "Turnos", href: "/admin", icono: Calendar },
      { titulo: "Crear turno", href: "/admin/turno", icono: CalendarPlus },
      { titulo: "Días laborales", href: "/admin/diaLaboral", icono: Clock },
    ],
  },
  {
    titulo: "Catálogo",
    items: [
      { titulo: "Servicios", href: "/admin/servicio", icono: Sparkles },
      { titulo: "Vehículos", href: "/admin/vehiculo", icono: Car },
      { titulo: "Servicios por vehículo", href: "/admin/vehiculoXServicio", icono: Link2 },
    ],
  },
  {
    titulo: "Configuración",
    items: [
      {
        titulo: "Configuración",
        icono: Settings,
        items: [
          { titulo: "Información general", href: "/admin/configuracion/general", icono: Building2 },
          { titulo: "Ubicación y contacto", href: "/admin/configuracion/ubicacion", icono: MapPin },
          { titulo: "Apariencia", href: "/admin/configuracion/apariencia", icono: Palette },
          { titulo: "Imágenes", href: "/admin/configuracion/imagenes", icono: ImageIcon },
          { titulo: "Feriados y excepciones", href: "/admin/configuracion/feriados", icono: CalendarDays },
        ],
      },
    ],
  },
];
