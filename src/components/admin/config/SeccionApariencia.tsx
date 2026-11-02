import CampoColor from "@/components/admin/config/CampoColor";
import SelectorPlantillasColores from "@/components/admin/config/SelectorPlantillasColores";
import VistaPreviaPersonalizada from "@/components/admin/config/VistaPreviaPersonalizada";
import type { PlantillaColor } from "@/lib/plantillasColores";
import { esColorClaro, esColorHex, type ColoresTema } from "@/lib/tema";

interface SeccionAparienciaProps {
  colores: ColoresTema;
  nombreEmpresa: string;
  aplicarPlantilla: (plantilla: PlantillaColor) => void;
  cambiarColor: (campo: keyof ColoresTema, valor: string) => void;
}

const ERROR_CLARO = "Tiene que ser un color claro: el texto de la web es oscuro.";

function errorClaro(valor: string) {
  return esColorHex(valor) && !esColorClaro(valor) ? ERROR_CLARO : undefined;
}

export default function SeccionApariencia({ colores, nombreEmpresa, aplicarPlantilla, cambiarColor }: SeccionAparienciaProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-[var(--admin-border)] bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Plantillas de colores</h3>
          <p className="text-xs text-gray-500">Elegí una combinación para comenzar. Podés personalizar los colores después.</p>
        </div>
        <SelectorPlantillasColores colores={colores} aplicarPlantilla={aplicarPlantilla} nombreEmpresa={nombreEmpresa} />
      </div>

      <div className="space-y-4 rounded-xl border border-[var(--admin-border)] bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Colores personalizados</h3>
          <p className="text-xs text-gray-500">Solo necesitás tres colores: el resto se deriva automáticamente.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CampoColor
            etiqueta="Color primario"
            ayuda="Botones, títulos destacados, íconos y detalles."
            valor={colores.primario}
            alCambiar={(valor) => cambiarColor("primario", valor)}
          />
          <CampoColor
            etiqueta="Color secundario"
            ayuda="Franjas de las secciones del inicio."
            valor={colores.secundario}
            error={errorClaro(colores.secundario)}
            alCambiar={(valor) => cambiarColor("secundario", valor)}
          />
          <CampoColor
            etiqueta="Color de fondo"
            ayuda="Fondo de la página."
            valor={colores.fondo}
            error={errorClaro(colores.fondo)}
            alCambiar={(valor) => cambiarColor("fondo", valor)}
          />
        </div>
        <VistaPreviaPersonalizada colores={colores} nombreEmpresa={nombreEmpresa} />
      </div>
    </div>
  );
}
