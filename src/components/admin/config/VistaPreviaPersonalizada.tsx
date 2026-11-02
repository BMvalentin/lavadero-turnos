import { Eye } from "lucide-react";
import VistaPreviaPlantilla from "@/components/admin/config/VistaPreviaPlantilla";
import { PLANTILLAS_COLORES } from "@/lib/plantillasColores";
import { esColorHex, mismosColores, type ColoresTema } from "@/lib/tema";

interface VistaPreviaPersonalizadaProps {
  colores: ColoresTema;
  nombreEmpresa: string;
}

// Sólo se muestra cuando la combinación no coincide con ninguna plantilla
// (las plantillas ya tienen su propia vista previa).
export default function VistaPreviaPersonalizada({ colores, nombreEmpresa }: VistaPreviaPersonalizadaProps) {
  if (![colores.primario, colores.secundario, colores.fondo].every(esColorHex)) return null;
  if (PLANTILLAS_COLORES.some((plantilla) => mismosColores(plantilla, colores))) return null;

  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-white p-4">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-[var(--admin-texto-muted)]" />
        <h4 className="text-sm font-semibold text-[var(--admin-texto-primario)]">Vista previa</h4>
      </div>
      <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">Así se verá tu combinación personalizada en la web.</p>
      <div className="mt-3 max-w-sm">
        <VistaPreviaPlantilla colores={colores} nombreEmpresa={nombreEmpresa} />
      </div>
    </div>
  );
}
