"use client";

import type { RefObject } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Tooltip a la derecha del ítem, solo con el sidebar colapsado en escritorio.
export default function useSugerenciaLateral(
  referencia: RefObject<HTMLElement | null>,
  texto: string,
  activa: boolean,
) {
  const [posicion, setPosicion] = useState<{ arriba: number; izquierda: number } | null>(null);

  useEffect(() => {
    const consulta = window.matchMedia("(min-width: 768px)");
    const ocultarEnMovil = () => {
      if (!consulta.matches) setPosicion(null);
    };
    consulta.addEventListener("change", ocultarEnMovil);
    return () => consulta.removeEventListener("change", ocultarEnMovil);
  }, []);

  const mostrar = () => {
    if (!activa || !window.matchMedia("(min-width: 768px)").matches || !referencia.current) return;
    const rectangulo = referencia.current.getBoundingClientRect();
    setPosicion({
      arriba: rectangulo.top + rectangulo.height / 2,
      izquierda: rectangulo.right + 10,
    });
  };

  const ocultar = () => setPosicion(null);
  const sugerencia = activa && posicion
    ? createPortal(
        <span
          role="tooltip"
          className="pointer-events-none fixed z-[70] -translate-y-1/2 whitespace-nowrap rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--admin-texto-primario)] shadow-lg"
          style={{ top: posicion.arriba, left: posicion.izquierda }}
        >
          {texto}
        </span>,
        document.body,
      )
    : null;

  return { mostrar, ocultar, sugerencia };
}
