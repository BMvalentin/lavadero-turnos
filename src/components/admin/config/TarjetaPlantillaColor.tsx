import { Check } from "lucide-react";
import VistaPreviaPlantilla from "@/components/admin/config/VistaPreviaPlantilla";
import type { PlantillaColor } from "@/lib/plantillasColores";

interface TarjetaPlantillaColorProps {
  plantilla: PlantillaColor;
  seleccionada: boolean;
  alSeleccionar: () => void;
  nombreEmpresa: string;
}

export default function TarjetaPlantillaColor({
  plantilla,
  seleccionada,
  alSeleccionar,
  nombreEmpresa,
}: TarjetaPlantillaColorProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={seleccionada}
      onClick={alSeleccionar}
      className={`group relative flex cursor-pointer flex-col gap-3 rounded-xl border p-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] ${
        seleccionada
          ? "border-celeste bg-[var(--page-primary-15)] ring-1 ring-celeste/40"
          : "border-[var(--admin-border)] bg-white hover:-translate-y-0.5 hover:border-[var(--admin-border-fuerte)] hover:shadow-lg"
      }`}
    >
      {seleccionada && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-celeste">
          <Check className="h-3 w-3 text-primary-foreground" />
          <span className="sr-only">Seleccionada</span>
        </span>
      )}
      <p className="text-sm font-semibold text-[var(--admin-texto-primario)]">{plantilla.nombre}</p>
      <VistaPreviaPlantilla colores={plantilla} nombreEmpresa={nombreEmpresa} />
      <p className="text-xs leading-snug text-[var(--admin-texto-muted)]">{plantilla.descripcion}</p>
    </button>
  );
}
