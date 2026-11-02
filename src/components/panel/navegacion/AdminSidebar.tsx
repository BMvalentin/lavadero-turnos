"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { GRUPOS_NAVEGACION } from "@/components/panel/navegacion/items-navegacion";
import DesplegableNavegacion from "@/components/panel/navegacion/DesplegableNavegacion";
import ItemNavegacionEnlace from "@/components/panel/navegacion/ItemNavegacionEnlace";
import UsuarioSidebar from "@/components/panel/navegacion/UsuarioSidebar";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

interface AdminSidebarProps {
  colapsado: boolean;
  alAlternar: () => void;
  abierto: boolean;
  alCerrar: () => void;
}

export default function AdminSidebar({ colapsado, alAlternar, abierto, alCerrar }: AdminSidebarProps) {
  const { NOMBRE_EMPRESA, LOGO_URL } = useSiteConfig();

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú de navegación"
        tabIndex={abierto ? 0 : -1}
        onClick={alCerrar}
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-200 ease-out motion-reduce:transition-none md:hidden ${abierto ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        aria-label="Navegación de administración"
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[240px] shrink-0 flex-col border-r border-[var(--admin-border)] bg-[var(--admin-surface)] transition-[transform,width] duration-[240ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none md:sticky md:translate-x-0 ${abierto ? "translate-x-0" : "-translate-x-full"} ${colapsado ? "md:w-[68px]" : "md:w-[240px]"}`}
      >
        <div className={`group/header relative flex h-16 shrink-0 items-center border-b border-[var(--admin-border)] px-4 ${colapsado ? "md:justify-center md:px-0" : "gap-2.5"}`}>
          <Link
            href="/"
            onClick={alCerrar}
            aria-label={`Ir al sitio de ${NOMBRE_EMPRESA}`}
            className={`flex min-w-0 flex-1 items-center gap-2.5 ${colapsado ? "md:w-full md:justify-center md:gap-0" : ""}`}
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
              <span className={colapsado ? "md:transition-opacity md:duration-200 md:ease-out md:motion-reduce:transition-none md:group-hover/header:opacity-0 md:group-focus-within/header:opacity-0" : ""}>
                <Image src={LOGO_URL} alt={`Logo de ${NOMBRE_EMPRESA}`} width={36} height={36} className="h-9 w-9 object-contain" />
              </span>
            </span>
            <span className={`min-w-0 truncate text-sm font-semibold text-[var(--admin-texto-primario)] ${colapsado ? "md:hidden" : ""}`}>
              {NOMBRE_EMPRESA}
            </span>
          </Link>
          {colapsado && (
            <button
              type="button"
              onClick={alAlternar}
              aria-label="Expandir sidebar"
              aria-expanded="false"
              className="absolute left-1/2 top-1/2 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[var(--admin-texto-secundario)] opacity-0 transition-[opacity,color,background-color,transform] duration-200 ease-out motion-reduce:transition-none hover:scale-105 hover:bg-[var(--admin-hover)] hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] md:flex md:group-hover/header:opacity-100 md:group-focus-within/header:opacity-100"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={alAlternar}
            aria-label="Colapsar sidebar"
            aria-expanded="true"
            className={`ml-auto cursor-pointer rounded-md p-2 text-[var(--admin-texto-muted)] transition-[color,background-color,transform] duration-200 ease-out motion-reduce:transition-none hover:scale-105 hover:bg-[var(--admin-hover)] hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] ${colapsado ? "hidden" : "hidden md:block"}`}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>
        <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GRUPOS_NAVEGACION.map((grupo) => (
            <div key={grupo.titulo} className="space-y-0.5">
              <p className={`px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--page-primary-tinta)] ${colapsado ? "md:hidden" : ""}`}>
                {grupo.titulo}
              </p>
              {grupo.items.map((entrada) =>
                "href" in entrada ? (
                  <ItemNavegacionEnlace key={entrada.href} item={entrada} colapsado={colapsado} alCerrar={alCerrar} />
                ) : (
                  <DesplegableNavegacion
                    key={entrada.titulo}
                    grupo={entrada}
                    colapsado={colapsado}
                    alCerrar={alCerrar}
                    alExpandirSidebar={alAlternar}
                  />
                ),
              )}
            </div>
          ))}
        </nav>
        <UsuarioSidebar colapsado={colapsado} alCerrar={alCerrar} />
      </aside>
    </>
  );
}
