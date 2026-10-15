"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import ItemNavegacionEnlace from "@/components/panel/navegacion/ItemNavegacionEnlace";
import type { GrupoDesplegable } from "@/components/panel/navegacion/items-navegacion";
import useSugerenciaLateral from "@/components/panel/navegacion/useSugerenciaLateral";

interface DesplegableNavegacionProps {
  grupo: GrupoDesplegable;
  colapsado: boolean;
  alCerrar: () => void;
  alExpandirSidebar: () => void;
}

function suscribirseConsultaEscritorio(alCambiar: () => void) {
  const consulta = window.matchMedia("(min-width: 768px)");
  consulta.addEventListener("change", alCambiar);
  return () => consulta.removeEventListener("change", alCambiar);
}

function obtenerConsultaEscritorio() {
  return window.matchMedia("(min-width: 768px)").matches;
}

export default function DesplegableNavegacion({
  grupo,
  colapsado,
  alCerrar,
  alExpandirSidebar,
}: DesplegableNavegacionProps) {
  const pathname = usePathname();
  const Icono = grupo.icono;
  const [estadoLocal, setEstadoLocal] = useState<boolean | null>(null);
  const estaEnEscritorio = useSyncExternalStore(
    suscribirseConsultaEscritorio,
    obtenerConsultaEscritorio,
    () => true,
  );
  const contieneHijoActivo = grupo.items.some((item) => pathname === item.href);
  const expandido = estadoLocal ?? contieneHijoActivo;
  const muestraContenido = expandido && !(colapsado && estaEnEscritorio);
  const identificadorContenido = `grupo-navegacion-${grupo.titulo.toLowerCase().replaceAll(" ", "-")}`;
  const refBoton = useRef<HTMLButtonElement>(null);
  const { mostrar, ocultar, sugerencia } = useSugerenciaLateral(refBoton, grupo.titulo, colapsado);

  const alAlternar = () => {
    // Colapsado en escritorio: primero se expande el sidebar para mostrar las opciones.
    if (colapsado && estaEnEscritorio) {
      alExpandirSidebar();
      setEstadoLocal(true);
      return;
    }
    setEstadoLocal((valor) => !(valor ?? contieneHijoActivo));
  };

  return (
    <>
      <button
        ref={refBoton}
        type="button"
        onClick={alAlternar}
        aria-expanded={muestraContenido}
        aria-controls={identificadorContenido}
        aria-label={colapsado ? grupo.titulo : undefined}
        onMouseEnter={mostrar}
        onMouseLeave={ocultar}
        onFocus={mostrar}
        onBlur={ocultar}
        className={`
          flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color,transform] duration-200 ease-out motion-reduce:transition-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]
          ${colapsado ? "md:justify-center md:px-0 md:hover:scale-105" : "hover:-translate-y-px"}
          ${contieneHijoActivo
            ? "bg-[var(--page-primary-15)] text-[var(--page-primary-tinta)]"
            : "text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-texto-primario)]"}
        `}
      >
        <Icono className="h-4 w-4 shrink-0" />
        <span className={colapsado ? "md:hidden" : ""}>{grupo.titulo}</span>
        <span className={colapsado ? "md:hidden" : "ml-auto"}>
          <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--admin-texto-muted)] transition-transform duration-200 ease-out motion-reduce:transition-none ${expandido ? "rotate-180" : ""}`} />
        </span>
      </button>
      {sugerencia}
      <div
        id={identificadorContenido}
        aria-hidden={!muestraContenido}
        inert={!muestraContenido}
        className={`grid transition-[grid-template-rows,opacity,margin] duration-[240ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${muestraContenido ? "mt-1 grid-rows-[1fr] opacity-100" : "pointer-events-none mt-0 grid-rows-[0fr] opacity-0"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-0.5 pl-3">
            {grupo.items.map((item) => (
              <ItemNavegacionEnlace key={item.href} item={item} colapsado={colapsado} alCerrar={alCerrar} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
