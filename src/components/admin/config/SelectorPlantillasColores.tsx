import TarjetaPlantillaColor from "@/components/admin/config/TarjetaPlantillaColor";
import { PLANTILLAS_COLORES, type PlantillaColor } from "@/lib/plantillasColores";
import { mismosColores, type ColoresTema } from "@/lib/tema";

interface SelectorPlantillasColoresProps {
  colores: ColoresTema;
  aplicarPlantilla: (plantilla: PlantillaColor) => void;
  nombreEmpresa: string;
}

export default function SelectorPlantillasColores({ colores, aplicarPlantilla, nombreEmpresa }: SelectorPlantillasColoresProps) {
  return (
    <div role="radiogroup" aria-label="Plantillas de colores">
      <div className="max-h-[420px] overflow-y-auto overscroll-contain rounded-xl border border-[var(--admin-border)] bg-[var(--admin-background)] p-3">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
          {PLANTILLAS_COLORES.map((plantilla) => (
            <TarjetaPlantillaColor
              key={plantilla.id}
              plantilla={plantilla}
              seleccionada={mismosColores(plantilla, colores)}
              alSeleccionar={() => aplicarPlantilla(plantilla)}
              nombreEmpresa={nombreEmpresa}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
