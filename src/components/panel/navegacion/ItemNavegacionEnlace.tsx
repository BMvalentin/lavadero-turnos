"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import type { ItemNavegacion } from "@/components/panel/navegacion/items-navegacion";
import useSugerenciaLateral from "@/components/panel/navegacion/useSugerenciaLateral";

interface ItemNavegacionEnlaceProps {
  item: ItemNavegacion;
  colapsado: boolean;
  alCerrar: () => void;
}

export default function ItemNavegacionEnlace({ item, colapsado, alCerrar }: ItemNavegacionEnlaceProps) {
  const pathname = usePathname();
  const Icono = item.icono;
  const esActivo = pathname === item.href;
  const refEnlace = useRef<HTMLAnchorElement>(null);
  const { mostrar, ocultar, sugerencia } = useSugerenciaLateral(refEnlace, item.titulo, colapsado);

  return (
    <>
      <Link
        ref={refEnlace}
        href={item.href}
        onClick={alCerrar}
        aria-label={colapsado ? item.titulo : undefined}
        aria-current={esActivo ? "page" : undefined}
        onMouseEnter={mostrar}
        onMouseLeave={ocultar}
        onFocus={mostrar}
        onBlur={ocultar}
        className={`
          group flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color,transform] duration-200 ease-out motion-reduce:transition-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]
          ${colapsado ? "md:justify-center md:px-0 md:hover:scale-105" : "hover:-translate-y-px"}
          ${esActivo
            ? "bg-[var(--page-primary-15)] text-[var(--page-primary-tinta)]"
            : "text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-texto-primario)]"}
        `}
      >
        <Icono className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none group-hover:scale-110" />
        <span className={colapsado ? "md:hidden" : ""}>{item.titulo}</span>
      </Link>
      {sugerencia}
    </>
  );
}
