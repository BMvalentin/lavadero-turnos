import { esColorHex } from "@/lib/tema";

interface CampoColorProps {
  etiqueta: string;
  ayuda: string;
  valor: string;
  /** Mensaje de error a mostrar (por ejemplo, si el color tiene que ser claro). */
  error?: string;
  alCambiar: (valor: string) => void;
}

export default function CampoColor({ etiqueta, ayuda, valor, error, alCambiar }: CampoColorProps) {
  const valido = esColorHex(valor);
  const mensaje = !valido ? "Usá el formato #rrggbb" : error;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">{etiqueta}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={valido ? valor : "#000000"}
          onChange={(e) => alCambiar(e.target.value)}
          aria-label={`${etiqueta}: selector`}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-[var(--admin-border)] bg-transparent p-0.5"
        />
        <input
          type="text"
          value={valor}
          onChange={(e) => alCambiar(e.target.value.trim().toLowerCase())}
          maxLength={7}
          aria-label={`${etiqueta} en hexadecimal`}
          aria-invalid={Boolean(mensaje)}
          className={`w-full flex-1 rounded-lg border bg-gray-50 px-3 py-2.5 font-mono text-sm uppercase text-[var(--admin-texto-primario)] outline-none transition-colors focus:ring-2 focus:ring-celeste ${
            mensaje ? "border-red-400" : "border-[var(--admin-border)]"
          }`}
        />
      </div>
      <p className={`mt-1 text-xs ${mensaje ? "text-red-500" : "text-[var(--admin-texto-muted)]"}`}>{mensaje ?? ayuda}</p>
    </div>
  );
}
