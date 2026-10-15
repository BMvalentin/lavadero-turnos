"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import AdminSidebar from "@/components/panel/navegacion/AdminSidebar";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

const CLAVE_ESTADO = "admin-sidebar-colapsado";

function obtenerColapsadoGuardado() {
  try {
    return window.localStorage.getItem(CLAVE_ESTADO) === "1";
  } catch {
    return false;
  }
}

function suscribirseColapsado(alEscuchar: () => void) {
  window.addEventListener("storage", alEscuchar);
  return () => window.removeEventListener("storage", alEscuchar);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { NOMBRE_EMPRESA, LOGO_URL } = useSiteConfig();
  const colapsadoGuardado = useSyncExternalStore(suscribirseColapsado, obtenerColapsadoGuardado, () => false);
  const [colapsadoLocal, setColapsadoLocal] = useState<boolean | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const colapsado = colapsadoLocal ?? colapsadoGuardado;

  const alternarColapsado = () => {
    const siguiente = !colapsado;
    try {
      window.localStorage.setItem(CLAVE_ESTADO, siguiente ? "1" : "0");
    } catch {}
    setColapsadoLocal(siguiente);
  };

  useEffect(() => {
    if (!menuAbierto) return;
    const alPresionarEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setMenuAbierto(false);
    };
    document.addEventListener("keydown", alPresionarEscape);
    return () => document.removeEventListener("keydown", alPresionarEscape);
  }, [menuAbierto]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--admin-background)] text-[var(--admin-texto-primario)]">
      <AdminSidebar
        colapsado={colapsado}
        alAlternar={alternarColapsado}
        abierto={menuAbierto}
        alCerrar={() => setMenuAbierto(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        {/* Encabezado solo en celular: abre el sidebar como cajón */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú de navegación"
            aria-expanded={menuAbierto}
            className="rounded-md p-2 text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-hover)] hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link href="/" aria-label={`Ir al sitio de ${NOMBRE_EMPRESA}`} className="flex min-w-0 items-center gap-2.5">
            <Image src={LOGO_URL} alt={`Logo de ${NOMBRE_EMPRESA}`} width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
            <span className="truncate text-sm font-semibold text-[var(--admin-texto-primario)]">{NOMBRE_EMPRESA}</span>
          </Link>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
