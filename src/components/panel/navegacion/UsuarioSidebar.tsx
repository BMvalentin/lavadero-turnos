"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Home, LogOut, User } from "lucide-react";
import { handleSignOut } from "@/actions/auth-actions";
import useSugerenciaLateral from "@/components/panel/navegacion/useSugerenciaLateral";

interface UsuarioSidebarProps {
  colapsado: boolean;
  alCerrar: () => void;
}

const claseOpcion =
  "group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-[background-color,color,transform] duration-200 ease-out motion-reduce:transition-none hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]";

export default function UsuarioSidebar({ colapsado, alCerrar }: UsuarioSidebarProps) {
  const { data: sesion } = useSession();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const nombre = sesion?.user?.name || "Usuario";
  const identificadorDesplegable = "opciones-usuario-sidebar";
  const { mostrar, ocultar, sugerencia } = useSugerenciaLateral(botonRef, nombre, colapsado);

  const cerrarMenus = () => {
    setAbierto(false);
    alCerrar();
  };

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (evento: MouseEvent) => {
      if (!contenedorRef.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", alPresionar);
    document.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.removeEventListener("mousedown", alPresionar);
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [abierto]);

  return (
    <div ref={contenedorRef} className="relative shrink-0 border-t border-[var(--admin-border)] p-2.5">
      <div
        id={identificadorDesplegable}
        aria-hidden={!abierto}
        inert={!abierto}
        className={`absolute bottom-full z-20 mb-2 origin-bottom rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1 shadow-xl transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${abierto ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"} ${colapsado ? "left-2 right-2 md:bottom-0 md:left-full md:right-auto md:mb-0 md:ml-2 md:w-56 md:origin-left" : "left-2 right-2"}`}
      >
        <Link href="/" onClick={cerrarMenus} className={`${claseOpcion} text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-texto-primario)]`}>
          <Home className="h-4 w-4" /> Ir al sitio
        </Link>
        <Link href="/dashboard" onClick={cerrarMenus} className={`${claseOpcion} text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-texto-primario)]`}>
          <User className="h-4 w-4" /> Mi perfil
        </Link>
        <form action={handleSignOut}>
          <button type="submit" className={`${claseOpcion} cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-600`}>
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </form>
      </div>
      <button
        ref={botonRef}
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        onMouseEnter={mostrar}
        onMouseLeave={ocultar}
        onFocus={mostrar}
        onBlur={ocultar}
        aria-label={`Opciones de ${nombre}`}
        aria-expanded={abierto}
        aria-controls={identificadorDesplegable}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-[background-color,transform] duration-200 ease-out motion-reduce:transition-none hover:-translate-y-px hover:bg-[var(--admin-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] ${colapsado ? "md:justify-center md:px-0 md:hover:scale-105" : ""}`}
      >
        <Image
          src={sesion?.user?.image || "/images/avatar-default.svg"}
          alt="Avatar del usuario"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
        <span className={`min-w-0 flex-1 text-left ${colapsado ? "md:hidden" : ""}`}>
          <span className="block truncate text-sm font-medium text-[var(--admin-texto-primario)]">{nombre}</span>
          <span className="block text-xs text-[var(--admin-texto-muted)]">Administrador</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--admin-texto-muted)] transition-transform duration-200 ease-out motion-reduce:transition-none ${abierto ? "rotate-180" : ""} ${colapsado ? "md:hidden" : ""}`} />
      </button>
      {sugerencia}
    </div>
  );
}
