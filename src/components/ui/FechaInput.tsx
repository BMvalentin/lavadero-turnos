"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatValorInput } from "@/lib/fechas";

type FechaInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange"> & {
  /** "date" (dd/mm/yyyy) o "datetime-local" (dd/mm/yyyy hh:mm). */
  tipo?: "date" | "datetime-local";
  /** Controlado: valor en formato del input nativo ("2026-10-06" o "2026-10-06T14:30"). */
  value?: string;
  defaultValue?: string;
  onChange?: (valor: string) => void;
  placeholder?: string;
};

/**
 * Input de fecha que siempre se muestra como dd/mm/yyyy (formato argentino),
 * sin importar el idioma del navegador. Usa el selector nativo por debajo,
 * así que el valor enviado en el formulario sigue siendo el estándar (yyyy-mm-dd).
 */
export default function FechaInput({
  tipo = "date",
  value,
  defaultValue = "",
  onChange,
  className,
  placeholder,
  disabled,
  ...props
}: FechaInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [interno, setInterno] = useState(defaultValue);
  const valor = value ?? interno;

  // Si el formulario se resetea, volvemos al valor inicial.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form || value !== undefined) return;
    const onReset = () => setInterno(defaultValue);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [defaultValue, value]);

  const abrirSelector = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <div className={cn("relative flex items-center gap-2 cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}>
      <span className={cn("flex-1 truncate", !valor && "text-gray-400")}>
        {valor ? formatValorInput(valor) : placeholder ?? (tipo === "date" ? "dd/mm/aaaa" : "dd/mm/aaaa hh:mm")}
      </span>
      <Calendar className="w-4 h-4 shrink-0 text-gray-500" />
      <input
        {...props}
        ref={inputRef}
        type={tipo}
        disabled={disabled}
        value={valor}
        onChange={(e) => {
          if (value === undefined) setInterno(e.target.value);
          onChange?.(e.target.value);
        }}
        onClick={abrirSelector}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}
