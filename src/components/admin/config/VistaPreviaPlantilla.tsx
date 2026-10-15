import { variablesTema, type ColoresTema } from "@/lib/tema";
import { splitNombreEmpresa } from "@/lib/siteConfig";

const CHIPS = ["Servicios", "Nosotros", "Ubicación"];

interface VistaPreviaPlantillaProps {
  colores: ColoresTema;
  nombreEmpresa: string;
}

// Miniatura de la web con los colores dados. Las variables del tema se aplican
// sólo dentro de este bloque, así las clases (bg-celeste, bg-fondo...) las toman.
export default function VistaPreviaPlantilla({ colores, nombreEmpresa }: VistaPreviaPlantillaProps) {
  const [inicio, fin] = splitNombreEmpresa(nombreEmpresa);

  return (
    <div
      className="overflow-hidden rounded-lg border border-celeste/30 bg-fondo"
      style={variablesTema(colores) as React.CSSProperties}
    >
      <div className="flex items-center justify-between bg-white px-3 py-2 shadow-sm">
        <span className="truncate text-[10px] font-semibold text-gray-700">
          {inicio}
          {inicio && " "}
          <span className="text-primary">{fin}</span>
        </span>
        <span className="ml-2 shrink-0 rounded-full bg-gradient-to-r from-celeste to-celeste-light px-2 py-0.5 text-[9px] font-semibold text-primary-foreground">
          Turnos
        </span>
      </div>

      <div className="space-y-2 px-3 py-3">
        <div className="h-1.5 w-3/4 rounded-full bg-gray-400/70" />
        <div className="h-1.5 w-1/2 rounded-full bg-gray-300" />
        <div className="pt-1">
          <span className="rounded-md bg-gradient-to-r from-celeste to-celeste-light px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
            Reservar
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 bg-secundario px-3 py-3">
        {CHIPS.map((chip) => (
          <span
            key={chip}
            className="flex items-center gap-1 rounded-md border border-celeste/20 bg-white px-2 py-1 text-[9px] text-gray-600"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-celeste-dark" />
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
