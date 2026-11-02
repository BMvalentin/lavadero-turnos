import type { ReactNode } from "react";

interface EncabezadoPaginaProps {
  titulo: string;
  descripcion?: string;
  /** Acciones a la derecha del título (botones). */
  acciones?: ReactNode;
}

export default function EncabezadoPagina({ titulo, descripcion, acciones }: EncabezadoPaginaProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">{descripcion}</p>}
      </div>
      {acciones}
    </div>
  );
}
